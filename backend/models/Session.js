const mongoose = require("mongoose");
const { boolean } = require("zod");

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    refreshTokenHash: {
      type: String,
      require: [true, "refresh Token is required"],
    },
    ip: {
      type: String,
      require: [true, "ip address is required"],
    },
    userAgent: {
      type: String,
      require: [true, "user agenet is required"],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Session", sessionSchema);
