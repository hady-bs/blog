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
// Associate Blog and User using `userid` as the foreign key on Blog
User.hasMany(BlogModel, { foreignKey: "userid", sourceKey: "id" });
BlogModel.belongsTo(User, { foreignKey: "userid", targetKey: "id" });
User.sync();
module.exports = User;
