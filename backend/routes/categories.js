const express = require("express");
const router = express.Router();
const { poolPromise } = require("../server/db");

router.get("/", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM Categories ORDER BY Name");
    res.json({ success: true, items: result.recordset });
  } catch (err) {
    console.error("Error loading categories:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
