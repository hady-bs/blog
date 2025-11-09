const db = require("../db");

(async () => {
  try {
    console.log("Altering createdAt and updatedAt defaults...");
    await db.query(
      "ALTER TABLE blogs MODIFY createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP"
    );
    await db.query(
      "ALTER TABLE blogs MODIFY updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
    );
    console.log("Timestamps updated");
    process.exit(0);
  } catch (e) {
    console.error("ERROR", e && e.message ? e.message : e);
    process.exit(1);
  }
})();
