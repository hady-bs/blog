const sequelize = require("../db");

async function migrateUsersAddRefreshToken() {
  try {
    console.log("Adding refreshToken column to User table...");

    // Check if column already exists
    const [results] = await sequelize.query(
      "SHOW COLUMNS FROM Users LIKE 'refreshToken'"
    );

    if (results.length === 0) {
      // Add the refreshToken column
      await sequelize.query(
        "ALTER TABLE Users ADD COLUMN refreshToken TEXT NULL"
      );
      console.log("refreshToken column added successfully.");
    } else {
      console.log("refreshToken column already exists.");
    }
  } catch (error) {
    console.error("Error adding refreshToken column:", error);
    throw error;
  }
}

module.exports = migrateUsersAddRefreshToken;

// Run migration if this script is executed directly
if (require.main === module) {
  migrateUsersAddRefreshToken()
    .then(() => {
      console.log("Migration completed successfully.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}
