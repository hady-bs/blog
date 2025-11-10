const db = require("../db");

const runMigration = async () => {
  try {
    console.log("Checking and adding timestamps to blogs table...");
    const [cols] = await db.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'blogs' AND table_schema = 'public'"
    );
    const fields = cols.map((c) => c.column_name);

    if (!fields.includes("createdat")) {
      console.log("Adding createdAt column...");
      await db.query(
        "ALTER TABLE blogs ADD COLUMN createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
      );
      console.log("Added createdAt column");
    } else {
      console.log("createdAt column already exists");
    }

    if (!fields.includes("updatedat")) {
      console.log("Adding updatedAt column...");
      await db.query(
        "ALTER TABLE blogs ADD COLUMN updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
      );
      console.log("Added updatedAt column");
    } else {
      console.log("updatedAt column already exists");
    }

    console.log("Timestamps migration completed");
  } catch (e) {
    console.error("ERROR", e && e.message ? e.message : e);
    throw e;
  }
};

module.exports = runMigration;

// Run if called directly
if (require.main === module) {
  runMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
