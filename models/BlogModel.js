const sequelize = require("../db");
const { DataTypes } = require("sequelize");

const Blog = sequelize.define("blog", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "User",
      key: "id",
    },
  },
  content: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
Blog.sync();
module.exports = Blog;
