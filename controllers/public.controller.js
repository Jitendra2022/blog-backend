import { Blog } from "../models/blog.model.js";
import { Comments } from "../models/comments.model.js";

const getSinglePost = async (req, res) => {
  try {
    const postId = req.params.id;

    // 1️⃣ Get post
    const post = await Blog.findById(postId).lean();
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found!",
      });
    }

    // 2️⃣ Get all comments of this post
    const allComments = await Comments.find({ postId })
      .populate("userId")
      .lean();

    // 3️⃣ Build comment map
    const commentMap = {};
    allComments.forEach((c) => {
      c.replies = [];
      commentMap[c._id.toString()] = c;
    });

    // 4️⃣ Build tree
    const rootComments = [];

    allComments.forEach((c) => {
      if (c.parentComment) {
        const parentId = c.parentComment.toString();
        if (commentMap[parentId]) {
          commentMap[parentId].replies.push(c);
        }
      } else {
        rootComments.push(c);
      }
    });

    // 5️⃣ Attach comments to post
    post.comments = rootComments;

    return res.status(200).json({
      success: true,
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

export { getSinglePost };
