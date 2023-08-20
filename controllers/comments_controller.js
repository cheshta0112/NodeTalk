const Comment = require("../models/comment");
const Post = require("../models/post");
const commentsMailer = require("../mailers/comments_mailer");
const Like = require("../models/like");
const queue = require("../config/kue");
const commentEmailWorker = require("../workers/comment_email_worker");

module.exports.create = async function (req, res) {
  try {
    const post = await Post.findById(req.body.post);

    if (post) {
      const comment = await Comment.create({
        content: req.body.content,
        post: req.body.post,
        user: req.user._id,
      });

      post.comments.push(comment);
      await post.save();
      await comment.populate("user", "name email");
      // commentsMailer.newComment(comment);

      //a new job that is being put into the queue
      let job = queue.create("emails", comment).save(function (err) {
        if (err) {
          console.log("Error in sending to the queue", err);
          return;
        }
        console.log("job enqueued", job.id);
      });

      if (req.xhr) {
        // Similar for comments to fetch the user's id!
        //comment = await comment.populate("user", "name").execPopulate();
        // await comment.populate("user");

        return res.status(200).json({
          data: {
            comment: comment,
          },
          message: "Post created!",
        });
      }

      req.flash("success", "Comment published!");

      res.redirect("/");
    }
  } catch (err) {
    // Handle error appropriately
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.destroy = async function (req, res) {
  try {
    const comment = await Comment.findById(req.params.id);

    if (comment.user == req.user.id) {
      const postId = comment.post;

      await comment.deleteOne();

      let post = await Post.findByIdAndUpdate(postId, {
        $pull: { comments: req.params.id },
      });

      //destroy the associated likes for this comment
      await Like.deleteMany({ likeable: comment._id, onModel: "Comment" });

      // send the comment id which was deleted back to the views
      if (req.xhr) {
        return res.status(200).json({
          data: {
            comment_id: req.params.id,
          },
          message: "Post deleted",
        });
      }

      req.flash("success", "Comment deleted!");

      return res.redirect("back");
    } else {
      req.flash("error", "Unauthorized");
      return res.redirect("back");
    }
  } catch (err) {
    req.flash("error", err);
    console.error("Error deleting comment and updating post:", err);
    return;
  }
};
