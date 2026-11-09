# Boundless Moments — Technical Documentation

## Purpose

Boundless Moments is a photography portfolio and enquiry website. Visitors can browse featured work, gallery images, service categories, and submit a contact message. An authenticated admin can upload portfolio and gallery images, feature portfolio items, and review or delete enquiries.

## Architecture

```text
Browser
  ├─ Public pages (home.html, gallery/portfolio sections)
  ├─ Admin login (admin-login.html) → POST /api/auth/login → JWT
  └─ Admin dashboard (dashboard.html + admin.js) → Bearer token
        │
        ▼
Express server (backend/server.js, port 5000)
  ├─ Static frontend from ../frontend
  ├─ /uploads → ../storage/uploads
  ├─ /api/auth        → routes/auth.js
  ├─ /api/categories  → routes/categories.js
  ├─ /api/contact     → routes/contact.js
  ├─ /api/portfolio   → routes/portfolio.js
  ├─ /api/gallery     → routes/gallery.js
  └─ /api/health      → SQL Server SELECT 1
        │
        ▼
SQL Server database: BoundlessMoments
```

## Data model

| Table | Key columns | Notes |
| --- | --- | --- |
| `Users` | `Id`, `Email`, `Password` | Primary login table; supports bcrypt hashes and legacy plain-text passwords |
| `Admins` | `Id`, `Username`, `Password`, `DisplayName` | Legacy admin fallback; still supported by the login route |
| `Portfolio` | `Id`, `Title`, `Category`, `ImageUrl`, `Caption`, `Featured`, `CreatedAt` | Public list returns only `Featured = 1` |
| `Gallery` | `Id`, `Title`, `Section`, `ImageUrl`, `CreatedAt` | `Section` was added to the existing local database without dropping rows |
| `Categories` | `Id`, `Name` | Service categories shown on the public site and admin upload form |
| `Messages` | `Id`, `Name`, `Email`, `Service`, `Message`, `CreatedAt` | Contact form submissions |
| `Inquiries` | Same shape as `Messages` | Reserved for enquiry workflows; not used by the current routes |

`backend/server/init.sql` is idempotent for fresh databases and adds `Gallery.Section` to older databases that predate the column.

## Authentication and authorization

1. `POST /api/auth/login` accepts `{ "email": "...", "password": "..." }`.
2. The route checks `Users.Email` first, then falls back to `Admins.Username`.
3. A stored value beginning with `$2a$`, `$2b$`, or `$2y$` is compared with `bcrypt.compare`; any other value is treated as a legacy plain-text password.
4. On success the server signs a one-day JWT with `JWT_SECRET` and returns `{ success, token, username, displayName }`.
5. Protected routes use `Authorization: Bearer <token>` via `middleware/auth.js`.

For production, remove plain-text legacy passwords, require HTTPS, store the token in an HttpOnly cookie, and rotate `JWT_SECRET`.

## Setup and run

```powershell
cd D:\PROJECTS_READY\project_boundless_moments\backend
npm ci
Copy-Item .env.example .env
# edit .env with DB_SERVER, DB_USER, DB_PASS, DB_NAME, JWT_SECRET
sqlcmd -S .\SQLEXPRESS -U sa -P "your-password" -i server\init.sql
npm run seed:admin
npm start
```

Open <http://localhost:5000/home.html> for the public site and <http://localhost:5000/admin-login.html> for the admin.

### Seeded local admin

- Email: `admin@boundlessmoments.com`
- Password: `Admin123!`

The seed script updates the password if the email already exists, so it is safe to rerun. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` to override the defaults.

## Verification evidence (2026-11-09)

Environment: Node.js 24.18.0, npm 11.16.0, SQL Server Express `.\SQLEXPRESS`, database `BoundlessMoments`.

| Check | Result |
| --- | --- |
| `npm ci` in `backend/` | Passed |
| `sqlcmd -i server\init.sql` / schema alignment | Passed; existing data preserved |
| `ALTER TABLE Gallery ADD Section` | Applied |
| `npm run seed:admin` | Created `admin@boundlessmoments.com` with bcrypt hash |
| `node --check frontend/admin.js` | Passed |
| Server startup | `Server running on port 5000`, `MSSQL Connected...` |
| `GET /api/health` | 200, `{"status":"ok","database":"BoundlessMoments"}` |
| `GET /`, `/home.html`, `/admin-login.html`, `/dashboard.html` | 200 |
| `GET /api/categories`, `/api/gallery`, `/api/portfolio` | 200 |
| Login as seeded admin | 200, JWT returned |
| Login as legacy `rubhum2058@gmail.com.com` | 200 |
| Login as legacy `abi` | 200 |
| Wrong password | 401 |
| `GET /api/portfolio/admin`, `/api/gallery/admin`, `/api/contact` with token | 200 |
| `POST /api/contact` | 200, row inserted |
| `POST /api/portfolio/add` (multipart) | 200, row inserted |
| `POST /api/gallery/add` (multipart) | 200, row inserted |
| Delete verification rows | 200 |

Test rows and uploaded test images were removed after verification.

## Maintenance notes

- **Existing database**: do not drop `BoundlessMoments`. The local copy contains legacy users and portfolio/gallery rows. Apply additive schema changes only.
- **Uploads**: `backend/middleware/multer.js` creates `storage/uploads/` and accepts JPG, JPEG, PNG, WEBP, and GIF files. `storage/` is ignored by Git.
- **Upload deletion path**: the delete routes remove the database row; if you change the storage layout, update the file path logic in `routes/portfolio.js` and `routes/gallery.js` to match.
- **Categories**: `init.sql` seeds categories only when the table is empty. Existing category rows are left untouched.
- **Static routing**: `server.js` serves `../frontend` and maps `/admin` to `admin-login.html`, `/admin/admin-login.html` to the login page, and `/admin/dashboard` to the dashboard.

## Known limitations

- No automated tests; verification is manual/live HTTP.
- Legacy plain-text passwords remain in the preserved local database for compatibility.
- `Inquiries` is defined but not exposed by a route.
- The admin UI uses `localStorage` for the JWT, which is acceptable for a local assignment but not a production security model.
- Historical variants in `variants/` are not maintained.
