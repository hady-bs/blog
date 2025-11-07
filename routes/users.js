var express = require("express");
const User = require("../models/UsersModel");
var router = express.Router();

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.render("user");
});
router.post("/", async (req, res) => {
  try {
    const user = await User.create({
      userName: req.body.userName,
      password: req.body.password,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: user,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(400).json({
      success: false,
      message: "Failed to create user",
      error: error.message,
    });
  }
});

module.exports = router;
