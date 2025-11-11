var express = require("express");
var router = express.Router();
const blogController = require("../controllers/BlogController");
const userController = require("../controllers/UserController");

// Web routes - always render views
// List blogs
router.get("/", function (req, res) {
  blogController.listBlogsWeb(req, res);
});

// List blogs with pagination
router.get("/all", function (req, res) {
  blogController.listBlogsPaginatedWeb(req, res);
});

// Show new blog form (protected)
router.get("/new", userController.verifyToken, function (req, res) {
  res.render("new_post", { user: req.user });
});

// Create a blog - protected by JWT verify middleware (web)
router.post("/", userController.verifyToken, function (req, res) {
  blogController.createBlogWeb(req, res);
});

// API routes - always return JSON
// Get all blogs
router.get("/api", blogController.listBlogsApi);

// Get blogs with pagination
router.get("/api/all", blogController.listBlogsPaginatedApi);

// Create a blog - protected by JWT verify middleware (API)
router.post("/api", userController.verifyToken, blogController.createBlogApi);

// Get a single blog by ID
router.get("/api/:id", blogController.getBlogById);

// Update a blog - protected by JWT verify middleware
router.put("/api/:id", userController.verifyToken, blogController.updateBlog);

// Delete a blog - protected by JWT verify middleware
router.delete(
  "/api/:id",
  userController.verifyToken,
  blogController.deleteBlog
);

module.exports = router;
