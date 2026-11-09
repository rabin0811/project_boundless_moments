const bcrypt = require("bcryptjs");
const { sql, poolPromise } = require("./server/db");

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@boundlessmoments.com";
  const password = process.env.ADMIN_PASSWORD || "Admin123!";
  const hash = await bcrypt.hash(password, 10);
  const pool = await poolPromise;

  const existing = await pool.request()
    .input("email", sql.NVarChar, email)
    .query("SELECT Id FROM Users WHERE Email = @email");

  if (existing.recordset.length > 0) {
    await pool.request()
      .input("email", sql.NVarChar, email)
      .input("password", sql.NVarChar, hash)
      .query("UPDATE Users SET Password = @password WHERE Email = @email");
    console.log(`Updated admin user: ${email}`);
  } else {
    await pool.request()
      .input("email", sql.NVarChar, email)
      .input("password", sql.NVarChar, hash)
      .query("INSERT INTO Users (Email, Password) VALUES (@email, @password)");
    console.log(`Created admin user: ${email}`);
  }

  console.log(`Password: ${password}`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
