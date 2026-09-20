import { Blog } from "../models/blog.model.js";
import { uploadFile, getFileUrl, deleteFile } from "../services/s3.service.js";
// =========================
// CREATE BLOG
// =========================
const create = async (req, res) => {
  try {
    const { title, desc } = req.body;

    if (!title || !desc) {
      return res.status(400).json({
        success: false,
        message: "All fields are required!",
      });
    }

    // Upload image to S3
    let imageKey = null;

    if (req.file) {
      imageKey = await uploadFile(req.file, "blog-images");
    }

    // Create blog
    const newBlog = await Blog.create({
      title,
      desc,
      image: imageKey,
      auther: req.user._id,
    });

    // Generate signed URL
    const imageUrl = await getFileUrl(newBlog.image);

    return res.status(201).json({
      success: true,
      message: "Blog created successfully!",

      blog: {
        ...newBlog.toObject(),
        image: imageUrl,
      },
    });
  } catch (err) {
    console.error("Create Blog Error:", err);

    return res.status(500).json({
      success: false,
      message: "Something went wrong!",
    });
  }
};

// =========================
// DELETE BLOG
// =========================
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

    // Delete image from S3
    if (blog.image) {
      try {
        await deleteFile(blog.image);
      } catch (err) {
        console.warn("S3 image delete failed:", err);
      }
    }

    // Delete blog from MongoDB
    await blog.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Deleted blog successfully!",
      blog,
    });
  } catch (err) {
    console.error("Delete Blog Error:", err);

    return res.status(500).json({
      success: false,
      message: "Something went wrong!",
    });
  }
};

// =========================
// GET ALL POSTS
// =========================
const getPosts = async (req, res) => {
  try {
    const posts = await Blog.find().sort({ createdAt: -1 }).lean();

    // Generate S3 signed URLs
    const postsWithUrls = await Promise.all(
      posts.map(async (post) => ({
        ...post,
        image: await getFileUrl(post.image),
      }))
    );

    return res.status(200).json({
      success: true,
      posts: postsWithUrls,
    });
  } catch (err) {
    console.error("Get Posts Error:", err);

    return res.status(500).json({
      success: false,
      message: "Something went wrong!",
    });
  }
};

// =========================
// UPDATE BLOG
// =========================
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

    // Update text fields
    if (title) {
      post.title = title;
    }

    if (desc) {
      post.desc = desc;
    }

    // Update image
    if (req.file) {
      // Delete old image from S3
      if (post.image) {
        try {
          await deleteFile(post.image);
        } catch (err) {
          console.warn("Old S3 image delete failed:", err);
        }
      }

      // Upload new image to S3
      const newImageKey = await uploadFile(req.file, "blog-images");

      post.image = newImageKey;
    }

    await post.save();

    // Generate signed URL
    const imageUrl = await getFileUrl(post.image);

    return res.status(200).json({
      success: true,
      message: "Post updated successfully!",

      post: {
        ...post.toObject(),
        image: imageUrl,
      },
    });
  } catch (err) {
    console.error("Update Blog Error:", err);

    return res.status(500).json({
      success: false,
      message: "Something went wrong!",
    });
  }
};

export { create, deletePost, getPosts, updatePost };
