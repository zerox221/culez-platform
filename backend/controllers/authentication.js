const express = require("express");
require("dotenv").config();
const User = require("../models/User");
const Session = require("../models/Session");
const otpGenrator = require("otp-generator");
const bcrypt = require("bcrypt");
const redis = require("../configs/redis_connection");
const jwt = require("jsonwebtoken");
const Profile = require("../models/Profile");
const crypto = require("crypto");

const { registerSchema } = require("../validator/user.validator");
const { shareOtp, forgetPasswordOtp } = require("../services/Email");
const { success } = require("zod");

const otpKey = (email) => {
  return `otp:${email}`;
};

const userKey = (email) => {
  return `user:${email}`;
};

const forgetPasswordKey = (token) => {
  return `forgetPassword:${token}`;
};

exports.registerController = async (req, res) => {
  try {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        errors: result.error.issues,
      });
    }

    const { name, email, password, college } = result.data;

    //checking if user is already exists or not
    const user = await User.findOne({ email });

    //if exists then return error
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    //hash the password
    let hashPassword;
    try {
      hashPassword = await bcrypt.hash(password, 10);
    } catch (error) {
      console.log("Error while hashing the password at registration");
      return res.status(400).json({
        success: false,
        message: "internal server error while registration",
      });
    }

    //genrating otp
    const otp = otpGenrator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    const userObject = {
      name,
      email,
      password: hashPassword,
      college,
    };

    // now saving otp and user data in redis seprately
    await redis.set(otpKey(email), otp, "EX", 120);
    await redis.set(userKey(email), JSON.stringify(userObject), "EX", 600);

    shareOtp(email, otp, name);

    res.status(200).json({
      success: true,
      message: "User not verified yet",
    });
  } catch (error) {
    console.log("error : ", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.verifyController = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "invalid email or otp",
      });
    }

    //check is otp exists or not
    const realOtp = await redis.get(otpKey(email));

    console.log("real otp : ", realOtp);

    if (!realOtp) {
      return res.status(400).json({
        success: false,
        message: "otp is expired",
      });
    }

    if (realOtp === otp) {
      const userData = await redis.get(userKey(email));
      if (!userData) {
        return res.status(401).json({
          success: false,
          message: "user is expired",
        });
      }
      const parsedData = JSON.parse(userData);

      //adding profile picture of user
      const profile = await Profile.create({
        profilePicture: `https://api.dicebear.com/10.x/moods/svg?seed=${parsedData.name}`,
      });

      //creating user obect
      const user = await User.create({
        name: parsedData.name,
        email: parsedData.email,
        college: parsedData.college,
        password: parsedData.password,
        profile: profile._id,
      });

      //delete data from the redis
      await redis.del(userKey(email));

      //payload for json web tokens
      const payload = {
        id: user._id,
        email,
      };

      //generate access and refresh tokens
      const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      const refreshTokenHash = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");

      const session = await Session.create({
        user: user._id,
        refreshTokenHash,
        ip: req.ip,
        userAgent: req.headers["user-Agent"],
      });

      //stroing sesssion id inside access token
      payload.sessionId = session._id;

      const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "15m",
      });

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        message: "user is verified",
      });
    } else {
      res.status(401).json({
        success: true,
        message: "incorrect otp",
      });
    }
  } catch (err) {
    console.log("error : ", err.message);
    res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

exports.logInController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "email or password not exists",
      });
    }

    //check user exists or not

    const user = await User.findOne({ email });

    //if not exists give error
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const comparePassword = await bcrypt.compare(password, user.password);

    if (!comparePassword) {
      return res.status(401).json({
        success: false,
        message: "invalid email or password",
      });
    }

    const payload = {
      id: user._id,
      email,
    };

    //genrating refreshToken
    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const session = await Session.create({
      user: user._id,
      refreshTokenHash,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    payload.sessionId = session._id;

    //genrating accesstoken
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: false,
      message: "login successfully",
      user: user.name,
    });
  } catch (error) {
    console.log("error in login controller : ", error.message);
    res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

exports.getMeController = async (req, res) => {
  try {
    const { id } = req.user;
    if (!id) {
      return res.status(400).josn({
        success: false,
        message: "Invaild id login again",
      });
    }

    const user = await User.findById(id).select("-password -_id");

    res.status(200).json({
      success: true,
      message: "user feched successfully",
      user,
    });
  } catch (error) {
    console.log("error while geting user data : ", error.message);
    res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

exports.rotateTokenController = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Invalid refreshToken 1",
      });
    }

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const session = await Session.findOne({
      refreshTokenHash: refreshTokenHash,
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Invalid refreshToken 2",
      });
    }

    const decode = jwt.verify(refreshToken, process.env.JWT_SECRET);

    console.log("decoded : ", decode);

    if (!decode) {
      return res.status(401).json({
        success: false,
        message: "invaild refreshToken",
      });
    }

    const payload = {
      id: decode.id,
      email: decode.email,
    };

    const newRefreshToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    payload.sessionId = session._id;

    const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    const newRefreshTokenHash = crypto
      .createHash("sha256")
      .update(newRefreshToken)
      .digest("hex");

    session.refreshTokenHash = newRefreshTokenHash;

    session.save();

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: true,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Token rotated sucessfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.logOutController = async (req, res) => {
  try {
    const { sessionId } = req.user;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "invalid session id",
      });
    }

    const session = await Session.findByIdAndDelete(sessionId);

    console.log("session : ", session);

    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");

    res.status(200).json({
      success: true,
      message: "log out successfully",
    });
  } catch (error) {
    console.log("error : ", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.logoutAllController = async (req, res) => {
  try {
    const { id } = req.user;
    if (!id) {
      return res.status(400).josn({
        success: false,
        message: "Invalid user",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Invalid user",
      });
    }

    await Session.deleteMany({
      user: user._id,
    });

    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");

    res.status(200).json({
      success: true,
      message: "Log out from all devices successfully",
    });
  } catch (error) {
    console.log("error while logOut from all devices : ", error.message);
    res.status(500).json({
      success: true,
      message: "Internal server error",
    });
  }
};

exports.reshareOtpController = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Invalid email",
      });
    }

    const user = await redis.get(userKey(email));

    const userData = JSON.parse(user);

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "user data is expired please register again",
      });
    }

    const otp = otpGenrator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    await redis.set(otpKey(email), otp);

    console.log("new otp is here : ");
    shareOtp(email, otp, userData.name);

    res.status(200).json({
      success: true,
      message: "otp shared successfully",
    });
  } catch (error) {
    console.log("error while sharing sharing otp : ", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.ShareOtpForForgetPasswordController = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Invalid email",
      });
    }

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Invalid email",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    console.log("token : ", token);

    //saving token in redis with user id

    await redis.set(forgetPasswordKey(token), user._id, "EX", 600);

    const url = `${process.env.FRONTEND_BASE_URL}/forget/password/${token}`;

    forgetPasswordOtp(email, url, user.name);

    res.status(200).json({
      success: true,
      message: "link shared successfully",
    });
  } catch (error) {
    console.log("Error in sharing otp for forget password : ", error.message);
    res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

exports.forgetPasswordController = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const userId = await redis.get(forgetPasswordKey(token));

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Invalid url cannot reset password",
      });
    }

    //hashPassword
    const passwordHash = await bcrypt.hash(newPassword, 10);

    const user = await User.findByIdAndUpdate(
      userId,
      {
        password: passwordHash,
      },
      { returnDocument: "after" },
    );

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "User not exists",
      });
    }

    res.status(200).json({
      success: true,
      mssage: "password updated successfully",
    });

  } catch (err) {
    console.log("error in forget password controller : ", err.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


