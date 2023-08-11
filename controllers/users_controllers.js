// module.exports.profile = function (req, res) {
//   res.end("<h1> users profile </h1>");
// };
const User = require("../models/users");

module.exports.profile = function (req, res) {
  return res.render("user_profile", {
    title: "User Profile",
  });
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
    return res.redirect("back");
  }

  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return User.create(req.body);
      } else {
        return Promise.reject("User already exists"); // or handle as needed
      }
    })
    .then((newUser) => {
      return res.redirect("/users/sign-in");
    })
    .catch((error) => {
      console.error("Error in user creation:", error);
      return res.redirect("back");
    });
};

// sign in and create a session for the user
module.exports.createSession = function (req, res) {
  return res.redirect("/");
};
