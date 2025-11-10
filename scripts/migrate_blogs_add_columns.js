const db = require("../db");

const runMigration = async () => {
  try {
    const dialect = db.getDialect();
    let cols = [];

    if (dialect === "mysql" || dialect === "mariadb") {
      const res = await db.query("SHOW COLUMNS FROM `blogs`");
      cols = res[0];
    } else if (dialect === "postgres" || dialect === "postgresql") {
      const schema =
        db.config.database || process.env.DATABASE_NAME || "public";
      const res = await db.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = 'blogs' AND table_schema = 'public'`
      );
      cols = res[0];
    } else {
      // fallback: try both patterns
      try {
        const res = await db.query("SHOW COLUMNS FROM `blogs`");
        cols = res[0];
      } catch (e) {
        const res = await db.query(
          `SELECT column_name FROM information_schema.columns WHERE table_name = 'blogs' AND table_schema = 'public'`
        );
        cols = res[0];
      }
    }

    // normalize field names depending on returned shape
    const fields = cols
      .map((c) => c.Field || c.column_name || c.COLUMN_NAME)
      .map((f) => String(f).toLowerCase());

    if (!fields.includes("content")) {
      console.log("Adding content column to blogs...");
      await db.query("ALTER TABLE blogs ADD COLUMN content TEXT");
      console.log("Added content column");
    } else {
      console.log("content column already exists");
    }

    // prefer camelCase userId, but accept userid
    if (
      !fields.includes("userid") &&
      !fields.includes("userId".toLowerCase())
    ) {
      console.log("Adding userId column to blogs...");
      // choose INT to match User.id
      await db.query("ALTER TABLE blogs ADD COLUMN userId INT NULL");
      console.log("Added userId column");
    } else {
      console.log("userId column already exists");
    }
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
