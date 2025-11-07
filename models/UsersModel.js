const sequelize = require("../db");
const { DataTypes } = require("sequelize");
const BlogModel = require("./BlogModel");
const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
User.hasMany(BlogModel, { foreignKey: "userName", sourceKey: "userName" });
BlogModel.belongsTo(User, { foreignKey: "userId", sourceKey: "userName" });
User.sync();
module.exports = User;
