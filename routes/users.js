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
      // Fetch user's blogs
      const userBlogs = await Blog.findAll({
        where: { userid: req.user.userId || req.user.id },
        include: [
          {
            model: User,
            as: "User",
            attributes: ["id", "userName"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      res.render("profile", { user: req.user, blogs: userBlogs });
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

// Refresh token (API)
router.post("/api/refresh", userController.refreshTokenApi);

// API endpoint for getting user profile
router.get(
  "/api/profile",
  userController.verifyToken,
  userController.getProfile
);

// API endpoint for getting user's blogs
router.get("/api/blogs", userController.verifyToken, async function (req, res) {
  try {
    const userBlogs = await Blog.findAll({
      where: { userid: req.user.userId || req.user.id },
      include: [
        {
          model: User,
          as: "User",
          attributes: ["id", "userName"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.json({
      success: true,
      blogs: userBlogs.map((blog) => blog.toJSON()),
    });
  } catch (error) {
    console.error("Error fetching user blogs:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user blogs",
      error: error.message,
    });
  }
});

module.exports = router;
