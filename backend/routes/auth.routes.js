const express = require('express');
const { registerController, verifyController, logInController, getMeController, rotateTokenController, logOutController, logoutAllController, reshareOtpController, forgetPasswordController, ShareOtpForForgetPasswordController } = require('../controllers/authentication');
const { authMiddleware } = require('../middlewares/auth.middleware');
const authRouter = express.Router();

authRouter.post("/register",registerController);
authRouter.post("/verify",verifyController);
authRouter.post("/login",logInController);
authRouter.get("/get/me",authMiddleware,getMeController);
authRouter.get("/rotate/token",authMiddleware,rotateTokenController);
authRouter.get("/logout",authMiddleware,logOutController);
authRouter.get("/logout/all",authMiddleware,logoutAllController);
authRouter.get("/reshare/otp",reshareOtpController)
authRouter.post("/forgot-password-link",ShareOtpForForgetPasswordController);
authRouter.put("/reset-password",forgetPasswordController);

module.exports = authRouter;