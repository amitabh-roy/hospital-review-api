# Hospital Review API

NestJS backend for OpenCurtain hospital listings and role/unit-aware reviews. Uses PostgreSQL (Sequelize), JWT authentication, a versioned REST API, and a unified response envelope suitable for Postman, Swagger, or any HTTP client.

---

## Features

- **Versioned REST API** — `api/v1` prefix on all routes
- **PostgreSQL + Sequelize** — migrations, models, and seed data for hospitals, users, roles, units, and reviews
- **Role- and unit-aware reviews** — reviews link to occupation (`roles`) and care area (`units` such as ICU, Med-Surg); hospitals expose units via `hospital_units`
- **Email/password authentication** — signup, login, JWT access tokens, refresh tokens, logout
- **Hospital discovery** — paginated list, text search, filter metadata, and detail by ID or slug
- **Unified response envelope** — same JSON shape for success and errors
- **Global validation** — `class-validator` with structured error messages
- **OpenAPI docs** — Swagger UI at `/api/docs` (primary tool for exploring and testing endpoints)
- **Request logging** — HTTP method + path on every request
- **Rate limiting** — `@nestjs/throttler` on auth routes
- **Health endpoint** — `GET /api/v1/health` for probes and uptime checks

---

## Tech Stack

| Layer | Choice |
|--------|--------|
| Runtime | Node.js 20+ |
| Framework | NestJS 11 |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Sequelize + sequelize-typescript |
| Auth | JWT (`@nestjs/jwt`, Passport), bcrypt password hashing |
| Validation | class-validator, class-transformer |
| API docs | @nestjs/swagger |
| Config | @nestjs/config with startup env validation |

---

## Quick Start

### Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 14+ (local or remote)

### Install, database, and run

```bash
git clone <repository-url>
cd hospital-review-api
npm install
cp .env.example .env
```

Edit `.env`: set database credentials and a strong `JWT_SECRET` (required for auth).

```bash
npm run db:migrate
npm run db:seed
npm run start:dev
```

| Resource | URL |
|----------|-----|
| API base | `http://localhost:3001/api/v1` |
| Swagger | `http://localhost:3001/api/docs` |
| Health | `http://localhost:3001/api/v1/health` |

### Production

```bash
cp .env.example .env   # set NODE_ENV=production, RDS credentials, strong JWT_SECRET
npm run db:migrate
npm run build
npm run start:prod
```

**Same EC2 as the web app:** `HOST=127.0.0.1`; `CORS_ORIGIN` and `APP_PUBLIC_URL` = your public HTTPS site URL.

**Frontend on Vercel:** `HOST=0.0.0.0`; HTTPS API URL publicly reachable; `CORS_ORIGIN` must list your Vercel URL(s). Frontend sets `NEXT_PUBLIC_API_BASE_URL` to the same API origin.

**Health check:** `GET /api/v1/health` for load balancers and uptime monitors.

---

## Environment Variables

Use **one `.env` file** on each machine: `cp .env.example .env` and edit values. Do not commit `.env`.

| Variable | Description |
|----------|-------------|
| `PORT` | HTTP listen port (e.g. `3001`) |
| `NODE_ENV` | `development` \| `production` \| `test` |
| `HOST` | Bind address (`0.0.0.0` local; `127.0.0.1` on EC2 when only Next proxies to the API) |
| `CORS_ORIGIN` | Allowed browser origin(s); comma-separated for Vercel prod + preview (e.g. `https://app.vercel.app,https://www.yourdomain.com`) |
| `DB_HOST` | PostgreSQL host |
| `DB_PORT` | PostgreSQL port |
| `DB_USER` | Database user |
| `DB_PASSWORD` | Database password |
| `DB_NAME` | Database name |
| `DB_SSL` | Set `true` for **AWS RDS** (required; fixes “no encryption” / pg_hba errors) |
| `DB_LOGGING` | Log SQL when `true` |
| `JWT_SECRET` | Signing secret for access tokens (required; strong in production) |
| `JWT_EXPIRES_IN` | Access token lifetime |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifetime |
| `EMAIL_VERIFICATION_EXPIRES_IN` | Email verification token TTL |
| `PASSWORD_RESET_EXPIRES_IN` | Password reset token TTL |
| `APP_PUBLIC_URL` | Frontend base URL for email links |
| `BCRYPT_SALT_ROUNDS` | bcrypt cost factor |

**Architecture:** See [ARCHITECTURE.md](./ARCHITECTURE.md) for folder conventions, request flow, and database/auth design.

---

## API Reference

All endpoints return the [response envelope](#response-envelope) below unless noted. Use Swagger (`/api/docs`) for full request/response schemas and to try authenticated routes with a bearer token.

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/health` | No | Service liveness |

### Auth (`/api/v1/auth`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/v1/auth/signup` | No | Register with email/password; `occupation` must match a seeded `roles.name` |
| `POST` | `/api/v1/auth/login` | No | Login; returns access + refresh tokens |
| `POST` | `/api/v1/auth/refresh` | No | Exchange refresh token for new tokens |
| `POST` | `/api/v1/auth/logout` | No | Revoke refresh token |
| `POST` | `/api/v1/auth/verify-email` | No | Confirm email with verification token |
| `POST` | `/api/v1/auth/resend-verification` | Bearer | Resend verification email (logged in dev) |
| `POST` | `/api/v1/auth/forgot-password` | No | Request password reset link (logged in dev) |
| `POST` | `/api/v1/auth/reset-password` | No | Set new password with reset token |
| `GET` | `/api/v1/auth/me` | Bearer | Current user profile |
| `PATCH` | `/api/v1/auth/admin/users/:id/verification` | Bearer (admin) | Update user verification status |

### Reference data

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/roles` | No | All healthcare roles (excludes `admin`) for signup and profile filters |
| `GET` | `/api/v1/units` | No | All unit/department names for profile filters |

### Hospitals (`/api/v1/hospitals`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/hospitals` | No | Paginated list; optional `city`, `state`, `facilityType`, `minRating`, `maxRating` |
| `GET` | `/api/v1/hospitals/search` | No | Text search (`query` required); same filters as list |
| `GET` | `/api/v1/hospitals/filters` | No | Distinct states and facility types for UI filters |
| `GET` | `/api/v1/hospitals/by-slug/:slug` | No | Hospital detail by URL slug (`name-id`) |
| `GET` | `/api/v1/hospitals/:id` | No | Hospital detail with mapped units and review stats |

List/search query params: `page`, `limit`, `city`, `state`, `facilityType`, `minRating`, `maxRating`. Search also requires `query`.

### Reviews (`/api/v1/reviews`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/v1/reviews` | Bearer | Submit review (`userId` / `roleId` from JWT; `unitId` must exist on hospital) |
| `GET` | `/api/v1/reviews/me` | Bearer | List reviews submitted by the current user |
| `GET` | `/api/v1/reviews/hospital/:id` | No | Paginated approved reviews for a hospital |
| `PATCH` | `/api/v1/reviews/:id/status` | Bearer (admin) | Approve or reject a review |

#### Create review body (authenticated)

```json
{
  "hospitalId": 1,
  "unitId": 1,
  "rating": 5,
  "comment": "Excellent care and friendly staff.",
  "employmentType": "full_time",
  "shiftType": "day"
}
```

Optional fields: `hourlyRate`, `patientRatio`, `mealBreaks`, `bathroomBreaks`, `parkingCost`, `managementRating`, `wouldReturn`.

**Rules:**

- `hospitalId` must exist
- `unitId` must be linked to that hospital in `hospital_units`
- `rating` is 1–5 (integer)
- One review per user per hospital (DB unique index + service check)
- New reviews are created as `approved` and update hospital aggregates immediately
- Admins can still change review status later via `PATCH /reviews/:id/status`

### Example requests

```bash
# Health
curl http://localhost:3001/api/v1/health

# Signup (occupation must match a seeded role name)
curl -X POST http://localhost:3001/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Taylor Brooks",
    "email": "taylor.brooks@example.com",
    "password": "Password@123",
    "occupation": "Registered Nurse (RN)"
  }'

# Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"taylor.brooks@example.com","password":"Password@123"}'

# Search hospitals
curl "http://localhost:3001/api/v1/hospitals/search?query=Boston&page=1&limit=10"

# Submit review (replace TOKEN with accessToken from login/signup)
curl -X POST http://localhost:3001/api/v1/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "hospitalId": 1,
    "unitId": 1,
    "rating": 5,
    "comment": "Great team on the unit.",
    "employmentType": "full_time",
    "shiftType": "day"
  }'
```

In development, verification and password-reset emails are written to the server log, not sent via SMTP.

---

## Database

### Schema (Milestone 1 foundation)

| Table | Purpose |
|-------|---------|
| `roles` | Healthcare occupations (RN, CNA, …) plus `admin` |
| `users` | Accounts with `role_id`, bcrypt `password_hash`, verification fields |
| `hospitals` | Facilities (`cms_id`, name, location, `facility_type`, `average_rating`) |
| `units` | Reusable unit names (ICU, Med-Surg, ED, …) |
| `hospital_units` | Which units exist at which hospital |
| `reviews` | Per-user hospital reviews with `role_id`, `unit_id`, rating, comment, status, optional stats |
| `refresh_tokens` | Hashed refresh tokens for session rotation |
| `auth_tokens` | Email verification and password-reset tokens |

Migrations live in `src/database/migrations/`. Seeders populate roles, units, hospitals, hospital-unit links, sample users, and sample reviews.

### Commands

| Command | Description |
|---------|-------------|
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:migrate:undo` | Undo last migration |
| `npm run db:migrate:undo:all` | Undo all migrations |
| `npm run db:seed` | Run all seeders |
| `npm run db:seed:undo` | Undo all seeders |

---

## Response Envelope

Every HTTP response uses the same structure.

### Success

```json
{
  "status": true,
  "statusCode": 200,
  "message": "Hospitals fetched successfully",
  "errors": [],
  "data": {}
}
```

### Error

```json
{
  "status": false,
  "statusCode": 404,
  "message": "Hospital not found",
  "errors": [],
  "data": null
}
```

### Validation error

```json
{
  "status": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": ["rating: rating must not be greater than 5"],
  "data": null
}
```

---

## Project Structure

```
src/
├── main.ts                 # Bootstrap, global prefix, pipes, Swagger
├── app.module.ts           # Root module, config, throttling, feature imports
├── config/                 # app, auth, database config; env validation; Swagger
├── health/                 # Health check controller
├── common/
│   ├── decorators/         # @CurrentUser(), @Roles()
│   ├── guards/             # JwtAuthGuard, RolesGuard, VerifiedUserGuard
│   ├── filters/            # Global exception filter
│   ├── interceptors/       # Global response wrapper
│   ├── middleware/         # Request logger
│   └── utils/              # DB errors, slugs, review stats, etc.
├── database/
│   ├── migrations/         # Sequelize migrations
│   ├── models/             # Sequelize-typescript models
│   ├── seeders/            # Dev seed data
│   ├── database.module.ts  # PostgreSQL connection
│   └── database.providers.ts
└── modules/
    ├── hospitals/          # List, search, filters, detail
    ├── reviews/            # Create, list by hospital, admin status
    └── users/              # Auth controller + JWT strategy + email helpers
```

Module-specific Swagger lives in `modules/<name>/docs/`. Legacy `modules/*/data/*.mock.ts` files are unused; services read from PostgreSQL via Sequelize models.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run start` | Start app |
| `npm run start:dev` | Start with watch mode |
| `npm run start:prod` | Run compiled `dist/main.js` |
| `npm run build` | Compile TypeScript |
| `npm run db:migrate` | Apply database migrations |
| `npm run db:seed` | Seed database |
| `npm run lint` | ESLint (auto-fix) |
| `npm run test` | Unit tests |
| `npm run test:e2e` | End-to-end tests |
| `npm run test:cov` | Coverage report |

---

## Testing

```bash
npm test
npm run test:e2e
```

E2E tests boot the app with the same global prefix, interceptor, and exception filter used in production. They expect a migrated and seeded database for hospital listing tests.

Use Swagger or Postman against a running `start:dev` instance for full auth and review flows.

---

## Milestone 1 (backend foundation) — delivered scope

| Item | Status |
|------|--------|
| Database schema (hospitals, users, roles, units, reviews) | Done |
| Role- and unit-specific review data | Done |
| Email/password signup and login | Done |
| API structure, routing, environment setup | Done |
| Hospital/facility search endpoint | Done |
| Testable via Swagger / Postman | Done |

Additional endpoints (refresh tokens, email verification, password reset, admin moderation, review stats on listings) are implemented on top of this foundation and documented above.

---

## Related Projects

| Project | Path | Role |
|---------|------|------|
| OpenCurtain Web | [`../opencurtain-web`](../opencurtain-web) | Next.js frontend |

---

## License

UNLICENSED — private MVP.
