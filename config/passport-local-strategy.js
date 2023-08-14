const passport = require("passport");

const LocalStrategy = require("passport-local").Strategy;

const User = require("../models/users");

// authentication using passport

//find the user and authenticate it
passport.use(
  new LocalStrategy( //it uses this strategy for authentication
    {
      usernameField: "email",
      passReqToCallback: true,
    },
    async function (req, email, password, done) {
      try {
        const user = await User.findOne({ email: email });

        if (!user || user.password != password) {
          req.flash("error", "Invalid Username/Password");
          console.log("Invalid Username/Password");
          return done(null, false);
        }
        return done(null, user);
      } catch (err) {
        req.flash("error", err);
        console.log("Error in finding user --> Passport");
        return done(err);
      }
    }
  )
);

// serializing the user to decide which key is to be kept in the cookies
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

// deserializing the user from the key in the cookies
passport.deserializeUser(async function (id, done) {
  try {
    const user = await User.findById(id).exec();
    if (!user) {
      console.log("User not found");
      return done(null, false);
    }
    return done(null, user);
  } catch (err) {
    console.log("Error in finding user --> Passport");
    return done(err);
  }
});

// check if the user is authenticated
passport.checkAuthentication = function (req, res, next) {
  // if the user is signed in, then pass on the request to the next function(controller's action)
  if (req.isAuthenticated()) {
    return next();
  }

  // if the user is not signed in
  return res.redirect("/users/sign-in");
};

passport.setAuthenticatedUser = function (req, res, next) {
  if (req.isAuthenticated()) {
    // req.user contains the current signed in user from the session cookie and we are just sending this to the locals for the views
    res.locals.user = req.user;
  }

  next();
};

module.exports = passport;
