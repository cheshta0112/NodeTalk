const Post = require("../models/post");

module.exports.home = async function (req, res) {
  try {
    const posts = await Post.find({}).populate("user").exec();

    return res.render("home", {
      title: "NodeTalk | Home",
      posts: posts,
    });
  } catch (err) {
    console.error("Error fetching posts:", err);
    return res.render("error", { error: "Error fetching posts" });
  }
};
