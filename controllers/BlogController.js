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

  // Web: List all blogs (always render view)
  static async listBlogsWeb(req, res) {
    try {
      const blogs = await BlogController.fetchBlogsForView();
      return res.render("index", { blogs: blogs, user: req.user });
    } catch (error) {
      console.error("❌ Error fetching blogs:", error.message);
      return res.status(500).render("error", {
        message: "Failed to fetch blogs",
        error: error,
      });
    }
  }

  // API: List all blogs (always return JSON)
  static async listBlogsApi(req, res) {
    try {
      const blogs = await BlogController.fetchBlogsForView();
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

  // Web: List blogs with pagination (always render view)
  static async listBlogsPaginatedWeb(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const { count, rows } = await Blog.findAndCountAll({
        include: [
          {
            model: User,
            as: "User",
            attributes: ["id", "userName"],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: limit,
        offset: offset,
      });

      const totalPages = Math.ceil(count / limit);
      const blogs = rows.map((blog) => blog.toJSON());

      return res.render("blogs", {
        blogs: blogs,
        user: req.user,
        currentPage: page,
        totalPages: totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        nextPage: page + 1,
        prevPage: page - 1,
        totalBlogs: count,
      });
    } catch (error) {
      console.error("❌ Error fetching blogs with pagination:", error.message);
      return res.status(500).render("error", {
        message: "Failed to fetch blogs",
        error: error,
      });
    }
  }

  // API: List blogs with pagination (always return JSON)
  static async listBlogsPaginatedApi(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const { count, rows } = await Blog.findAndCountAll({
        include: [
          {
            model: User,
            as: "User",
            attributes: ["id", "userName"],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: limit,
        offset: offset,
      });

      const totalPages = Math.ceil(count / limit);
      const blogs = rows.map((blog) => blog.toJSON());

      return res.json({
        success: true,
        blogs,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalBlogs: count,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          nextPage: page + 1,
          prevPage: page - 1,
        },
      });
    } catch (error) {
      console.error("❌ Error fetching blogs with pagination:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch blogs",
        error: error.message,
      });
    }
  }

  // Web: Create a new blog post -- requires token (always redirect)
  static async createBlogWeb(req, res) {
    // verifyToken middleware should have set req.user when token is valid
    if (!req.user) {
      return res.status(401).render("error", {
        message: "Access denied. No token provided.",
        error: { status: 401 },
      });
    }

    const { content } = req.body;
    if (!content?.trim()) {
      return res.status(400).render("error", {
        message: "Content is required",
        error: { status: 400 },
      });
    }

    try {
      // Use Sequelize model to create blog instead of raw SQL
      const blogData = {
        content: content,
        userid: req.user.userId ?? req.user.id ?? null,
      };

      console.log("📝 Creating blog with data:", blogData);

      const newBlog = await Blog.create(blogData);

      console.log("📝 Created blog:", newBlog.id);

      return res.redirect("/");
    } catch (error) {
      console.error("❌ Error creating blog:", error.message);
      return res.status(500).render("error", {
        message: "Failed to create blog",
        error: error,
      });
    }
  }

  // API: Create a new blog post -- requires token (always return JSON)
  static async createBlogApi(req, res) {
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
        userid: req.user.userId ?? req.user.id ?? null,
      };

      console.log("📝 Creating blog with data:", blogData);

      const newBlog = await Blog.create(blogData);

      console.log("📝 Created blog:", newBlog.id);

      const rows = await BlogController.fetchBlogsForView(1);
      return res.status(201).json({ success: true, blog: rows[0] || null });
    } catch (error) {
      console.error("❌ Error creating blog:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to create blog",
        error: error.message,
      });
    }
  }

  // Get a single blog by ID
  static async getBlogById(req, res) {
    try {
      const blogId = req.params.id;
      const blog = await Blog.findByPk(blogId, {
        include: [
          {
            model: User,
            as: "User",
            attributes: ["id", "userName"],
          },
        ],
      });

      if (!blog) {
        return res.status(404).json({
          success: false,
          message: "Blog not found",
        });
      }

      return res.json({
        success: true,
        blog: blog.toJSON(),
      });
    } catch (error) {
      console.error("❌ Error fetching blog by ID:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch blog",
        error: error.message,
      });
    }
  }

  // Update a blog
  static async updateBlog(req, res) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const blogId = req.params.id;
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Content is required",
      });
    }

    try {
      const blog = await Blog.findByPk(blogId);

      if (!blog) {
        return res.status(404).json({
          success: false,
          message: "Blog not found",
        });
      }

      // Check if user owns the blog
      if (blog.userid !== req.user.userId && blog.userid !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "You can only update your own blogs",
        });
      }

      await blog.update({ content: content });

      // Fetch updated blog with user info
      const updatedBlog = await Blog.findByPk(blogId, {
        include: [
          {
            model: User,
            as: "User",
            attributes: ["id", "userName"],
          },
        ],
      });

      return res.json({
        success: true,
        message: "Blog updated successfully",
        blog: updatedBlog.toJSON(),
      });
    } catch (error) {
      console.error("❌ Error updating blog:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to update blog",
        error: error.message,
      });
    }
  }

  // Delete a blog
  static async deleteBlog(req, res) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const blogId = req.params.id;

    try {
      const blog = await Blog.findByPk(blogId);

      if (!blog) {
        return res.status(404).json({
          success: false,
          message: "Blog not found",
        });
      }

      // Check if user owns the blog
      if (blog.userid !== req.user.userId && blog.userid !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "You can only delete your own blogs",
        });
      }

      await blog.destroy();

      return res.json({
        success: true,
        message: "Blog deleted successfully",
      });
    } catch (error) {
      console.error("❌ Error deleting blog:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to delete blog",
        error: error.message,
      });
    }
  }
}

module.exports = BlogController;
