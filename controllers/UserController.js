const { Op } = require("sequelize");
const User = require("../models/UsersModel");
const Blog = require("../models/BlogModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// JWT Secret Key (store this in environment variables in production)
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

class UserController {
  // Web: Add user (always redirect)
  static async addUserWeb(req, res) {
    try {
      const value = await User.findOne({
        where: { userName: req.body.userName },
      });
      if (value) {
        return res.status(400).render("error", {
          message: "User already exists",
          error: { status: 400 },
        });
      }

      // Hash password before saving
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      const user = await User.create({
        userName: req.body.userName,
        password: hashedPassword,
      });

      // Generate token for new user
      const token = jwt.sign(
        { userId: user.id, userName: user.userName },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      // Set cookie and redirect
      res.cookie("token", token, { httpOnly: true });
      return res.redirect("/");
    } catch (error) {
      console.error("Error creating user:", error);
      return res.status(400).render("error", {
        message: "Failed to create user",
        error: error,
      });
    }
  }

  // API: Add user (always return JSON)
  static async addUserApi(req, res) {
    try {
      const value = await User.findOne({
        where: { userName: req.body.userName },
      });
      if (value) {
        return res
          .status(400)
          .json({ success: false, message: "the user is exist" });
      }

      // Hash password before saving
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      const user = await User.create({
        userName: req.body.userName,
        password: hashedPassword,
      });

      // Generate token for new user
      const token = jwt.sign(
        { userId: user.id, userName: user.userName },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      return res.status(201).json({
        success: true,
        message: "User created successfully",
        user: {
          id: user.id,
          userName: user.userName,
        },
        token: token,
      });
    } catch (error) {
      console.error("Error creating user:", error);
      return res.status(400).json({
        success: false,
        message: "Failed to create user",
        error: error.message,
      });
    }
  }

  static loginPage(req, res) {
    console.log("workinng ...");
    return res.render("login");
  }

  // Web: Login user (always redirect)
  static async loginUserWeb(req, res) {
    try {
      const { userName, password } = req.body;

      // Check if userName and password are provided
      if (!userName || !password) {
        return res.status(400).render("error", {
          message: "Username and password are required",
          error: { status: 400 },
        });
      }

      // Find user by username
      const user = await User.findOne({
        where: { userName: userName },
      });

      if (user) {
        // Compare password with hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (isPasswordValid) {
          // Generate JWT token
          const token = jwt.sign(
            { userId: user.id, userName: user.userName },
            JWT_SECRET,
            { expiresIn: "24h" }
          );

          // Set cookie and redirect
          res.cookie("token", token, { httpOnly: true });
          return res.redirect("/");
        } else {
          return res.status(401).render("error", {
            message: "The password is not correct",
            error: { status: 401 },
          });
        }
      } else {
        return res.status(401).render("error", {
          message: "User not found",
          error: { status: 401 },
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).render("error", {
        message: "Internal server error",
        error: error,
      });
    }
  }

  // API: Login user (always return JSON)
  static async loginUserApi(req, res) {
    try {
      const { userName, password } = req.body;

      // Check if userName and password are provided
      if (!userName || !password) {
        return res.status(400).json({
          message: "Username and password are required",
        });
      }

      // Find user by username
      const user = await User.findOne({
        where: { userName: userName },
      });

      if (user) {
        // Compare password with hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (isPasswordValid) {
          // Generate JWT token
          const token = jwt.sign(
            { userId: user.id, userName: user.userName },
            JWT_SECRET,
            { expiresIn: "24h" }
          );

          // Return JSON with token
          return res.json({
            success: true,
            message: "Login successful",
            token: token,
            user: {
              id: user.id,
              userName: user.userName,
            },
          });
        } else {
          return res.status(401).json({
            message: "The password is not correct",
          });
        }
      } else {
        return res.status(401).json({
          message: "User not found",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }

  // Middleware to verify token
  static verifyToken(req, res, next) {
    const token =
      req.headers.authorization?.split(" ")[1] || req.cookies?.token;

    if (!token) {
      // If the client expects HTML, redirect to login page
      if (
        req.headers["accept"] &&
        req.headers["accept"].includes("text/html")
      ) {
        return res.redirect("/users/login");
      }
      return res.status(401).json({
        message: "Access denied. No token provided.",
      });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      // If the client expects HTML, redirect to login page
      if (
        req.headers["accept"] &&
        req.headers["accept"].includes("text/html")
      ) {
        return res.redirect("/users/login");
      }
      return res.status(400).json({
        message: "Invalid token.",
      });
    }
  }

  // Optional middleware: if token present, verify and set req.user; otherwise continue
  static optionalVerifyToken(req, res, next) {
    const token =
      req.headers.authorization?.split(" ")[1] || req.cookies?.token;
    if (!token) {
      req.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      // If token invalid, don't block — just treat as anonymous
      req.user = null;
    }
    return next();
  }

  // Web: Logout method (always redirect)
  static logoutWeb(req, res) {
    // Clear cookie and redirect
    res.clearCookie("token");
    return res.redirect("/");
  }

  // API: Logout method (always return JSON)
  static logoutApi(req, res) {
    // For API requests, return JSON
    return res.json({
      success: true,
      message: "Logged out successfully",
    });
  }

  // Get user profile API endpoint
  static async getProfile(req, res) {
    try {
      // req.user is set by verifyToken middleware
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Access denied. No token provided.",
        });
      }

      // Fetch user from database to get latest info
      const user = await User.findByPk(req.user.userId || req.user.id, {
        attributes: ["id", "userName", "createdAt", "updatedAt"],
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

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

      return res.json({
        success: true,
        user: user.toJSON(),
        blogs: userBlogs.map((blog) => blog.toJSON()),
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch user profile",
        error: error.message,
      });
    }
  }
}

module.exports = UserController;
