import fs from "fs";
import path from "path";
import { Blog } from "../models/blog.model.js";
const create = async (req, res) => {
  try {
    const { title, desc } = req.body;
    if (!title || !desc) {
      return res.status(400).json({
        success: false,
        message: "all fileds are required!",
      });
    }
    const imagePath = req.file?.filename;
    const newBlog = await Blog.create({
      title,
      desc,
      image: imagePath,
      auther: req.user._id,
    });
    return res.status(201).json({
      success: true,
      message: "Blog created successfully!",
      blog: newBlog,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "something went wrong!",
    });
  }
};
const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const checkExistingPost = await Blog.findByIdAndDelete(postId);
    if (!checkExistingPost) {
      return res.status(400).json({
        success: false,
        message: "User not found!",
      });
    }
    if (checkExistingPost.image) {
      const imagePath = path.join(
        "uploads/blog-images",
        checkExistingPost.image
      );
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // remove file
      }
    }
    return res.status(200).json({
      success: true,
      message: "Deleted blog successfully!",
      blog: checkExistingPost,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "something went wrong!",
    });
  }
};
const getPosts = async (req, res) => {
  try {
    const posts = await Blog.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      posts,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "something went wrong!",
    });
  }
};
const updatePost = async (req, res) => {
  try {
    const title = req.body?.title;
    const desc = req.body?.desc;
    const postId = req.params.id;
    const post = await Blog.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found!",
      });
    }
    // Update fields if provided
    if (title) post.title = title;
    if (desc) post.desc = desc;
    // Update image if uploaded
    if (req.file) {
      // Optional: Delete old image from disk
      if (post.image) {
        const oldImagePath = path.join("uploads/blog-images", post.image);
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }
      post.image = req.file.filename;
    }
    await post.save();
    return res.status(200).json({
      success: true,
      message: "Post updated successfully!",
      post,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "something went wrong!",
    });
  }
};
export { create, deletePost, getPosts, updatePost };
