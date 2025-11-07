var express = require("express");
const User = require("../models/UsersModel");
var router = express.Router();
const userController = require("../controllers/UserController");
/* GET users listing. */
router.get("/", function (req, res, next) {
  res.render("user");
});
router.post("/", userController.addUser);
router.get("/login", userController.loginPage);
router.post("/login", userController.loginUser);
module.exports = router;
