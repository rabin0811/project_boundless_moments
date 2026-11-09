// routes/contact.js
const express = require("express");
const router = express.Router();
const { poolPromise, sql } = require("../server/db");
const { verifyToken } = require("../middleware/auth");

// Public: submit message
router.post("/", async (req, res) => {
  try {
    const { name, email, service, message } = req.body;
    const pool = await poolPromise;
    await pool.request()
      .input("Name", sql.NVarChar, name)
      .input("Email", sql.NVarChar, email)
      .input("Service", sql.NVarChar, service)
      .input("Message", sql.NVarChar, message)
      .query("INSERT INTO Messages (Name, Email, Service, Message, CreatedAt) VALUES (@Name, @Email, @Service, @Message, GETDATE())");

    res.json({ success: true, message: "Message sent successfully!" });
  } catch (err) {
    console.error("Error in Contact POST:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Admin: list messages (protected)
router.get("/", verifyToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM Messages ORDER BY CreatedAt DESC");
    res.json({ success: true, items: result.recordset });
  } catch (err) {
    console.error("Error in Contact GET (admin):", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Admin: delete a message (protected)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const pool = await poolPromise;
    await pool.request().input("Id", sql.Int, id).query("DELETE FROM Messages WHERE Id=@Id");
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    console.error("Error deleting message:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
