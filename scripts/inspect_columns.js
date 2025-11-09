const db = require("../db");

(async () => {
  try {
    const [rows] = await db.query("SHOW COLUMNS FROM blogs");
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (e) {
    console.error("ERROR", e && e.message ? e.message : e);
    process.exit(1);
  }
})();
