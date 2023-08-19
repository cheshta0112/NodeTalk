const User = require("../models/users");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const queue = require("../config/kue");
const userEmailWorker = require("../workers/user_email_worker");

// module.exports.profile = function (req, res) {
//   res.end("<h1> users profile </h1>");
// };

module.exports.profile = async function (req, res) {
  try {
    const user = await User.findById(req.params.id);

    return res.render("user_profile", {
      title: "User Profile",
      profile_user: user,
    });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    return res.render("error", { error: "Error fetching user profile" });
  }
};

module.exports.update = async function (req, res) {
  try {
    // if (req.user.id == req.params.id) {
    //   await User.findByIdAndUpdate(req.params.id, req.body);
    //   req.flash("success", "Updated!");
    //   return res.redirect("back");
    // } else {
    //   req.flash("error", "Unauthorized!");
    //   return res.status(401).send("Unauthorized");
    // }

    let user = await User.findById(req.params.id);
    User.uploadedAvatar(req, res, function (err) {
      if (err) {
        console.log("*****Multer Error: ", err);
      }

      user.name = req.body.name;
      user.email = req.body.email;

      if (req.file) {
        if (user.avatar) {
          fs.unlinkSync(path.join(__dirname, "..", user.avatar));
        }

        // this is saving the path of the uploaded file into the avatar field in the user
        user.avatar = User.avatarPath + "/" + req.file.filename;
      }
      user.save();
      return res.redirect("back");
    });
  } catch (err) {
    console.error("Error updating user:", err);
    return res.render("error", { error: "Error updating user" });
  }
};

// render the sign up page
module.exports.signUp = function (req, res) {
  if (req.isAuthenticated()) {
    return res.redirect("/users/profile");
  }
  return res.render("user_sign_up", {
    title: "NodeTalk | Sign Up",
  });
};

// render the sign in page
module.exports.signIn = function (req, res) {
  if (req.isAuthenticated()) {
    return res.redirect("/users/profile");
  }
  return res.render("user_sign_in", {
    title: "NodeTalk| Sign In",
  });
};

// get the sign up data
module.exports.create = function (req, res) {
  if (req.body.password !== req.body.confirm_password) {
    req.flash("error", "Passwords do not match");
    return res.redirect("back");
  }

  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        req.flash("error", err);
        return User.create(req.body);
      } else {
        return Promise.reject("User already exists");
      }
    })
    .then((newUser) => {
      req.flash("success", "You have signed up, login to continue!");
      return res.redirect("/users/sign-in");
    })
    .catch((error) => {
      req.flash("error", error);
      console.error("Error in user creation:", error);
      return res.redirect("back");
    });
};

// sign in and create a session for the user
module.exports.createSession = function (req, res) {
  req.flash("success", "loged in sucessfully");
  return res.redirect("/");
};

module.exports.destroySession = function (req, res) {
  req.logout(function (err) {
    if (err) {
      console.log("error");
      return next(err);
    }
    req.flash("success", "you have loged out");
    return res.redirect("/");
  });
};

module.exports.resetPassword = function (req, res) {
  return res.render("reset_password", {
    title: "NodeTalk | Reset Password",
    access: false,
  });
};

module.exports.resetPassMail = async function (req, res) {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      if (user.isTokenValid == false) {
        user.accessToken = crypto.randomBytes(30).toString("hex");
        user.isTokenValid = true;
        await user.save();
      }

      let job = queue.create("user-emails", user).save();

      req.flash("success", "Password reset link sent. Please check your mail");
      return res.redirect("/");
    } else {
      req.flash("error", "User not found. Try again!");
      return res.redirect("back");
    }
  } catch (err) {
    console.log("Error in finding user", err);
    // Handle the error as needed
    // You can send an error response to the client or log it for debugging
    // Example: res.status(500).send("Internal Server Error");
  }
};

module.exports.setPassword = async function (req, res) {
  try {
    const user = await User.findOne({ accessToken: req.params.accessToken });
    if (user.isTokenValid) {
      return res.render("reset_password", {
        title: "Codeial | Reset Password",
        access: true,
        accessToken: req.params.accessToken,
      });
    } else {
      req.flash("error", "Link expired");
      return res.redirect("/users/reset-password");
    }
  } catch (err) {
    console.log("Error in finding user", err);
    // Handle the error as needed
  }
};

module.exports.updatePassword = async function (req, res) {
  try {
    const user = await User.findOne({ accessToken: req.params.accessToken });
    if (user.isTokenValid) {
      if (req.body.newPass == req.body.confirmPass) {
        user.password = req.body.newPass;
        user.isTokenValid = false;
        await user.save();
        req.flash("success", "Password updated. Login now!");
        return res.redirect("/users/sign-in");
      } else {
        req.flash("error", "Passwords don't match");
        return res.redirect("back");
      }
    } else {
      req.flash("error", "Link expired");
      return res.redirect("/users/reset-password");
    }
  } catch (err) {
    console.log("Error in finding user", err);
    // Handle the error as needed
  }
};
