# Architecture Guide

How this backend is organized today, how requests flow, and where to add code when PostgreSQL (Sequelize) and JWT auth are introduced.

For API usage and setup, see [README.md](./README.md).

---

## Design principles

1. **Modular monolith** — one deployable NestJS app, domains split by feature module.
2. **Thin controllers** — routing, validation, and Swagger only; business rules live in services.
3. **Unified API contract** — every route returns the same envelope via global interceptor and exception filter.
4. **Progressive complexity** — in-memory mocks today, Sequelize repositories and PostgreSQL integration later without restructuring the application architecture.
5. **Future-ready scaffolding** — folders like `database/`, `guards/`, and `users/` intentionally exist early to avoid large structural refactors when authentication and persistence layers are introduced.

---

## Request lifecycle

```
Client
  → RequestLoggerMiddleware (method + URL)
  → Controller (route + DTO validation)
  → Service (business logic)
  → ControllerResponse { message, data }
  → ResponseInterceptor → ApiResponse envelope
  → Client

Errors anywhere → HttpExceptionFilter → ApiResponse envelope (status: false)
Validation fails → ValidationPipe → BadRequestException → filter
```

| Layer | Location | Responsibility |
|-------|----------|----------------|
| Bootstrap | `src/main.ts` | Global prefix `api/v1`, pipes, interceptor, filter, Swagger |
| Config | `src/config/` | Env validation, `app` config namespace, Swagger setup |
| Middleware | `src/common/middleware/` | Cross-cutting HTTP logging |
| Controllers | `src/modules/*/*.controller.ts` | Routes, Swagger decorators, delegate to service |
| Services | `src/modules/*/*.service.ts` | Business rules, orchestration |
| Cross-cutting | `src/common/filters`, `interceptors` | Envelope formatting |

---

## Folder map

### Root (`src/`)

| Path | Purpose |
|------|---------|
| `main.ts` | Application entry; wires global Nest primitives |
| `app.module.ts` | Imports feature modules, config, middleware |
| `config/` | `app.config.ts`, `env.validation.ts`, `swagger.config.ts` |
| `health/` | Liveness probe (`GET /api/v1/health`) |
| `common/` | Shared infrastructure (not domain logic) |
| `database/` | Sequelize home (migrations, models, seeders) — scaffolded |
| `modules/` | Domain features (hospitals, reviews, users) |

### `common/` — shared infrastructure

| Path | Use when |
|------|----------|
| `constants/` | Messages used across modules |
| `dto/` | Swagger schemas shared by multiple modules |
| `docs/` | Reusable Swagger decorators (`ApiWrappedOkResponse`, etc.) |
| `filters/` | Global exception handling |
| `interceptors/` | Global success response wrapping |
| `interfaces/` | `ApiResponse`, `ControllerResponse` types |
| `middleware/` | Nest middleware (logging, etc.) |
| `utils/` | Pure helpers (e.g. validation flattening) |
| `guards/` | **Future:** JWT, roles, `@UseGuards()` |
| `exceptions/` | **Future:** custom `HttpException` subclasses |

Do **not** put hospital/review business logic in `common/`.

### Feature module (`modules/<feature>/`)

Standard layout per domain:

```
modules/hospitals/
├── hospitals.module.ts
├── hospitals.controller.ts
├── hospitals.service.ts
├── constants/          # User-facing response messages
├── dto/                # Request/response DTOs + class-validator + @ApiProperty
├── docs/               # applyDecorators Swagger bundles per route
├── interfaces/         # Domain types (until Sequelize models replace some)
└── data/               # TEMPORARY in-memory mocks — delete after repositories exist
```

| Folder | Keep after DB? |
|--------|----------------|
| `constants/` | Yes |
| `dto/` | Yes |
| `docs/` | Yes |
| `interfaces/` | Optional — may align with or wrap Sequelize model types |
| `data/` | **No** — remove when repositories are wired |

---

## Adding a new feature module

1. `nest g module modules/<name>` (or create files manually following hospitals/reviews).
2. Add `constants/<name>.response.ts` for messages.
3. Add DTOs in `dto/` with validation + `@ApiProperty`.
4. Add Swagger decorators in `docs/<name>.swagger.ts` using `common/docs/swagger.common.ts`.
5. Implement service returning `ControllerResponse<T>`.
6. Wire controller routes; import module in `app.module.ts`.
7. Export service from module if other modules depend on it (e.g. reviews → hospitals).

---

## Phase 2: Sequelize + PostgreSQL

### 1. Environment

Uncomment and set in `.env` (see `.env.example`):

- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`

Extend `src/config/app.config.ts` and `src/config/env.validation.ts` for required DB vars in production.

### 2. Database layer (`src/database/`)

| Path | Contents |
|------|----------|
| `models/` | Sequelize model definitions (`Hospital`, `Review`, `User`) |
| `migrations/` | Versioned schema changes |
| `seeders/` | Dev/staging seed scripts |
| `database.module.ts` | **Add:** Nest module exporting Sequelize instance |

Register `DatabaseModule` in `app.module.ts` (global or imported by feature modules).

### 3. Repository pattern (per feature module)

Add when mocks are removed:

```
modules/hospitals/
├── repositories/
│   └── hospitals.repository.ts   # findAll, findById, exists — uses Sequelize models
```

**Service change:** inject `HospitalsRepository` instead of reading `HOSPITALS_MOCK`.

```text
Controller → Service → Repository → Sequelize Model → PostgreSQL
```

### 4. Remove temporary mocks

- Delete `modules/hospitals/data/hospitals.mock.ts`
- Delete `modules/reviews/data/reviews.mock.ts`
- Remove `data/` folders if empty

### 5. Reviews + hospitals

Keep `ReviewsModule` importing `HospitalsModule` (or import only `HospitalsRepository` via a shared export). `exists(hospitalId)` moves to repository.

---

## Phase 3: Authentication (JWT)

### 1. Users module (`src/modules/users/`)

| File | Role |
|------|------|
| `users.module.ts` | Auth + user registration/login |
| `users.service.ts` | Credentials, user lookup |
| `users.controller.ts` | `POST /auth/register`, `POST /auth/login` (under `api/v1`) |
| `dto/` | Register/login DTOs |

### 2. Guards (`src/common/guards/`)

| File | Role |
|------|------|
| `jwt-auth.guard.ts` | Protect routes; read user from JWT |
| `optional: roles.guard.ts` | RBAC if needed |

Apply on controllers:

```typescript
@UseGuards(JwtAuthGuard)
@Post()
create(@Body() dto: CreateReviewDto, @CurrentUser() user: UserPayload) { ... }
```

### 3. Reviews service

- Remove `MOCK_USER_ID` constant.
- Set `userId` from JWT payload in controller, pass to service.
- Enforce one review per user per hospital at DB level (unique index) + service check.

### 4. Environment

Uncomment in `.env`:

- `JWT_SECRET` (strong random string in production)
- `JWT_EXPIRES_IN`

Validate in `env.validation.ts`; never commit real secrets (`.env` is gitignored).

---

## API response contract

All handlers should return **`ControllerResponse<T>`** from services/controllers:

```typescript
{ message: string; data: T }
```

The global **`ResponseInterceptor`** converts to:

```typescript
{ status: true, statusCode, message, errors: [], data }
```

Throw Nest **`HttpException`** (or subclasses) for errors; **`HttpExceptionFilter`** formats failures consistently.

Module messages belong in `modules/<feature>/constants/*.response.ts`, not hardcoded in controllers.

---

## Swagger conventions

- **Per-route bundles:** `modules/<feature>/docs/*.swagger.ts` using `applyDecorators`.
- **Shared wrappers:** `common/docs/swagger.common.ts` for envelope + error examples.
- **DTOs:** `@ApiProperty` on all public fields; response DTOs for documented `data` shapes.
- **UI:** `/api/docs` (configured in `config/swagger.config.ts`).

---

## Configuration

| File | Role |
|------|------|
| `.env` | Local secrets and overrides (gitignored) |
| `.env.example` | Committed template for the team |
| `config/app.config.ts` | `registerAs('app', …)` — access via `ConfigService.get('app.port')` |
| `config/env.validation.ts` | Fail fast on invalid env at startup |

---

## Testing strategy

| Type | Location | Notes |
|------|----------|-------|
| Unit | `*.spec.ts` next to service/controller | Mock dependencies (repositories later) |
| E2E | `test/*.e2e-spec.ts` | Boot full app with same global prefix, interceptor, filter |

When DB is added, use a test database or transactional tests; keep E2E focused on HTTP contract.

---

## What not to do

- Put domain logic in `common/` or `main.ts`.
- Return raw entities without going through the response envelope pattern.
- Skip `constants/` and hardcode user-facing strings in controllers.
- Add `repositories/` or `database/` abstractions before you actually need Sequelize.
- Commit `.env` or production secrets to git.

---

## Quick reference: current vs future

| Concern | Now (MVP) | After Sequelize + auth |
|---------|-----------|-------------------------|
| Hospitals data | `data/hospitals.mock.ts` | `repositories/` + `database/models/` |
| Reviews data | `data/reviews.mock.ts` | `repositories/` + `database/models/` |
| User identity | `user-mock-1` in reviews service | JWT + `modules/users/` |
| Auth guards | `.gitkeep` only | `common/guards/jwt-auth.guard.ts` |
| Health | `health/health.controller.ts` | Optional: Terminus + DB ping |

This structure is intended to stay stable across those phases—only fill in scaffolded folders and replace mocks, not rearrange the tree.
