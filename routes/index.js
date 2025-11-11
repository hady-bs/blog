var express = require("express");
var router = express.Router();
const Blog = require("../models/BlogModel");
const userController = require("../controllers/UserController");
const BlogController = require("../controllers/BlogController");

/* GET home page. */
router.get(
  "/",
  userController.optionalVerifyToken,
  async function (req, res, next) {
    try {
      console.log("🏠 Home route hit!");
      console.log("👤 req.user:", req.user || "No user (guest)");

      let blogs = await BlogController.fetchBlogsForView(req.user ? null : 3);

      console.log("📚 Blogs fetched:", blogs.length);
      console.log("📝 Blogs data:", JSON.stringify(blogs, null, 2));

      res.render("index", {
        title: "Express",
        blogs: blogs,
        user: req.user,
      });
    } catch (err) {
      console.error("💥 Error in home route:", err.message);
      next(err);
    }
  }
);

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

/* GET API docs page. */
router.get("/docs", function (req, res, next) {
  res.render("docs", { title: "API Documentation" });
});

module.exports = router;
