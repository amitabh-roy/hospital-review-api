# Hospital Review API

Production-oriented NestJS backend for hospital listings and reviews. Built for clarity, consistent API contracts, modular scalability, and a clean transition path to PostgreSQL (Sequelize) and JWT authentication.

---

## Features

- **Versioned REST API** — `api/v1` prefix on all routes
- **Unified response envelope** — same JSON shape for success and errors
- **Global validation** — `class-validator` with structured error messages
- **OpenAPI docs** — Swagger UI at `/api/docs`
- **Modular domain layout** — hospitals and reviews as isolated Nest modules
- **In-memory persistence** — typed mock data layer designed to be replaced by Sequelize repositories without restructuring modules
- **Request logging** — HTTP method + path on every request
- **Health endpoint** — `GET /api/v1/health` for probes and uptime checks

---

## Tech Stack

| Layer | Choice |
|--------|--------|
| Runtime | Node.js |
| Framework | NestJS 11 |
| Language | TypeScript |
| Validation | class-validator, class-transformer |
| API docs | @nestjs/swagger |
| Config | @nestjs/config |

**Planned:** PostgreSQL, Sequelize, JWT auth (folders scaffolded under `src/database`, `src/modules/users`, `src/common/guards`).

---

## Quick Start

### Prerequisites

- Node.js 20+
- npm 10+

### Install & run

```bash
git clone <repository-url>
cd hospital-review-api
npm install
cp .env.example .env
npm run start:dev
```

| Resource | URL |
|----------|-----|
| API base | `http://localhost:3000/api/v1` |
| Swagger | `http://localhost:3000/api/docs` |
| Health | `http://localhost:3000/api/v1/health` |

### Production build

```bash
npm run build
npm run start:prod
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP listen port |
| `NODE_ENV` | `development` | `development` \| `production` \| `test` |

Copy `.env.example` to `.env` (or use the included `.env` for local dev) and adjust as needed. Additional variables for database and auth are documented in `.env.example` for future use.

**Architecture:** See [ARCHITECTURE.md](./ARCHITECTURE.md) for folder conventions, request flow, and how to add Sequelize, repositories, and JWT without restructuring the project.

---

## API Reference

All endpoints return the [response envelope](#response-envelope) below.

### Health

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/health` | Service liveness |

### Hospitals

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/hospitals` | List all hospitals |
| `GET` | `/api/v1/hospitals/:id` | Get hospital by ID |

### Reviews

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/reviews` | Submit a review |

#### Create review body

```json
{
  "hospitalId": "1",
  "rating": 5,
  "comment": "Excellent care and friendly staff."
}
```

**Rules (MVP):**

- `hospitalId` must match an existing hospital
- `rating` is 1–5 (integer)
- One review per mock user per hospital (`user-mock-1` until JWT is added)

### Example requests

```bash
curl http://localhost:3000/api/v1/hospitals
curl http://localhost:3000/api/v1/hospitals/1
curl -X POST http://localhost:3000/api/v1/reviews \
  -H "Content-Type: application/json" \
  -d '{"hospitalId":"2","rating":4,"comment":"Good experience"}'
```

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
  "data": []
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
├── main.ts                 # Bootstrap, global pipes/filters/interceptors
├── app.module.ts           # Root module, middleware, config
├── config/                 # App config, env validation, Swagger setup
├── health/                 # Health check controller
├── common/
│   ├── constants/          # Shared API messages
│   ├── dto/                # Shared Swagger DTOs
│   ├── docs/               # Reusable Swagger decorators
│   ├── filters/            # Global exception filter
│   ├── interceptors/       # Global response wrapper
│   ├── interfaces/         # ApiResponse, ControllerResponse
│   ├── middleware/         # Request logger
│   ├── utils/              # Validation helpers
│   ├── guards/             # (.gitkeep) JWT guards — future
│   └── exceptions/         # (.gitkeep) Custom exceptions — future
├── database/
│   ├── migrations/         # (.gitkeep) Sequelize migrations — future
│   ├── models/             # (.gitkeep) Sequelize models — future
│   └── seeders/            # (.gitkeep) Seed scripts — future
└── modules/
    ├── hospitals/          # List & detail APIs
    │   ├── constants/      # User-facing messages
    │   ├── data/           # In-memory mock (temporary)
    │   ├── docs/           # Swagger decorators
    │   ├── dto/
    │   └── interfaces/
    ├── reviews/            # Submit review API
    └── users/              # (.gitkeep) Auth module — future
```

Module-specific Swagger lives in `modules/<name>/docs/`. Cross-cutting Swagger helpers live in `common/docs/`.

For conventions, phased rollout (DB, auth), and “where to put new code,” see **[ARCHITECTURE.md](./ARCHITECTURE.md)**.

The architecture intentionally separates cross-cutting concerns (filters, interceptors, middleware) from domain modules to keep future database/auth integrations isolated and maintainable.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run start` | Start app |
| `npm run start:dev` | Start with watch mode |
| `npm run start:prod` | Run compiled `dist/main.js` |
| `npm run build` | Compile TypeScript |
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

E2E tests boot the app with the same global prefix, interceptor, and exception filter used in production.

---

## Roadmap

| Phase | Work |
|-------|------|
| **Now** | In-memory stores, mock user, OpenAPI, unified responses |
| **Next** | Sequelize + PostgreSQL (`src/database`), replace `data/*.mock.ts` with repositories |
| **Then** | `UsersModule`, JWT guards (`src/common/guards`), email verification, rate limiting |

Planned persistence sketch:

- **users** — id, email, password hash, role, isVerified
- **hospitals** — id, name, city, state
- **reviews** — id, hospitalId, userId, rating, comment, createdAt

---

## License

UNLICENSED — private MVP.
