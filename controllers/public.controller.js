import { Blog } from "../models/blog.model.js";
import { Comments } from "../models/comments.model.js";
import { getFileUrl } from "../services/s3.service.js";

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

    // 2️⃣ Get all comments
    // password ko response se remove kar diya
    const allComments = await Comments.find({ postId })
      .populate("userId", "-password")
      .lean();

    // 3️⃣ Convert post image S3 key → Signed URL
    if (post.image) {
      post.image = await getFileUrl(post.image);
    }

    // 4️⃣ Convert user profile S3 key → Signed URL
    const profileCache = new Map();

    await Promise.all(
      allComments.map(async (comment) => {
        const profileKey = comment.userId?.profile;

        if (!profileKey) return;

        // Same profile already converted
        if (profileCache.has(profileKey)) {
          comment.userId.profile = profileCache.get(profileKey);
          return;
        }

        // Generate signed URL
        const profileUrl = await getFileUrl(profileKey);

        // Cache URL
        profileCache.set(profileKey, profileUrl);

        comment.userId.profile = profileUrl;
      })
    );

    // 5️⃣ Build comment map
    const commentMap = {};

    allComments.forEach((comment) => {
      comment.replies = [];

      commentMap[comment._id.toString()] = comment;
    });

    // 6️⃣ Build comment tree
    const rootComments = [];

    allComments.forEach((comment) => {
      if (comment.parentComment) {
        const parentId = comment.parentComment.toString();

        if (commentMap[parentId]) {
          commentMap[parentId].replies.push(comment);
        }
      } else {
        rootComments.push(comment);
      }
    });

    // 7️⃣ Attach comments to post
    post.comments = rootComments;

    // 8️⃣ Send response
    return res.status(200).json({
      success: true,
      post,
    });
  } catch (err) {
    console.error("Get Single Post Error:", err);

    return res.status(500).json({
      success: false,
      message: "Something went wrong!",
    });
  }
};

export { getSinglePost };
