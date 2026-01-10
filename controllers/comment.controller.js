import { Blog } from "../models/blog.model.js";
import { Comments } from "../models/comments.model.js";

const addComment = async (req, res) => {
  try {
    const { postId, comment } = req.body;
    const newComment = await Comments.create({
      postId,
      userId: req.user._id,
      comment,
    });
    await newComment.save();
    const existPost = await Blog.findById(postId);
    if (!existPost) {
      return res.status(400).json({
        success: false,
        message: "Blog post not found!",
      });
    }
    existPost.comments.push(newComment._id);
    await existPost.save();
    return res.status(201).json({
      success: true,
      message: "Comment added successfully!",
      comment: newComment,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "something went wrong!",
    });
  }
};
export { addComment };
