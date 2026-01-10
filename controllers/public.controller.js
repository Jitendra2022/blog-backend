import { Blog } from "../models/blog.model.js";

const getSinglePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const findPost = await Blog.findById(postId).populate({
      path: "comments",
      populate: {
        path: "userId",
      },
    });
    if (!findPost) {
      return res.status(400).json({
        success: false,
        message: "Post not found!",
      });
    }
    return res.status(200).json({
      success: true,
      post: findPost,
    });
  } catch (e) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "something went wrong!",
    });
  }
};
export { getSinglePost };
