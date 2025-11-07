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
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
User.hasMany(BlogModel, { foreignKey: "userId" });
BlogModel.belongsTo(User, { foreignKey: "userId" });
User.sync();
module.exports = User;
