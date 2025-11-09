const db = require("../db");

(async () => {
  try {
    const [cols] = await db.query("SHOW COLUMNS FROM blogs");
    const fields = cols.map((c) => c.Field);
    if (!fields.includes("content")) {
      console.log("Adding content column to blogs...");
      await db.query("ALTER TABLE blogs ADD COLUMN content TEXT");
      console.log("Added content column");
    } else {
      console.log("content column already exists");
    }
    if (!fields.includes("userId")) {
      console.log("Adding userId column to blogs...");
      await db.query("ALTER TABLE blogs ADD COLUMN userId INT NULL");
      console.log("Added userId column");
    } else {
      console.log("userId column already exists");
    }
    process.exit(0);
  } catch (e) {
    console.error("ERROR", e && e.message ? e.message : e);
    process.exit(1);
  }
})();
