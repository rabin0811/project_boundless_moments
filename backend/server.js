const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const { poolPromise } = require("./server/db");
const authRoutes = require("./routes/auth");
const categoriesRoute = require("./routes/categories");
const contactRoute = require("./routes/contact");
const portfolioRoutes = require("./routes/portfolio");
const galleryRoute = require("./routes/gallery");

const app = express();
const frontendDir = path.join(__dirname, "..", "frontend");
const uploadDir = path.join(__dirname, "..", "storage", "uploads");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(frontendDir));
app.use("/uploads", express.static(uploadDir));

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoriesRoute);
app.use("/api/contact", contactRoute);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/gallery", galleryRoute);

app.get("/api/health", async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request().query("SELECT 1 AS ok");
    res.json({ status: "ok", database: process.env.DB_NAME || "BoundlessMoments" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.get("/", (req, res) => {
  res.redirect("/home.html");
});

app.get("/admin", (req, res) => {
  res.redirect("/admin-login.html");
});

app.get("/admin/admin-login.html", (req, res) => {
  res.sendFile(path.join(frontendDir, "admin-login.html"));
});

app.get("/admin/dashboard", (req, res) => {
  res.sendFile(path.join(frontendDir, "dashboard.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
