const db = require("../db");

(async () => {
  try {
    const [cols] = await db.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'blogs' AND table_schema = 'public'"
    );
    const fields = cols.map((c) => c.column_name);
    if (!fields.includes("content")) {
      console.log("Adding content column to blogs...");
      await db.query("ALTER TABLE blogs ADD COLUMN content TEXT");
      console.log("Added content column");
    } else {
      console.log("content column already exists");
    }
    if (!fields.includes("userid")) {
      console.log("Adding userid column to blogs...");
      await db.query("ALTER TABLE blogs ADD COLUMN userid INTEGER");
      console.log("Added userid column");
    } else {
      console.log("userid column already exists");
    }
    process.exit(0);
  } catch (e) {
    console.error("ERROR", e && e.message ? e.message : e);
    process.exit(1);
  }
})();
