# Architecture Guide

How this backend is organized, how requests flow, and how PostgreSQL, Sequelize, and JWT authentication fit together.

For setup, environment variables, and endpoint list, see [README.md](./README.md).

---

## Design principles

1. **Modular monolith** — one deployable NestJS app, domains split by feature module (`hospitals`, `reviews`, `users`).
2. **Thin controllers** — routing, validation, guards, and Swagger only; business rules live in services.
3. **Unified API contract** — every route returns the same envelope via global interceptor and exception filter.
4. **Sequelize at the persistence boundary** — services inject Sequelize models (`@InjectModel`); no separate repository layer yet.
5. **Stable module layout** — new features add DTOs, constants, docs, and services under `modules/<feature>/` without reshaping the tree.

---

## Request lifecycle

```
Client
  → RequestLoggerMiddleware (method + URL)
  → ThrottlerGuard (auth routes)
  → JwtAuthGuard / RolesGuard (protected routes)
  → Controller (route + DTO validation)
  → Service (business logic + Sequelize)
  → ControllerResponse { message, data }
  → ResponseInterceptor → ApiResponse envelope
  → Client

Errors anywhere → HttpExceptionFilter → ApiResponse envelope (status: false)
Validation fails → ValidationPipe → BadRequestException → filter
```

| Layer | Location | Responsibility |
|-------|----------|----------------|
| Bootstrap | `src/main.ts` | Global prefix `api/v1`, CORS, pipes, interceptor, filter, Swagger |
| Config | `src/config/` | `app`, `auth`, `database` namespaces; env validation at startup |
| Middleware | `src/common/middleware/` | Cross-cutting HTTP logging |
| Guards | `src/common/guards/` | JWT auth, admin roles, optional verified-user check |
| Controllers | `src/modules/*/*.controller.ts` | Routes, Swagger, delegate to service |
| Services | `src/modules/*/*.service.ts` | Business rules, Sequelize queries |
| Models | `src/database/models/` | Table definitions and associations |
| Cross-cutting | `src/common/filters`, `interceptors` | Envelope formatting |

---

## Folder map

### Root (`src/`)

| Path | Purpose |
|------|---------|
| `main.ts` | Application entry; wires global Nest primitives |
| `app.module.ts` | Config, throttling, `DatabaseModule`, feature modules |
| `config/` | `app.config.ts`, `auth.config.ts`, `database.config.ts`, `env.validation.ts`, Swagger |
| `health/` | Liveness probe (`GET /api/v1/health`) |
| `common/` | Shared infrastructure (not domain logic) |
| `database/` | Migrations, models, seeders, `DatabaseModule` |
| `modules/` | Domain features (hospitals, reviews, users/auth) |

### `common/` — shared infrastructure

| Path | Use when |
|------|----------|
| `constants/` | Messages used across modules |
| `dto/` | Swagger schemas shared by multiple modules |
| `docs/` | Reusable Swagger decorators (`ApiWrappedOkResponse`, etc.) |
| `decorators/` | `@CurrentUser()`, `@Roles()` |
| `guards/` | `JwtAuthGuard`, `RolesGuard`, `VerifiedUserGuard` |
| `filters/` | Global exception handling |
| `interceptors/` | Global success response wrapping |
| `interfaces/` | `ApiResponse`, `ControllerResponse` types |
| `middleware/` | Nest middleware (logging) |
| `utils/` | Pure helpers (validation, slugs, DB errors, review stats) |

Do **not** put hospital/review business logic in `common/`.

### `database/`

| Path | Contents |
|------|----------|
| `database.module.ts` | Global Sequelize connection to PostgreSQL (`synchronize: false`) |
| `database.providers.ts` | Exported model list for `SequelizeModule.forFeature()` |
| `models/` | `Role`, `User`, `Hospital`, `Unit`, `HospitalUnit`, `Review`, token models |
| `migrations/` | Versioned schema (roles → users → hospitals → units → reviews → auth tokens) |
| `seeders/` | Roles, units, hospitals, hospital_units, users, reviews |

### Feature module (`modules/<feature>/`)

```
modules/hospitals/
├── hospitals.module.ts
├── hospitals.controller.ts
├── hospitals.service.ts
├── hospital-filters.service.ts
├── constants/
├── dto/
├── docs/
└── utils/
```

| Folder | Purpose |
|--------|---------|
| `constants/` | User-facing response messages |
| `dto/` | Request/response DTOs + class-validator + `@ApiProperty` |
| `docs/` | `applyDecorators` Swagger bundles per route |
| `utils/` | Domain-specific pure helpers (e.g. hospital review stats) |
| `data/` | **Legacy only** — unused mock files; services use Sequelize models |

```text
Controller → Service → Sequelize Model → PostgreSQL
```

`ReviewsModule` uses hospital and unit data via injected models and validates `hospital_units` before create.

---

## Data model (role- and unit-aware)

Core relationships for Milestone 1:

- **`roles`** — occupation catalog; each **`users`** row has `role_id`.
- **`units`** — global unit names (ICU, Med-Surg, …).
- **`hospital_units`** — many-to-many: which units a given hospital offers.
- **`reviews`** — `hospital_id`, `unit_id`, `user_id`, `role_id` (role at submit time from JWT user), plus rating, comment, employment/shift fields, `status`, and optional compensation/workload fields.

Unique constraint: one review per `(hospital_id, user_id)`.

Reviews are created as `pending`; public hospital review lists filter to `approved`.

---

## Authentication

### Users module (`modules/users/`)

| File | Role |
|------|------|
| `users.module.ts` | JWT, Passport, Sequelize models, `AuthTokensService`, `EmailService` |
| `users.controller.ts` | Routes under `auth/` (signup, login, refresh, verify, reset, me, admin) |
| `users.service.ts` | Signup (bcrypt hash, role lookup by occupation), login, token issuance |
| `auth-tokens.service.ts` | Refresh token persistence; verification/reset token storage |
| `strategies/jwt.strategy.ts` | Validates access token; loads user + role |
| `email.service.ts` | Dev: logs links; production: warns if SMTP not configured |

### Guards

| Guard | Role |
|-------|------|
| `jwt-auth.guard.ts` | Requires valid Bearer access token |
| `roles.guard.ts` | Enforces `@Roles('admin')` (and similar) |
| `verified-user.guard.ts` | Optional gate for verified accounts |

Protected example: `POST /api/v1/reviews` uses `JwtAuthGuard`; `userId` and `roleId` come from the JWT payload, not the request body.

### Token flow

1. Signup/login → access JWT + opaque refresh token (refresh stored hashed in `refresh_tokens`).
2. `POST /auth/refresh` → rotate refresh token, return new pair.
3. `POST /auth/logout` → revoke refresh token row.

Email verification and password reset use rows in `auth_tokens`; links use `APP_PUBLIC_URL` and are logged in development.

---

## Hospitals module

| Concern | Implementation |
|---------|----------------|
| List / filter | `findAndCountAll` with `Op.iLike` on city, state, facility type; rating range on `average_rating` |
| Search | Same as list plus `Op.or` across name, city, state, `cms_id`, `facility_type` |
| Detail | Hospital row + `hospital_units` → units; approved review count and aggregated stats |
| Slug route | Parses `name-id` slug to numeric id |
| Filters endpoint | Distinct states and facility types from live data |

---

## Reviews module

| Concern | Implementation |
|---------|----------------|
| Create | Validates hospital, hospital-unit mapping, no duplicate user review; sets `roleId` from authenticated user |
| List by hospital | Paginated, `status: approved`, includes unit/role/user |
| Admin status | `PATCH :id/status` with `RolesGuard` + `admin` |

---

## API response contract

All handlers should return **`ControllerResponse<T>`** from services:

```typescript
{ message: string; data: T }
```

The global **`ResponseInterceptor`** converts to:

```typescript
{ status: true, statusCode, message, errors: [], data }
```

Throw Nest **`HttpException`** for errors; **`HttpExceptionFilter`** formats failures consistently.

Module messages belong in `modules/<feature>/constants/*.response.ts`.

---

## Swagger conventions

- **Per-route bundles:** `modules/<feature>/docs/*.swagger.ts` using `applyDecorators`.
- **Shared wrappers:** `common/docs/swagger.common.ts` for envelope + error examples.
- **Bearer auth:** `@ApiBearerAuth('bearer')` on protected routes; authorize in Swagger UI after login.
- **UI:** `/api/docs` (see `config/swagger.config.ts`).

---

## Configuration

| File | Role |
|------|------|
| `.env.example` | Committed template; `cp .env.example .env` per machine |
| `.env` | Real secrets (gitignored) |
| `config/app.config.ts` | Port, CORS, bcrypt rounds, `NODE_ENV` |
| `config/auth.config.ts` | JWT and token TTLs, `APP_PUBLIC_URL` |
| `database/database.config.ts` | PostgreSQL connection settings |
| `config/env.validation.ts` | Fail fast on invalid env; enforces strong `JWT_SECRET` in production |

---

## Testing strategy

| Type | Location | Notes |
|------|----------|-------|
| Unit | `*.spec.ts` next to service/controller | Mock Sequelize models with `jest` |
| E2E | `test/app.e2e-spec.ts` | Full app module; expects DB with seed data for hospital list |

Set `JWT_SECRET` in the test environment (e2e sets a fallback if unset).

---

## Adding a new feature module

1. Create `modules/<name>/` following hospitals/reviews layout.
2. Add `constants/<name>.response.ts`, DTOs, `docs/*.swagger.ts`.
3. Implement service returning `ControllerResponse<T>`; register models in the module via `SequelizeModule.forFeature`.
4. Import the module in `app.module.ts`.
5. Add migrations/seeders if new tables are required.

Optional later: extract `repositories/` if query complexity grows; not required today.

---

## What not to do

- Put domain logic in `common/` or `main.ts`.
- Return raw entities without the response envelope pattern.
- Hardcode user-facing strings in controllers (use `constants/`).
- Enable `synchronize: true` in production (use migrations).
- Commit `.env` or production secrets to git.

---

## Optional future work

| Area | Idea |
|------|------|
| Email | Wire SMTP or provider in `EmailService` for production |
| Repositories | Thin repository layer if services grow large |
| Health | Terminus module with DB ping |
| Cleanup | Remove unused `modules/*/data/*.mock.ts` files |
| E2E | Broader coverage for auth signup/login and review create |

The current tree is intended to stay stable; extend modules and migrations rather than reorganizing the app.
