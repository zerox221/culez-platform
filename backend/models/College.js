const mongoose = require("mongoose");

const collegeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, "college name is required"],
    },
    location: {
      type: String,
      require: [true, "college location is rquired"],
    },
    descrption: {
      type: String,
      require: [true, "college description is required"],
    },
    students: {
      type: Number,
      default: 0,
    },
    courses: [
      {
        type: String,
        default: [],
      },
    ],
    officialLinks: [
      {
        type: String,
        default: [],
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("College", collegeSchema);
