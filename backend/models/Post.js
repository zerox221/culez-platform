const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    titel: {
      type: String,
      require: [true, "titel for the post is required"],
    },
    description: {
      type: String,
      require: [true, "description for the post is required"],
    },
    coverImage: {
      type: String,
      require: [true, "image for the post is required"],
    },
    techStack: [
      {
        type: String,
        require: [true, "mention tech stack for the project"],
      },
    ],
    category: {
      type: String,
      require: [true, "Enter the category of the project"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Like",
      },
    ],
    saves: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Save",
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Post", postSchema);
