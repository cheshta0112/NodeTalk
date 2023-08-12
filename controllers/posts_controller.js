const Post = require("../models/post");
const comment = require("../models/comment");

module.exports.create = async function (req, res) {
  try {
    const post = await Post.create({
      content: req.body.content,
      user: req.user._id,
    });

    return res.redirect("back");
  } catch (err) {
    console.log("error in creating a post:", err);
    return res.status(500).send("Error creating post");
  }
};

module.exports.destroy = async function (req, res) {
  try {
    const post = await Post.findById(req.params.id);
    // .id means converting the object id into string
    if (post.user == req.user.id) {
      await post.deleteOne();

      await comment.deleteMany({ post: req.params.id });

      return res.redirect("back");
    } else {
      return res.redirect("back");
    }
  } catch (err) {
    console.error("Error deleting post:", err);
    return res.render("error", { error: "Error deleting post" });
  }
};
