// routes/portfolio.js
const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const { verifyToken } = require("../middleware/auth");
const { poolPromise, sql } = require("../server/db");
const fs = require("fs");
const path = require("path");

// Public: featured portfolio items for public pages
router.get("/", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query("SELECT * FROM Portfolio WHERE Featured = 1 ORDER BY CreatedAt DESC");
    res.json({ success: true, items: result.recordset });
  } catch (err) {
    console.error("GET /api/portfolio error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Admin: list all portfolio items
router.get("/admin", verifyToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM Portfolio ORDER BY CreatedAt DESC");
    res.json({ success: true, items: result.recordset });
  } catch (err) {
    console.error("GET /api/portfolio/admin error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Admin: add portfolio item
router.post("/add", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const { title, category, caption } = req.body;
    if (!req.file) return res.status(400).json({ success: false, message: "Image is required" });

    const imageUrl = `/uploads/${req.file.filename}`;
    const pool = await poolPromise;

    await pool.request()
      .input("Title", sql.NVarChar, title)
      .input("Category", sql.NVarChar, category)
      .input("Caption", sql.NVarChar, caption)
      .input("ImageUrl", sql.NVarChar, imageUrl)
      .input("Featured", sql.Bit, 0)
      .query(`INSERT INTO Portfolio (Title, Category, Caption, ImageUrl, Featured, CreatedAt)
              VALUES (@Title, @Category, @Caption, @ImageUrl, @Featured, GETDATE())`);

    res.json({ success: true, message: "Portfolio item added successfully" });
  } catch (err) {
    console.error("POST /api/portfolio/add error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Admin: toggle featured
router.put("/feature/:id", verifyToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { featured } = req.body;
    const pool = await poolPromise;
    await pool.request()
      .input("Id", sql.Int, id)
      .input("Featured", sql.Bit, featured ? 1 : 0)
      .query("UPDATE Portfolio SET Featured=@Featured WHERE Id=@Id");
    res.json({ success: true, message: "Featured status updated" });
  } catch (err) {
    console.error("PUT /api/portfolio/feature/:id error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Admin: delete portfolio item
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const pool = await poolPromise;

    const getRes = await pool.request().input("Id", sql.Int, id).query("SELECT ImageUrl FROM Portfolio WHERE Id=@Id");
    const row = getRes.recordset[0];
    if (row?.ImageUrl) {
      const filepath = path.join(process.cwd(), row.ImageUrl);
      if (fs.existsSync(filepath)) {
        try { fs.unlinkSync(filepath); } catch (e) { console.warn("unlink failed", e.message); }
      }
    }

    await pool.request().input("Id", sql.Int, id).query("DELETE FROM Portfolio WHERE Id=@Id");
    res.json({ success: true, message: "Portfolio deleted" });
  } catch (err) {
    console.error("DELETE /api/portfolio/:id error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
