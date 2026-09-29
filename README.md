# Relay — Helpdesk & Support Ticket System

A responsive support portal where users can raise and track tickets and administrators can triage the queue. This project was created from the supplied Full Stack Developer Technical Assessment.

## Features

- Email/password registration and login with bcrypt password hashing and signed JWT sessions.
- Create tickets, view ticket details, update status, and delete your own tickets.
- Admin dashboard with ticket totals, status and priority filters, title search, requester details, and status updates.
- SQLite database with foreign keys and persisted local data.
- Responsive layouts, client/server validation, loading and error states.

## Project structure

```text
client/
	src/
		api/          HTTP client
		components/   Shared interface components
		utils/        Formatting helpers
		main.jsx      Application shell and views
		style.css     Application styles
server/
	middleware/    Authentication and async error handling
	routes/        Authentication, tickets, and admin APIs
	app.js         Express application composition
	config.js      Environment loading and validation
	database.js    SQLite initialization and persistence
	index.js       Server startup and admin seeding
```

## Tech stack

- Frontend: React 18, Vite, Lucide icons, CSS
- Backend: Node.js, Express, JWT, bcryptjs, Zod
- Database: SQLite via sql.js

## Requirements

- Node.js 20 or newer
- npm

## Run locally

```bash
npm install
```

Create `.env` from `.env.example` (PowerShell):

```powershell
Copy-Item .env.example .env
```

On macOS or Linux, use `cp .env.example .env`. Then start both applications:

```bash
npm run dev
```

Open the Vite URL printed in the terminal (normally http://localhost:5173). Vite proxies `/api` requests to the Express server on port 4000. The SQLite file is created automatically at `helpdesk.sqlite` in the project directory.

For a production-style local run:

```bash
npm run build
npm start
```

Then open http://localhost:4000.

## Project checks

```bash
npm test
npm run format:check
npm run build
```

`npm run check` runs all three checks together. `npm run format` applies the configured Prettier style to application source and root project files.

## Environment variables

| Variable         | Required          | Default                 | Description                                                  |
| ---------------- | ----------------- | ----------------------- | ------------------------------------------------------------ |
| `NODE_ENV`       | No                | `development`           | Set to `production` to enable strict secret validation       |
| `PORT`           | No                | `4000`                  | Express listen port                                          |
| `JWT_SECRET`     | Yes in production | development fallback    | Long random secret used to sign session tokens               |
| `DB_PATH`        | No                | `./helpdesk.sqlite`     | SQLite database path, relative to the project working folder |
| `ADMIN_EMAIL`    | No                | `admin@helpdesk.local`  | Admin account email, created on first server start           |
| `ADMIN_PASSWORD` | Yes in production | `Admin123!`             | Initial admin password, set before first start               |
| `CLIENT_ORIGIN`  | No                | `http://localhost:5173` | Browser origin allowed by the API CORS policy                |

Copy `.env.example` and replace the development values before deployment. Keep `.env` private and do not commit secrets. The server loads `.env` automatically. In production, startup fails unless `JWT_SECRET` and `ADMIN_PASSWORD` are explicitly configured. The seeded administrator is created only if that email does not already exist; changing the seed settings does not change an existing account.

## Demo administrator

For local evaluation only, the default seeded admin is `admin@helpdesk.local` with password `Admin123!`. Configure `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `JWT_SECRET` before the first server launch for any shared environment. To reset local evaluation data, stop the server and delete `helpdesk.sqlite`; the seed is created again at next startup. The database file is ignored by Git.

## API

All protected endpoints use `Authorization: Bearer <token>`. JSON request bodies use `Content-Type: application/json`.

### Authentication

| Method | Endpoint             | Access    | Body / purpose                                                             |
| ------ | -------------------- | --------- | -------------------------------------------------------------------------- |
| `POST` | `/api/auth/register` | Public    | `{ "name", "email", "password" }` — creates account and returns token/user |
| `POST` | `/api/auth/login`    | Public    | `{ "email", "password" }` — signs in and returns token/user                |
| `GET`  | `/api/auth/me`       | Signed in | Returns token identity                                                     |
| `POST` | `/api/auth/logout`   | Signed in | Client discards token; JWT remains valid until expiry                      |

### Tickets

| Method   | Endpoint                  | Access         | Purpose                                                            |
| -------- | ------------------------- | -------------- | ------------------------------------------------------------------ |
| `GET`    | `/api/tickets`            | Signed in      | Lists the signed-in user's tickets; administrators get all tickets |
| `POST`   | `/api/tickets`            | Signed in      | Create `{ "title", "description", "category", "priority" }`        |
| `GET`    | `/api/tickets/:id`        | Owner or admin | Read one ticket                                                    |
| `PATCH`  | `/api/tickets/:id/status` | Owner or admin | Update `{ "status": "Open" \| "In Progress" \| "Resolved" }`       |
| `DELETE` | `/api/tickets/:id`        | Owner or admin | Delete ticket                                                      |

Ticket priorities are `Low`, `Medium`, and `High`. New tickets start with `Open` status. Creation fields are validated on the server; title length is 4–120, description is 10–5000, and category is 2–60 characters.

### Admin

| Method | Endpoint                                                    | Access | Purpose                                                       |
| ------ | ----------------------------------------------------------- | ------ | ------------------------------------------------------------- |
| `GET`  | `/api/admin/stats`                                          | Admin  | Counts for total, open, in progress, resolved; top categories |
| `GET`  | `/api/admin/tickets?status=Open&priority=High&search=login` | Admin  | Filter all tickets by status, priority, and title substring   |

## Database

SQLite initializes its `users` and `tickets` tables and indexes automatically. Ticket rows reference their owner with foreign-key enforcement enabled. `sql.js` persists the SQLite database file after writes, which is suitable for this assessment and low-volume local use. For a backup, stop the app and copy the configured database file. Production deployments should use a durable volume and strong secrets; for higher write volume or multi-instance hosting, use a shared database such as PostgreSQL.

## Screenshots

No screenshots are bundled yet. Run the app and capture the sign-in screen, user ticket list/details, and admin dashboard for the assessment submission.

## Notes

- This is an assessment project, not a hosted service. There is no live URL until deployed.
- Logout removes the browser token; stateless JWTs cannot be revoked server-side before expiry.
- Ticket status is editable by the owner as well as an admin to match the assessment's user ticket management requirement.
