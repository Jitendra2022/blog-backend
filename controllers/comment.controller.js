import { Blog } from "../models/blog.model.js";
import { Comments } from "../models/comments.model.js";

const addComment = async (req, res) => {
  try {
    const { postId, comment, parentComment } = req.body;

    // Check post
    const existPost = await Blog.findById(postId);
    if (!existPost) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found!",
      });
    }

    // Optional: Validate parent comment
    if (parentComment) {
      const parent = await Comments.findById(parentComment);
      if (!parent) {
        return res.status(404).json({
          success: false,
          message: "Parent comment not found!",
        });
      }
    }

    const newComment = await Comments.create({
      postId,
      userId: req.user._id,
      comment,
      parentComment: parentComment || null,
    });

    // Only push top-level comments to blog
    if (!parentComment) {
      existPost.comments.push(newComment._id);
      await existPost.save();
    }

    return res.status(201).json({
      success: true,
      message: parentComment
        ? "Reply added successfully!"
        : "Comment added successfully!",
      comment: newComment,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong!",
    });
  }
};

export { addComment };
