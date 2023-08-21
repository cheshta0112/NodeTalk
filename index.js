const express = require("express");
const cors = require("cors"); // Import the cors module
const http = require("http"); // Import the http module
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

const Toastify = require("toastify-js");
// const chatSockets = require("./config/chat_sockets");

app.use(cors());
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

// Create an HTTP server instance
const httpServer = http.createServer(app);

// Set up the socket.io server with CORS
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "http://localhost:8000", // Specify the correct origin of your frontend
    methods: ["GET", "POST"],
    credentials: true, // If your frontend sends credentials (cookies, headers), set this to true
  },
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("disconnect", function () {
    console.log("socket disconnected!");
  });
});

// // Import your chatSockets module
// const chatSockets = require("./config/chat_sockets");

// // Use your chatSockets module to set up chat functionality
// chatSockets.chatSockets(httpServer);

// Listen on port 5000
httpServer.listen(5000, () => {
  console.log("server is running on port 5000");
});

app.listen(port, function (err) {
  if (err) {
    console.log(`error in running the server:${err}`);
  }
  console.log(`server is runnng on port:${port}`);
});
