var express = require("express");
var router = express.Router();
const blogController = require("../controllers/BlogController");
const userController = require("../controllers/UserController");

// List blogs
router.get("/", blogController.listBlogs);

// List blogs with pagination
router.get("/all", blogController.listBlogsPaginated);

// Show new blog form (protected)
router.get("/new", userController.verifyToken, function (req, res) {
  res.render("new_post", { user: req.user });
});

// Create a blog - protected by JWT verify middleware
router.post("/", userController.verifyToken, blogController.createBlog);

module.exports = router;
