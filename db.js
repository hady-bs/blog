// Try to load dotenv if not already loaded
try {
  require("dotenv").config();
} catch (error) {
  console.log("dotenv already loaded or not available");
}

const { Sequelize } = require("sequelize");

let connectionConfig;

if (process.env.DATABASE_URL) {
  console.log("🔗 Using DATABASE_URL");
  connectionConfig = process.env.DATABASE_URL;
} else if (
  process.env.DATABASE_NAME &&
  process.env.DATABASE_USERNAME &&
  process.env.DATABASE_PASSWORD
) {
  console.log("🔗 Using separate database credentials");
  connectionConfig = {
    database: process.env.DATABASE_NAME,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    dialect: process.env.DATABASE_TYPE,
  };
} else {
  throw new Error(
    "❌ No database configuration found in environment variables"
  );
}

const sequelize = new Sequelize(connectionConfig);

module.exports = sequelize;
