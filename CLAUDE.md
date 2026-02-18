# CLAUDE.md -- School Management System

> **For Claude Code.** This is your single source of truth when working on this codebase. Read it fully before making changes. Follow every convention exactly.

---

## What This Project Is

A **multi-tenant SaaS school management system** backend. 45 domain modules, 49 Prisma models, 226 API endpoints across 10 implementation phases. Production-grade Node.js/TypeScript with Express 5, Prisma 7, and PostgreSQL.

---

## Ground Rules

- Read relevant module files before modifying them. Understand existing patterns first.
- After changes, run `npm run typecheck` to verify compilation.
- After writing tests, run `npm test` immediately. Fix failures before moving on.
- Never guess at types. If something is unclear, ask the user.
- Prefer explicit over clever.
- Follow existing patterns exactly. Every module uses identical layering.

---

## Tech Stack (locked, do not substitute)

| Layer | Choice | Version | Notes |
|---|---|---|---|
| Runtime | Node.js 24.x | LTS | Native type stripping, `--env-file`, `--watch` |
| Language | TypeScript | 5.9+ | Strict mode, erasable syntax only |
| Modules | ESM only | | `"type": "module"` in package.json |
| Framework | Express | 5.x | Native async error handling, no wrapper needed |
| ORM | Prisma | 7.x | With `@prisma/adapter-pg` for connection pooling |
| DB Driver | pg | 8.x | PostgreSQL connection pool |
| Validation | Zod | 4.x | Runtime validation + TS type inference |
| Logging | pino + pino-http + pino-pretty | | Structured JSON logging |
| Testing | `node:test` + `node:assert/strict` | | Built-in, no external test framework |
| Auth | jose (JWT HS256), argon2 (hashing) | | argon2id, not bcrypt |
| API Docs | swagger-jsdoc + swagger-ui-express | | OpenAPI 3.1, served at `/api-docs` |
| Linting | ESLint 9 flat config + Prettier | | TypeScript-aware rules |
| HTTP Security | helmet, cors, express-rate-limit | | Always applied globally |

---

## TypeScript Strategy (Node.js 24 Native Type Stripping)

Node.js 24 strips type annotations at runtime natively. No flags, no transpilation for dev. However, it does NOT transform TS-only syntax like `enum`, `namespace`, or constructor parameter properties.

**Rules:**
- Write imports with `.ts` extensions: `import { foo } from './bar.ts'`
- Never use TS `enum`. Use `as const` objects (Prisma enums in `.prisma` files are fine)
- `erasableSyntaxOnly: true` in tsconfig catches violations
- Dev: `node --env-file=.env --watch src/index.ts`
- Build: `tsc` rewrites `.ts` imports to `.js` via `rewriteRelativeImportExtensions`
- Prod: `node dist/index.js`

**Enum replacement pattern:**
```typescript
// WRONG: TS enum
enum Role { ADMIN = 'ADMIN', USER = 'USER' }

// CORRECT: as const object + type derivation
export const Role = { ADMIN: 'ADMIN', USER: 'USER' } as const;
export type Role = (typeof Role)[keyof typeof Role];
```

---

## Project Structure

```
project-root/
├── CLAUDE.md
├── package.json
├── tsconfig.json
├── Dockerfile
├── .env / .env.example / .env.test
├── .gitignore
├── prisma/
│   ├── schema.prisma              # 49 models, 23 enums
│   ├── migrations/
│   └── seed.ts                    # Idempotent seed (permissions, roles, demo data)
├── src/
│   ├── index.ts                   # Entry point, graceful shutdown
│   ├── server.ts                  # Express app factory (no listening)
│   ├── container.ts               # DI wiring: all repos → services → controllers
│   ├── config/
│   │   ├── env.ts                 # Zod-validated env vars
│   │   └── swagger.ts             # OpenAPI 3.1 spec generation
│   ├── generated/prisma/          # Prisma generated client (git-ignored)
│   ├── modules/                   # 45 domain modules
│   │   ├── auth/                  # JWT login, refresh, forgot/reset password, profile
│   │   ├── school/                # Multi-tenant school management
│   │   ├── user/                  # User CRUD with role assignment
│   │   ├── role/                  # RBAC role management
│   │   ├── permission/            # Permission listing (read-only)
│   │   ├── student/               # Student CRUD (soft delete)
│   │   ├── teacher/               # Teacher CRUD (soft delete)
│   │   ├── guardian/              # Guardian CRUD (soft delete)
│   │   ├── lesson/                # Scheduling + timetable views
│   │   ├── fee-invoice/           # Invoicing with status workflow
│   │   ├── fee-payment/           # Payment recording + invoice status update
│   │   ├── financial-report/      # Aggregation reports
│   │   ├── self-service/          # /my/* portal (teacher/student/guardian)
│   │   ├── dashboard/             # Admin + platform dashboards
│   │   ├── audit-log/             # Audit trail viewer
│   │   └── ... (30+ more)        # Each follows identical 4-layer pattern
│   └── shared/
│       ├── audit/
│       │   └── audited-prisma.ts  # Prisma $extends interceptor for audit logging
│       ├── context/
│       │   └── request-context.ts # AsyncLocalStorage for request-scoped data
│       ├── errors/
│       │   ├── app-error.ts       # Custom AppError class
│       │   └── error-handler.ts   # Express error middleware
│       ├── middleware/
│       │   ├── auth.middleware.ts  # authenticate, requirePermission, extractSchoolId
│       │   ├── audit-context.middleware.ts  # Populates AsyncLocalStorage per request
│       │   ├── feature-gate.middleware.ts   # Subscription plan feature gating
│       │   ├── rate-limit.middleware.ts     # authRateLimit, refreshRateLimit
│       │   └── request-id.middleware.ts     # X-Request-Id header
│       ├── utils/
│       │   ├── logger.ts          # Pino logger (redacts passwords, auth headers)
│       │   ├── pagination.ts      # buildPaginatedResult helper
│       │   └── password.ts        # hashPassword, verifyPassword (argon2id)
│       ├── types/
│       │   └── index.ts           # ApiResponse, ApiErrorResponse, PaginatedResponse, JwtPayload
│       └── database.ts            # Prisma client with pg pool + audit interceptor
├── tests/
│   ├── integration/
│   │   └── api.integration.test.ts
│   └── helpers/
│       └── setup.ts
└── dist/                          # Build output (git-ignored)
```

---

## Module Architecture (Strict 4-Layer Pattern)

Every domain module follows **Routes → Controller → Service → Repository**. Each layer only calls the one directly below. Never skip layers.

```
src/modules/<entity>/
├── <entity>.routes.ts       # Route registration + middleware binding
├── <entity>.controller.ts   # HTTP concerns: parse request, call service, format response
├── <entity>.service.ts      # Business logic, validation, orchestration
├── <entity>.repository.ts   # Data access via Prisma, zero business logic
└── <entity>.schema.ts       # Zod schemas + derived TS types
```

### Adding a New Module

1. Create the 5 files following the pattern above
2. Wire in `container.ts`: Repository → Service → Controller
3. Register routes in `server.ts` under the appropriate phase comment
4. Add OpenAPI JSDoc comments to the routes file
5. Run `npm run typecheck`

### Key Conventions Per Layer

**Repository:**
- Constructor receives `PrismaClient`
- All read queries filter by `schoolId` (multi-tenancy) and `deletedAt: null` (if soft-delete model)
- Returns raw Prisma results. Uses `buildPaginatedResult()` for list queries
- Zero business logic

**Service:**
- Constructor receives its Repository (and optionally other repos for cross-entity logic)
- Throws `AppError` for operational failures (404, 409, etc.)
- First parameter for list/create operations is `schoolId: string`
- Validates business rules before calling repository

**Controller:**
- Constructor receives its Service
- Methods are arrow functions (preserves `this` binding)
- Parses request via Zod: `req.body`, `req.params`, `req.query`
- Extracts `schoolId` via `extractSchoolId(req)` from JWT
- Returns consistent envelope: `{ success: true, data }` or `{ success: true, data, meta }`

**Routes:**
- Factory function: `createXxxRoutes(controller: XxxController): Router`
- Apply `authenticate` middleware on mutating routes
- Apply `requirePermission(...)` for role-based access
- Apply `requireFeature(...)` for subscription-gated features
- Include `@openapi` JSDoc blocks for Swagger documentation

---

## Multi-Tenancy

Every model (except global ones like Permission) has a `schoolId` FK. This is the core isolation boundary.

- **Regular users**: `schoolId` is baked into JWT. `extractSchoolId(req)` reads it from the token
- **Super admins**: `schoolId` is `null` in JWT. They pass `X-School-Id` header to specify which school
- **Repositories**: All queries must filter by `schoolId`. Never return cross-school data
- **Cascade rule**: Most child models use `onDelete: Restrict` on schoolId to prevent accidental school deletion

```typescript
// In controllers, always extract schoolId from JWT:
const schoolId = extractSchoolId(req);
const result = await this.service.list(schoolId, query);
```

---

## Authentication & Authorization

### JWT Strategy
- **Algorithm**: HS256 via `jose` library
- **Access token**: Configurable expiry (`JWT_EXPIRES_IN`, default `1h`)
- **Refresh token**: Configurable expiry (`JWT_REFRESH_EXPIRES_IN`, default `7d`)
- **Payload shape** (`JwtPayload`): `{ sub, schoolId, roles[], permissions[] }`

### RBAC
- Permissions follow `module.action` format: `"students.view"`, `"users.create"`, `"roles.manage_permissions"`
- 7 seed roles: super_admin, school_admin, principal, teacher, student, guardian, accountant
- `requirePermission('students.view', 'students.create')` — user needs ANY of the listed permissions
- Roles are per-school (`@@unique([schoolId, name])`)

### Auth Middleware Stack
```typescript
// Public route
router.get('/', controller.list);

// Authenticated route
router.post('/', authenticate, controller.create);

// Authenticated + permission-gated
router.delete('/:id', authenticate, requirePermission('students.delete'), controller.remove);

// Authenticated + feature-gated (subscription plan)
router.get('/reports', authenticate, requireFeature('fee_management', prisma), controller.reports);
```

---

## Soft Delete Pattern

Models with `deletedAt` field: **Student**, **Guardian**, **Teacher**.

```typescript
// Repository: filter ALL read queries
async findById(id: string) {
  return this.db.student.findFirst({ where: { id, deletedAt: null } });
}

// Soft delete (not hard delete)
async softDelete(id: string) {
  return this.db.student.update({ where: { id }, data: { deletedAt: new Date() } });
}
```

---

## Audit Logging

Automatic via Prisma `$extends` interceptor in `shared/audit/audited-prisma.ts`.

**Audited models**: studentGrade, feeInvoice, feePayment, lesson, studentEnrollment, teacherLeave, substitution, user.

**How it works:**
1. `shared/context/request-context.ts` uses `AsyncLocalStorage` to store `{ userId, schoolId, ipAddress, userAgent }` per request
2. `audit-context.middleware.ts` populates the store on every request
3. `authenticate` middleware updates `userId` and `schoolId` after JWT verification
4. Prisma interceptor captures INSERT/UPDATE/DELETE on audited models, writes to `AuditLog` table asynchronously (non-blocking)

**To add a new audited model**, update `AUDITED_MODELS` and `MODEL_TABLE_MAP` in `audited-prisma.ts`.

---

## Subscription Feature Gating

Middleware `requireFeature(feature, prisma)` in `shared/middleware/feature-gate.middleware.ts`.

**Plan hierarchy**: `free → basic → premium → enterprise`

**Feature → minimum plan map**:
| Feature | Plan |
|---|---|
| report_cards, fee_management | basic |
| auto_scheduling, per_lesson_attendance, online_payment, sms_notifications, custom_roles, audit_logs | premium |
| api_access | enterprise |

---

## Database

**Connection setup** (`shared/database.ts`):
- Uses `pg` Pool + `@prisma/adapter-pg` for connection pooling
- Wraps base Prisma client with audit interceptor via `createAuditedPrisma()`
- Casts extended client back to `PrismaClient` for type compatibility
- Exports: `prisma` (audited), `basePrisma` (raw), `disconnectDatabase()`

**Prisma naming convention**:
- Models: PascalCase (`StudentEnrollment`)
- DB tables: snake_case plural via `@@map("student_enrollments")`
- DB columns: snake_case via `@map("created_at")`
- TypeScript fields: camelCase (Prisma default)

**Every model must include**:
```prisma
model Entity {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt      @map("updated_at")
  // ... entity-specific fields
  @@map("entities")
}
```

---

## Environment Variables

Validated at startup via Zod in `config/env.ts`. App crashes if invalid (intentional).

```env
NODE_ENV=development          # development | production | test
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname?schema=public
JWT_SECRET=min-32-characters-long-secret-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
LOG_LEVEL=debug               # fatal | error | warn | info | debug | trace
CORS_ORIGIN=http://localhost:3000
REDIS_URL=redis://localhost:6379   # Future use
```

Loaded via Node.js 24 native `--env-file` flag in package.json scripts. No dotenv library.

---

## API Response Envelope

Every endpoint returns one of these shapes:

```typescript
// Single resource
{ "success": true, "data": { ... } }

// List with pagination
{ "success": true, "data": [...], "meta": { "page": 1, "limit": 20, "total": 87, "totalPages": 5 } }

// Error
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "Invalid input", "details": [...] } }

// No content (204): empty body
```

---

## Error Handling

Centralized in `shared/errors/error-handler.ts`. All errors bubble to this middleware.

| Error Type | HTTP Status | Code |
|---|---|---|
| `AppError` | Custom (`statusCode`) | Custom (`code`) |
| `ZodError` | 422 | `VALIDATION_ERROR` |
| Prisma `P2002` (unique) | 409 | `UNIQUE_VIOLATION` |
| Prisma `P2025` (not found) | 404 | `NOT_FOUND` |
| Prisma `P2003` (FK violation) | 400 | `FK_VIOLATION` |
| Unknown | 500 | `INTERNAL_ERROR` |

---

## OpenAPI Documentation

- Swagger UI: `GET /api-docs`
- Raw spec: `GET /api-docs.json`
- Generated from `@openapi` JSDoc comments in route files
- Config in `src/config/swagger.ts`
- Scans `./src/modules/**/*.routes.ts`

Every route should have an `@openapi` JSDoc block with tags, summary, parameters, requestBody, and responses. Follow existing examples in route files.

---

## Zod Schema Conventions

```typescript
// Base schema (mirrors Prisma model)
export const studentSchema = z.object({ ... });

// Create input (omit server-generated fields)
export const createStudentSchema = z.object({ ... });

// Update input (partial of create)
export const updateStudentSchema = createStudentSchema.partial();

// ID param validation
export const idParamSchema = z.object({ id: z.string().uuid('Invalid ID format') });

// List query with coercion (query params arrive as strings)
export const listStudentsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().max(255).optional(),
  // ... entity-specific filters
});

// Always derive TS types from Zod schemas
export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type ListStudentsQuery = z.infer<typeof listStudentsQuerySchema>;
```

**Rules:**
- Always derive TS types from Zod schemas. Never hand-write duplicate interfaces.
- Always use `z.coerce` for query params.
- Never include `password` or `passwordHash` in response schemas.

---

## DI Wiring (container.ts)

Simple factory function. No DI framework. Explicit construction:

```typescript
const studentRepo = new StudentRepository(prisma);
const studentService = new StudentService(studentRepo);
const studentController = new StudentController(studentService);
```

Some services receive multiple repositories for cross-entity logic (e.g., `TermService` gets `termRepo` + `academicYearRepo`). Some services receive `prisma` directly for complex transactions.

---

## Route Organization in server.ts

Routes are registered under phase comments matching the implementation phases:

| Phase | Route Prefix | Domain |
|---|---|---|
| 1 | `/api/v1/auth`, `/api/v1/users`, `/api/v1/roles`, `/api/v1/permissions`, `/api/v1/platform/schools`, `/api/v1/school/profile` | Foundation |
| 2 | `/api/v1/academic-years`, `/api/v1/terms`, `/api/v1/departments`, `/api/v1/grades`, `/api/v1/subjects`, `/api/v1/class-sections` | Academic Structure |
| 3 | `/api/v1/students`, `/api/v1/guardians`, `/api/v1/enrollments`, `/api/v1/teachers` | People |
| 4 | `/api/v1/period-sets`, `/api/v1/rooms` | Time & Space |
| 5 | `/api/v1/lessons`, `/api/v1/timetable`, `/api/v1/substitutions` | Scheduling |
| 6 | `/api/v1/student-attendance`, `/api/v1/teacher-attendance`, `/api/v1/teacher-leaves` | Daily Operations |
| 7 | `/api/v1/grading-scales`, `/api/v1/exams`, `/api/v1/report-cards` | Assessment |
| 8 | `/api/v1/fee-categories`, `/api/v1/fee-structures`, `/api/v1/fee-invoices`, `/api/v1/fee-payments`, `/api/v1/reports/fees` | Finance |
| 9 | `/api/v1/announcements`, `/api/v1/notifications`, `/api/v1/academic-events` | Communication |
| 10 | `/api/v1/audit-logs`, `/api/v1/my`, `/api/v1/dashboard`, `/api/v1/platform` | Audit, Self-Service, Dashboard |

Some modules use nested routes (e.g., `/api/v1/students/:studentId/guardians`, `/api/v1/exams/:examId/subjects`).

---

## Scripts

```json
{
  "dev": "node --env-file=.env --watch src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js",
  "typecheck": "tsc --noEmit",
  "test": "node --env-file=.env.test --test tests/**/*.test.ts",
  "test:watch": "node --env-file=.env.test --test --watch tests/**/*.test.ts",
  "lint": "eslint src/ tests/",
  "format": "prettier --write \"src/**/*.ts\" \"tests/**/*.ts\"",
  "db:generate": "prisma generate",
  "db:migrate:dev": "prisma migrate dev",
  "db:migrate:prod": "prisma migrate deploy",
  "db:push": "prisma db push",
  "db:seed": "node --env-file=.env prisma/seed.ts",
  "db:studio": "prisma studio"
}
```

---

## Testing

- Framework: `node:test` + `node:assert/strict` exclusively. No Jest, Vitest, Mocha, or Chai.
- Structure: Arrange/Act/Assert
- Mock at the repository boundary. Never mock the database directly.
- Integration tests in `tests/integration/` use a real test database (`.env.test`)
- Run: `npm test`. Fix all failures before committing.

---

## Code Quality Rules

- No `any`. Use `unknown` and narrow with type guards or Zod.
- No non-null assertions (`!`). Handle nullability explicitly.
- No `console.log` / `console.error`. Use the pino `logger`.
- No floating promises. Every promise is `await`ed or returned.
- No TS `enum`. Use `as const` objects.
- No `require()`. ESM imports only.
- No barrel files (`index.ts` re-exports) except `shared/types/index.ts`.
- Use `import type` for type-only imports (enforced by `verbatimModuleSyntax`).
- Use `node:` prefix for all built-in modules.
- Prefer `Promise.all()` for independent concurrent operations.
- Keep functions under 40 lines. Extract when larger.

---

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Files | `entity.layer.ts` | `student.service.ts` |
| Module folders | kebab-case | `fee-invoice/` |
| Classes | PascalCase | `FeeInvoiceService` |
| Functions, variables | camelCase | `findById` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES` |
| Types (derived from Zod) | PascalCase, no `I` prefix | `CreateStudentInput` |
| `as const` objects | PascalCase | `Role` |
| Prisma models | PascalCase | `StudentEnrollment` |
| DB tables (`@@map`) | snake_case plural | `student_enrollments` |
| DB columns (`@map`) | snake_case | `created_at` |
| Env vars | UPPER_SNAKE_CASE | `DATABASE_URL` |
| Route paths | kebab-case plural | `/api/v1/fee-invoices` |
| Permissions | `module.action` | `students.view` |

---

## Security Checklist

- All inputs validated with Zod before processing
- Passwords hashed with argon2id (never stored plain)
- Passwords excluded from all API responses
- `helmet` applied globally (with CSP directives configured)
- `cors` configured with explicit origins
- Rate limiting on auth endpoints: `authRateLimit` (10/15min), `refreshRateLimit` (30/15min)
- UUID validated on all route params via Zod
- No stack traces in production error responses
- Log redaction for passwords, tokens, auth headers
- `--env-file` for env loading (no dotenv in production)
- Parameterized queries only (Prisma handles this)
- Multi-tenant isolation enforced at repository level via `schoolId`

---

## Verification Checklist (run after changes)

1. `npx prisma validate` passes
2. `npm run typecheck` passes (zero errors)
3. `npm test` passes (zero failures)
4. `npm run lint` passes
5. New modules have all 5 files: schema, repository, service, controller, routes
6. New modules wired in `container.ts` and registered in `server.ts`
7. Routes have `@openapi` JSDoc blocks
8. Multi-tenant queries filter by `schoolId`
9. Soft-delete models filter by `deletedAt: null` in all read queries
