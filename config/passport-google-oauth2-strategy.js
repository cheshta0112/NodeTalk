const passport = require("passport");
const googleStrategy = require("passport-google-oauth").OAuth2Strategy;
const crypto = require("crypto");
const User = require("../models/users");

// tell passport to use a new strategy for google login
passport.use(
  new googleStrategy(
    {
      clientID:
        "277064795300-bij1a3sa5e4mr48n904hcp9s0m333ib0.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "http://localhost:8000/users/auth/google/callback",
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find a user using the promise returned by .exec()
        const user = await User.findOne({
          email: profile.emails[0].value,
        }).exec();

        if (user) {
          // If found, set this user as req.user
          return done(null, user);
        } else {
          // If not found, create the user and set it as req.user
          const newUser = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            password: crypto.randomBytes(20).toString("hex"),
          });

          return done(null, newUser);
        }
      } catch (err) {
        console.log("error in google strategy-passport", err);
        return done(err, false);
      }
    }
  )
);

module.exports = passport;
