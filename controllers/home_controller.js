const Post = require("../models/post");
const User = require("../models/users");

module.exports.home = async function (req, res) {
  try {
    const posts = await Post.find({})
      .populate("user")
      .populate({
        path: "comments",
        populate: {
          path: "user",
        },
      })
      .exec(); // Move the .exec() here

    const users = await User.find({}); // Use await for fetching users as well

    return res.render("home", {
      title: "NodeTalk | Home",
      posts: posts,
      all_users: users,
    });
  } catch (err) {
    console.error("Error fetching posts and users:", err);
    return res.render("error", { error: "Error fetching posts and users" });
  }
};
