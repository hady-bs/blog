const sequelize = require("../db");
const { DataTypes } = require("sequelize");

const Blog = sequelize.define("blog", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userName: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: "Users",
      key: "userName",
    },
  },
  content: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
Blog.sync();
module.exports = Blog;
