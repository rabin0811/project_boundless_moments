# project_boundless_moments

## Boundless Moments

A photography portfolio and enquiry website with an Express backend, a static HTML/CSS/JS frontend, and an admin dashboard. The project was originally created as a second-semester web assignment and has been standardized for the `D:\PROJECTS_READY` workspace.

- Original location: `D:\Computers Files\assignment 2nd sem\Webside`
- Working copy: `D:\PROJECTS_READY\project_boundless_moments`
- Stack: Node.js, Express, SQL Server (Express/LocalDB), vanilla JavaScript, Multer, JWT

## Folder layout

```text
project_boundless_moments/
  backend/            Express API, auth, uploads, database scripts
    routes/           auth, portfolio, gallery, categories, contact
    middleware/       JWT verification and Multer upload handling
    server/           database connection and init.sql
    seed-admin.js     Creates/updates a bcrypt admin account
  frontend/           Public pages, admin login, and dashboard
  storage/uploads/    Runtime image uploads (ignored by Git)
  variants/           Other assignment versions and experiments
  docs/               Assignment documents, wireframes, and technical notes
```

## Prerequisites

- Node.js 18+ and npm
- SQL Server Express, SQL Server LocalDB, or another SQL Server instance
- A SQL login with permission to create/read/write the `BoundlessMoments` database

## Setup

1. Install backend dependencies:

   ```powershell
   cd backend
   npm ci
   ```

2. Create the local environment file:

   ```powershell
   Copy-Item .env.example .env
   ```

   Edit `backend/.env` with your SQL Server settings:

   ```dotenv
   PORT=5000
   JWT_SECRET=replace-with-a-long-random-secret
   DB_USER=sa
   DB_PASS=your-password
   DB_SERVER=.\SQLEXPRESS
   DB_NAME=BoundlessMoments
   ```

   The real `.env` is ignored by Git and must never be committed.

3. Create/upgrade the database schema:

   ```powershell
   sqlcmd -S .\SQLEXPRESS -U sa -P "your-password" -i server\init.sql
   ```

   Or run `backend/server/init.sql` in SQL Server Management Studio. The script creates the database if needed and defines `Users`, `Admins`, `Portfolio`, `Gallery`, `Categories`, `Messages`, and `Inquiries`.

   If you are upgrading an older copy that already has the `Gallery` table, the script adds the missing `Section` column.

4. Seed an admin account:

   ```powershell
   npm run seed:admin
   ```

   Default local credentials:

   - Email: `admin@boundlessmoments.com`
   - Password: `Admin123!`

   Change these values with `ADMIN_EMAIL` and `ADMIN_PASSWORD` before running the seed script in a real deployment.

5. Start the server:

   ```powershell
   npm start
   ```

   Open:

   - Public site: <http://localhost:5000/home.html>
   - Admin login: <http://localhost:5000/admin-login.html>
   - Admin dashboard: <http://localhost:5000/dashboard.html>
   - Health check: <http://localhost:5000/api/health>

## Verified status

Verified locally on 2026-11-09 with Node.js 24 and SQL Server Express:

- [x] Backend dependencies installed with `npm ci`
- [x] `server/init.sql` applied to the local `BoundlessMoments` database
- [x] Existing legacy data preserved; `Gallery.Section` added without dropping data
- [x] `npm run seed:admin` creates a bcrypt admin account
- [x] Server starts on port 5000 and connects to SQL Server
- [x] Public pages return HTTP 200: `/`, `/home.html`, `/admin-login.html`, `/dashboard.html`
- [x] Public APIs return HTTP 200: `/api/health`, `/api/categories`, `/api/gallery`, `/api/portfolio`
- [x] Admin login works with the seeded account and the preserved legacy accounts
- [x] Protected APIs return HTTP 200 with a valid token: `/api/portfolio/admin`, `/api/gallery/admin`, `/api/contact`
- [x] Public contact form POST succeeds
- [x] Authenticated portfolio and gallery image uploads succeed
- [x] `frontend/admin.js` passes `node --check`

There is no automated test suite in this project; verification was performed with live HTTP requests against the local server and database.

## API overview

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/health` | No | Server and database health |
| `POST` | `/api/auth/login` | No | Admin login; returns a JWT |
| `GET` | `/api/categories` | No | List service categories |
| `GET` | `/api/gallery` | No | List public gallery images |
| `GET` | `/api/portfolio` | No | List featured portfolio items |
| `POST` | `/api/contact` | No | Submit a contact/enquiry message |
| `GET` | `/api/portfolio/admin` | Bearer token | List all portfolio items |
| `POST` | `/api/portfolio/add` | Bearer token | Upload a portfolio image (multipart `image`) |
| `PUT` | `/api/portfolio/feature/:id` | Bearer token | Toggle featured state |
| `DELETE` | `/api/portfolio/:id` | Bearer token | Delete a portfolio item |
| `GET` | `/api/gallery/admin` | Bearer token | List all gallery images |
| `POST` | `/api/gallery/add` | Bearer token | Upload a gallery image (multipart `image`) |
| `DELETE` | `/api/gallery/:id` | Bearer token | Delete a gallery image |
| `GET` | `/api/contact` | Bearer token | List contact messages |
| `DELETE` | `/api/contact/:id` | Bearer token | Delete a contact message |

## Notes and limitations

- The existing local `BoundlessMoments` database was preserved. Legacy `Users` and `Admins` rows still work; passwords may be plain text for those old rows. New seeded passwords are bcrypt hashes.
- Uploaded files are stored in `storage/uploads/` and are ignored by Git. The folder is created automatically at runtime.
- The frontend stores the JWT in `localStorage` for this assignment; use HttpOnly cookies and a stronger secret for production.
- The `variants/` folder contains historical experiments and is not part of the running app.
- Do not commit `.env`, database backups, or uploaded media.

## Troubleshooting

- **`MSSQL Connected...` does not appear / health check fails**: confirm the SQL Server service is running, `DB_SERVER` matches the instance name (for example `.\SQLEXPRESS`), and the login in `.env` has access.
- **Login returns 401**: run `npm run seed:admin` and use `admin@boundlessmoments.com` / `Admin123!`, or verify the legacy account exists in `Users`/`Admins`.
- **`Invalid column name 'Section'`**: run `backend/server/init.sql` again; it adds `Gallery.Section` if the table already exists.
- **Port 5000 is already in use**: change `PORT` in `backend/.env` and use the same port in the browser.
- **Uploads return 400**: send the file as multipart form field `image` with a JPG, PNG, WEBP, or GIF extension.

## Documentation

See `docs/README.md` for architecture, data model, verification evidence, and maintenance notes. Assignment briefs, reports, and wireframes are also stored in `docs/`.
