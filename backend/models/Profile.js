const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  profilePicture: {
    type: String,
    default: "",
  },
  profileId : {
    type : String,
    default : ""
  },
  bio: {
    type: String,
    default: "",
  },
  skills: [
    {
      type: String,
    },
  ],
  achievements: [
    {
      type: String,
    },
  ],
  socialMediaLinks: [
    {
      type: String,
    },
  ],
  codingProfiles: [
    {
      type: String,
    },
  ],
  score: {
    type: Number,
  },
});

module.exports = mongoose.model("Profile", profileSchema);
