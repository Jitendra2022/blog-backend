import { Blog } from "../models/blog.model.js";
import cloudinary from "../utils/cloudinary.js";
const create = async (req, res) => {
  try {
    const { title, desc } = req.body;
    if (!title || !desc) {
      return res.status(400).json({
        success: false,
        message: "All fields are required!",
      });
    }
    // ✅ Cloudinary values
    const imageUrl = req.file ? req.file.path : null;
    const imagePublicId = req.file ? req.file.filename : null;

    const newBlog = await Blog.create({
      title,
      desc,
      image: imageUrl,
      imagePublicId, // ✅ store public_id
      auther: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Blog created successfully!",
      blog: newBlog,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong!",
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;

    const blog = await Blog.findById(postId);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found!",
      });
    }

    // ✅ Delete image from Cloudinary
    if (blog.imagePublicId) {
      await cloudinary.uploader.destroy(blog.imagePublicId);
    }

    await blog.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Deleted blog successfully!",
      blog,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong!",
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
    const { title, desc } = req.body;
    const postId = req.params.id;

    const post = await Blog.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found!",
      });
    }

    // ✅ Update text fields
    if (title) post.title = title;
    if (desc) post.desc = desc;

    // ✅ Update image (Cloudinary)
    if (req.file) {
      // delete old image from Cloudinary
      if (post.imagePublicId) {
        try {
          await cloudinary.uploader.destroy(post.imagePublicId);
        } catch (err) {
          console.warn("Old image delete failed", err);
        }
      }

      // set new Cloudinary values
      post.image = req.file.path; // secure URL
      post.imagePublicId = req.file.filename; // public_id
    }

    await post.save();

    return res.status(200).json({
      success: true,
      message: "Post updated successfully!",
      post,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong!",
    });
  }
};

export { create, deletePost, getPosts, updatePost };
