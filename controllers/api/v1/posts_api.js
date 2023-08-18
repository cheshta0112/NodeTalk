const Post = require("../../../models/post");
const Comment = require("../../../models/comment");
module.exports.index = async function (req, res) {
  let posts = await Post.find({})
    .sort("-createdAt")
    .populate("user")
    .populate({
      path: "comments",
      populate: {
        path: "user",
      },
    });

  return res.json(200, {
    message: "List of posts",
    posts: posts,
  });
};

module.exports.destroy = async function (req, res) {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({
        message: "You cannot delete this post!",
      });
    }

    await Comment.deleteMany({ post: req.params.id });
    await post.deleteOne();

    return res.status(200).json({
      message: "Post and associated comments deleted successfully!",
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
