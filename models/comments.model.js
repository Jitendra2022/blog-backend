import mongoose from "mongoose";
const CommentSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comments",
      // top-level comment
      default: null,
    },
  },
  { timestamps: true }
);
export const Comments = mongoose.model("Comments", CommentSchema);
