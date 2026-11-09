const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sql, poolPromise } = require("../server/db");

async function findAccount(pool, login) {
  const userResult = await pool.request()
    .input("email", sql.NVarChar, login)
    .query("SELECT Id, Email, Password FROM Users WHERE Email = @email");

  if (userResult.recordset.length > 0) {
    const user = userResult.recordset[0];
    return {
      id: user.Id,
      username: user.Email,
      displayName: user.Email,
      password: user.Password,
    };
  }

  const adminResult = await pool.request()
    .input("username", sql.NVarChar, login)
    .query("SELECT Id, Username, Password, DisplayName FROM Admins WHERE Username = @username");

  if (adminResult.recordset.length > 0) {
    const admin = adminResult.recordset[0];
    return {
      id: admin.Id,
      username: admin.Username,
      displayName: admin.DisplayName || admin.Username,
      password: admin.Password,
    };
  }

  return null;
}

async function passwordMatches(plain, stored) {
  const value = String(stored || "");
  if (value.startsWith("$2a$") || value.startsWith("$2b$") || value.startsWith("$2y$")) {
    return bcrypt.compare(plain, value);
  }
  return plain === value;
}

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const pool = await poolPromise;
    const account = await findAccount(pool, email);
    if (!account || !(await passwordMatches(password, account.password))) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: account.id, username: account.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    return res.json({
      success: true,
      message: "Login successful",
      token,
      username: account.username,
      displayName: account.displayName,
    });
  } catch (err) {
    console.error("Error in /login:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
