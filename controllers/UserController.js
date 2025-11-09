const { Op } = require("sequelize");
const User = require("../models/UsersModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// JWT Secret Key (store this in environment variables in production)
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

class UserController {
  static async addUser(req, res) {
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

  static async loginUser(req, res) {
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

          // For API requests, return JSON with token
          if (req.headers["content-type"] === "application/json") {
            return res.json({
              success: true,
              message: "Login successful",
              token: token,
              user: {
                id: user.id,
                userName: user.userName,
              },
            });
          }

          // For form submissions, set token in cookie and redirect
          res.cookie("token", token, { httpOnly: true });
          return res.redirect("/");
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

  // Logout method
  static logout(req, res) {
    // Clear cookie
    res.clearCookie("token");

    // For API requests, return JSON
    if (req.headers["content-type"] === "application/json") {
      return res.json({
        success: true,
        message: "Logged out successfully",
      });
    }

    // For web requests, redirect to home
    return res.redirect("/");
  }
}

module.exports = UserController;
