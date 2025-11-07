const { Op } = require("sequelize");
const User = require("../models/UsersModel");

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
      const user = await User.create({
        userName: req.body.userName,
        password: req.body.password,
      });

      return res.status(201).json({
        success: true,
        message: "User created successfully",
        user: user,
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

      // Find user with matching userName AND password in ONE query
      const user = await User.findOne({
        where: {
          userName: userName,
          password: password,
        },
      });

      if (user) {
        // Login successful
        return res.redirect("/");
      } else {
        // Check if username exists but password is wrong
        const userExists = await User.findOne({
          where: { userName: userName },
        });

        if (userExists) {
          return res.status(401).json({
            message: "The password is not correct",
          });
        } else {
          return res.status(401).json({
            message: "User not found",
          });
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
}
module.exports = UserController;
