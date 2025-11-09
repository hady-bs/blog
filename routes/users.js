var express = require("express");
const User = require("../models/UsersModel");
var router = express.Router();
const userController = require("../controllers/UserController");
const Blog = require("../models/BlogModel");
const BlogController = require("../controllers/BlogController");

// Registration page - show blogs optionally
router.get(
  "/",
  userController.optionalVerifyToken,
  async function (req, res, next) {
    try {
      let blogs = [];
      if (req.user) {
        blogs = await BlogController.fetchBlogsForView();
      } else {
        blogs = await BlogController.fetchBlogsForView(3);
      }
      res.render("user", { blogs: blogs, user: req.user });
    } catch (err) {
      next(err);
    }
  }
);

router.post("/", userController.addUser);

// Login page - show blogs optionally
router.get(
  "/login",
  userController.optionalVerifyToken,
  async function (req, res, next) {
    try {
      let blogs = [];
      if (req.user) {
        blogs = await BlogController.fetchBlogsForView();
      } else {
        blogs = await BlogController.fetchBlogsForView(3);
      }
      res.render("login", { blogs: blogs, user: req.user });
    } catch (err) {
      next(err);
    }
  }
);

router.post("/login", userController.loginUser);

// Profile page
router.get(
  "/profile",
  userController.verifyToken,
  async function (req, res, next) {
    try {
      // Fetch user data if needed, but since req.user has it, just render
      res.render("profile", { user: req.user });
    } catch (err) {
      next(err);
    }
  }
);

// Logout route
router.post("/logout", userController.logout);

module.exports = router;
