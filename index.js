const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const port = 8000;
const expressLayouts = require("express-ejs-layouts");
const db = require("./config/mongoose");
// used for session cookie
const session = require("express-session");
const passport = require("passport");
const passportLocal = require("./config/passport-local-strategy");
const passportJWT = require("./config/passport-jwt-strategy");
const passportGoogle = require("./config/passport-google-oauth2-strategy");

const MongoStore = require("connect-mongo")(session);
const flash = require("connect-flash");
const customMware = require("./config/middleware");

// setup the chat server to be used with socket.io
const chatServer = require("http").Server(app);
const chatSockets = require("./config/chat_sockets").chatSockets(chatServer);
chatServer.listen(5000);
console.log("chat server is listening on port 5000");

const Toastify = require("toastify-js");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("./assets"));
// make the uploads path available to the browser
app.use("/uploads", express.static(__dirname + "/uploads"));

app.use(expressLayouts);
//extract styles and scripts from sub pages into the layout
app.set("layout extractStyles", true);
app.set("layout extractScripts", true);

//set up the view engine
app.set("view engine", "ejs");
app.set("views", "./views");

app.use(
  session({
    name: "nodetalk",
    // TODO change the secret before deployment in production mode
    secret: "something",
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 1000 * 60 * 100,
    },
    store: new MongoStore(
      {
        mongooseConnection: db,
        autoRemove: "disabled",
      },
      function (err) {
        console.log(err || "connect-mongodb setup ok");
      }
    ),
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(passport.setAuthenticatedUser);
app.use(flash());
app.use(customMware.setFlash);

//use express router
app.use("/", require("./routes"));

app.listen(port, function (err) {
  if (err) {
    console.log(`error in running the server:${err}`);
  }
  console.log(`server is runnng on port:${port}`);
});
