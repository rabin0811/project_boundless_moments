// routes/gallery.js
const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const { verifyToken } = require("../middleware/auth");
const { poolPromise, sql } = require("../server/db");
const fs = require("fs");
const path = require("path");

// Public: list all gallery images
router.get("/", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM Gallery ORDER BY CreatedAt DESC");
    res.json({ success: true, items: result.recordset });
  } catch (err) {
    console.error("GET /api/gallery error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Admin: list all gallery images (protected)
router.get("/admin", verifyToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM Gallery ORDER BY CreatedAt DESC");
    res.json({ success: true, items: result.recordset });
  } catch (err) {
    console.error("GET /api/gallery/admin error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Admin: upload to gallery
router.post("/add", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const { title, section } = req.body;
    if (!req.file) return res.status(400).json({ success: false, message: "Image required" });

    const imageUrl = `/uploads/${req.file.filename}`;
    const pool = await poolPromise;

    await pool.request()
      .input("Title", sql.NVarChar, title)
      .input("Section", sql.NVarChar, section)
      .input("ImageUrl", sql.NVarChar, imageUrl)
      .query("INSERT INTO Gallery (Title, Section, ImageUrl, CreatedAt) VALUES (@Title, @Section, @ImageUrl, GETDATE())");

    res.json({ success: true, message: "Gallery image uploaded" });
  } catch (err) {
    console.error("POST /api/gallery/add error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Admin: delete gallery image
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const pool = await poolPromise;

    const getRes = await pool.request().input("Id", sql.Int, id).query("SELECT ImageUrl FROM Gallery WHERE Id=@Id");
    const row = getRes.recordset[0];
    if (row?.ImageUrl) {
      const filepath = path.join(process.cwd(), row.ImageUrl);
      if (fs.existsSync(filepath)) {
        try { fs.unlinkSync(filepath); } catch (e) { console.warn("unlink failed", e.message); }
      }
    }

    await pool.request().input("Id", sql.Int, id).query("DELETE FROM Gallery WHERE Id=@Id");
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    console.error("DELETE /api/gallery/:id error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
