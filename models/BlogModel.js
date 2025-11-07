const sequelize = require("../db");
const { DataTypes } = require("sequelize");

const Blog = sequelize.define("blog", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user: {
    type: DataTypes.STRING,
  },
});
Blog.sync();
module.exports = Blog;
