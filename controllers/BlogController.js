const Blog = require("../models/BlogModel");
const User = require("../models/UsersModel");
const UserController = require("./UserController");
const sequelize = require("../db");

class BlogController {
  // Helper: return array of column names for blogs table
  static async getBlogColumns() {
    try {
      const [results] = await sequelize.query(
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'blogs' AND table_schema = 'public'"
      );
      return results.map((r) => r.column_name);
    } catch (error) {
      console.error("❌ Error fetching blog columns:", error.message);
      throw error;
    }
  }

  // Fetch blogs for rendering: includes User to populate user field
  static async fetchBlogsForView(limit = null) {
    try {
      const blogs = await Blog.findAll({
        include: [
          {
            model: User,
            as: "User", // matches the association
            attributes: ["id", "userName"], // exclude password for security
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: limit ? parseInt(limit, 10) : undefined,
      });

      const rows = blogs.map((blog) => blog.toJSON());

      console.log("📈 Found blogs:", rows.length, "blogs");
      console.log("📝 Blog data:", JSON.stringify(rows, null, 2));

      return rows;
    } catch (error) {
      console.error("❌ Error in fetchBlogsForView:", error.message);
      throw error; // Re-throw so the caller can handle it
    }
  }

  // List all blogs
  static async listBlogs(req, res) {
    try {
      const blogs = await BlogController.fetchBlogsForView();

      // If request came from a browser expecting HTML, render view; otherwise return JSON
      if (req.headers["accept"]?.includes("text/html")) {
        return res.render("index", { blogs: blogs, user: req.user });
      }
      return res.json({ success: true, blogs });
    } catch (error) {
      console.error("❌ Error fetching blogs:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch blogs",
        error: error.message,
      });
    }
  }

  // Create a new blog post -- requires token
  static async createBlog(req, res) {
    // verifyToken middleware should have set req.user when token is valid
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const { content } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Content is required",
      });
    }

    try {
      // Use Sequelize model to create blog instead of raw SQL
      const blogData = {
        content: content,
        userid: req.user.id ?? null,
      };

      const newBlog = await Blog.create(blogData);

      console.log("📝 Created blog:", newBlog.id);

      // For API requests, return JSON
      if (req.headers["content-type"]?.includes("application/json")) {
        const rows = await BlogController.fetchBlogsForView(1);
        return res.status(201).json({ success: true, blog: rows[0] || null });
      }
      // otherwise assume form post
      return res.redirect("/");
    } catch (error) {
      console.error("❌ Error creating blog:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to create blog",
        error: error.message,
      });
    }
  }
}

module.exports = BlogController;
