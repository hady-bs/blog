var express = require("express");
const User = require("../models/UsersModel");
var router = express.Router();
const userController = require("../controllers/UserController");
const Blog = require("../models/BlogModel");
const BlogController = require("../controllers/BlogController");

// Web routes - always render views
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

router.post("/", userController.addUserWeb);

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

router.post("/login", userController.loginUserWeb);

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

// Logout route (web)
router.post("/logout", userController.logoutWeb);

// API routes - always return JSON
// Register user (API)
router.post("/api/register", userController.addUserApi);

// Login user (API)
router.post("/api/login", userController.loginUserApi);

// Logout user (API)
router.post("/api/logout", userController.logoutApi);

// API endpoint for getting user profile
router.get(
  "/api/profile",
  userController.verifyToken,
  userController.getProfile
);

module.exports = router;
