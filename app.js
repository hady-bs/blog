var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var blogsRouter = require("./routes/blogs");
const userController = require("./controllers/UserController");

var app = express();
const sequelize = require("./db");
const User = require("./models/UsersModel");
const Blog = require("./models/BlogModel");

// Run migrations on startup
(async () => {
  try {
    console.log("Running migrations...");
    await require("./scripts/migrate_blogs_add_columns")();
    await require("./scripts/migrate_blogs_timestamps")();
    console.log("All migrations completed successfully");
  } catch (error) {
    console.error("Migration failed:", error.message);
    // Don't exit process, just log the error and continue
    console.log("Continuing without migrations...");
  }
})();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(cors()); // Enable CORS for React Native app
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Optional verify token for all requests to expose current user to views
app.use(userController.optionalVerifyToken);
app.use(function (req, res, next) {
  // normalize currentUser for layout (layout expects currentUser.username)
  res.locals.currentUser = req.user ? { username: req.user.userName } : null;
  next();
});

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/blogs", blogsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});
sequelize
  .authenticate()
  .then(() => console.log("dataBase success"))
  .catch((err) => console.log(err));

module.exports = app;
