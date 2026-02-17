# School Management System - API Backend

A production-ready, multi-tenant SaaS backend for managing schools. Built with Node.js 24, TypeScript 5.9, Express 5, Prisma 7, and PostgreSQL.

## Project Stats

| Metric | Count |
|---|---|
| API Endpoints | 226 |
| Prisma Models | 49 |
| Prisma Enums | 23 |
| Modules | 45 |
| Permissions | 111 |
| Source Files | 297 |
| Lines of Code | ~23,000 (excluding generated) |

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 24 (native TypeScript stripping) |
| Language | TypeScript 5.9 (strict mode, ESM only) |
| Framework | Express 5.x (native async error handling) |
| ORM | Prisma 7.4 with `@prisma/adapter-pg` |
| Validation | Zod 4 |
| Auth | JWT via `jose`, password hashing via `argon2` |
| Logging | pino + pino-http |
| API Docs | Swagger UI (OpenAPI 3.1) |
| Security | helmet, cors, express-rate-limit |
| Testing | `node:test` + `node:assert/strict` |

## Architecture

```
src/
  config/          # Environment validation, Swagger config
  shared/          # Errors, middleware, utils, database, audit, types
  modules/         # 45 domain modules (routes -> controller -> service -> repository)
  container.ts     # Dependency injection wiring
  server.ts        # Express app factory
  index.ts         # Entry point with graceful shutdown
```

Each module follows a strict 4-layer architecture:

```
Routes -> Controller -> Service -> Repository
```

- **Routes**: HTTP method + path + middleware chain
- **Controller**: Parse request, call service, format response
- **Service**: Business logic, validation, orchestration
- **Repository**: Data access via Prisma (zero business logic)

## Features by Phase

### Phase 1: Foundation
- Multi-tenant school management (create, update, suspend, reactivate)
- JWT authentication (login, refresh, logout, forgot/reset password)
- User management with role assignment
- Role-based access control (RBAC) with 111 granular permissions
- 7 seed roles: super_admin, school_admin, principal, teacher, student, guardian, accountant

### Phase 2: Academic Structure
- Academic years with activation workflow and date-overlap validation
- Terms nested under academic years
- Departments, grades, subjects with grade associations
- Class sections with subject requirements

### Phase 3: People
- Students (CRUD, soft delete, enrollment tracking)
- Guardians (CRUD, soft delete, student links)
- Student-guardian relationships (link/unlink)
- Student enrollments (CRUD, bulk promote)
- Teachers (CRUD, soft delete, subject assignments)

### Phase 4: Time & Space
- Period sets with configurable working days
- Periods and time slots (auto-generation)
- Room management with subject suitability

### Phase 5: Scheduling
- Lesson management (CRUD, conflict validation)
- Timetable views (by class, teacher, room)
- Teacher substitutions with conflict checks

### Phase 6: Daily Operations
- Teacher availability tracking
- Teacher leave workflow (submit, approve, reject, cancel)
- Student attendance (bulk record, summary, correction)
- Teacher attendance (record, list, correction)

### Phase 7: Assessment
- Configurable grading scales with levels
- Exam management with subject breakdown
- Student grade entry (bulk, auto grade-letter computation)
- Report card snapshot generation

### Phase 8: Finance
- Fee categories and structures
- Fee discounts (percentage/fixed)
- Fee invoices (generate, issue, cancel, bulk-generate)
- Fee payments (auto invoice status update)
- Financial reports (outstanding, collection, balances, category breakdown)

### Phase 9: Communication & Calendar
- Announcements with targeting (all, role, grade, class section)
- Notifications (in-app, SMS, email, push channels)
- Academic events calendar

### Phase 10: Audit & Self-Service
- Automatic audit logging on critical table writes (via Prisma `$extends`)
- Audit log viewer with filtering
- Self-service portal (`/my/*` endpoints):
  - Teachers: timetable, classes, leaves, substitutions
  - Students: timetable, grades, attendance, report cards, invoices
  - Guardians: children list, child data access with verification
- Admin dashboard (overview, attendance, fees, activity)
- Platform dashboard (school count, user count, expiring subscriptions)

### Phase 11: Hardening
- Rate limiting on auth endpoints (10 req/15min login, 30 req/15min refresh)
- Subscription tier feature gating middleware (`requireFeature()`)
- Body-parser error handling (malformed JSON returns 400, not 500)
- OpenAPI 3.1 documentation at `/api-docs`
- Docker multi-stage production build

## Prerequisites

- **Node.js 24+** (required for native TypeScript support)
- **PostgreSQL 16+**
- **Redis 7+** (for future caching/sessions)
- **Docker** (for running Postgres and Redis locally)

## Quick Start

### 1. Clone and install

```bash
git clone <repo-url>
cd school-management
npm install
```

### 2. Start infrastructure

```bash
docker compose up -d
```

This starts PostgreSQL and Redis.

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://schoolms:schoolms_dev@localhost:5432/schoolms_dev?schema=public
JWT_SECRET=change-this-to-at-least-32-characters-long-secret-key-here
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
REDIS_URL=redis://localhost:6379
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:3000
```

### 4. Set up database

```bash
npm run db:generate        # Generate Prisma client
npm run db:migrate:dev     # Run migrations (creates tables)
npm run db:seed            # Seed permissions, roles, demo school, admin users
```

### 5. Start development server

```bash
npm run dev
```

Server starts at `http://localhost:3000`.

### 6. Test credentials

| Role | Email | Password |
|---|---|---|
| Super Admin | `superadmin@schoolms.com` | `SuperAdmin123!` |
| School Admin | `admin@alnoor.edu.sa` | `Admin123!` |

The super admin has access to all platform-level endpoints. The school admin is scoped to the demo school "Al Noor International Academy".

### 7. Explore the API

| URL | Description |
|-----|-------------|
| http://localhost:3000/api-docs | Swagger UI (interactive API explorer) |
| http://localhost:3000/api-docs.json | Raw OpenAPI 3.1 spec (JSON) |
| http://localhost:3000/health | Health check endpoint |

For authenticated endpoints, click the **Authorize** button in Swagger UI and enter `Bearer <token>` using a token obtained from `POST /api/v1/auth/login`.

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production build |
| `npm run typecheck` | Type-check without emitting |
| `npm test` | Run integration tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Lint source and test files |
| `npm run format` | Format code with Prettier |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:migrate:dev` | Create and apply migrations |
| `npm run db:migrate:prod` | Apply migrations (production) |
| `npm run db:push` | Push schema changes (no migration) |
| `npm run db:seed` | Run seed script |
| `npm run db:studio` | Open Prisma Studio GUI |

## API Overview

Base URL: `/api/v1`

### Authentication
```
POST   /auth/login              # Login (rate-limited: 10/15min)
POST   /auth/refresh            # Refresh token (rate-limited: 30/15min)
POST   /auth/logout             # Logout
POST   /auth/forgot-password    # Request password reset
POST   /auth/reset-password     # Reset password with token
GET    /auth/me                 # Get current user profile
PATCH  /auth/me                 # Update profile / change password
```

### Multi-Tenancy
```
GET    /platform/schools        # List all schools (super admin)
POST   /platform/schools        # Create school (super admin)
PATCH  /platform/schools/:id    # Update school (super admin)
POST   /platform/schools/:id/suspend     # Suspend school
POST   /platform/schools/:id/reactivate  # Reactivate school
GET    /school/profile          # Current school profile
PATCH  /school/profile          # Update school profile
```

### Academic Structure
```
CRUD   /academic-years
POST   /academic-years/:id/activate
CRUD   /academic-years/:yearId/terms
CRUD   /terms
CRUD   /departments
CRUD   /grades
CRUD   /grades/:gradeId/subjects
CRUD   /subjects
PUT    /subjects/:subjectId/grades
CRUD   /class-sections
GET|PUT /class-sections/:sectionId/requirements
```

### People
```
CRUD   /students
CRUD   /guardians
CRUD   /students/:studentId/guardians
CRUD   /enrollments
POST   /enrollments/bulk-promote
CRUD   /teachers
GET|PUT /teachers/:id/subjects
```

### Time & Space
```
CRUD   /period-sets
PUT    /period-sets/:setId/working-days
PUT    /period-sets/:setId/periods
GET|POST /period-sets/:setId/time-slots
CRUD   /rooms
GET|PUT  /rooms/:roomId/subjects
```

### Scheduling
```
CRUD   /lessons
POST   /lessons/bulk-create
POST   /lessons/auto-generate
DELETE /lessons/clear
POST   /lessons/:id/cancel
GET    /timetable/class/:sectionId
GET    /timetable/teacher/:teacherId
GET    /timetable/room/:roomId
CRUD   /substitutions
```

### Daily Operations
```
GET|PUT  /teachers/:teacherId/availability
CRUD     /teacher-leaves
POST     /teacher-leaves/:id/approve
POST     /teacher-leaves/:id/reject
POST     /student-attendance/bulk
GET      /student-attendance/summary
CRUD     /teacher-attendance
```

### Assessment
```
CRUD   /grading-scales
CRUD   /exams
CRUD   /exams/:examId/subjects
POST   /grades/bulk                # Bulk student grade entry
GET    /grades/report              # Grade report
CRUD   /report-cards
POST   /report-cards/generate
```

### Finance
```
CRUD   /fee-categories
CRUD   /fee-structures
CRUD   /fee-discounts
CRUD   /fee-invoices
POST   /fee-invoices/bulk-generate
POST   /fee-invoices/:id/issue
POST   /fee-invoices/:id/cancel
POST   /fee-payments
GET    /reports/fees/outstanding
GET    /reports/fees/collection
GET    /reports/fees/student-balance
GET    /reports/fees/category-breakdown
```

### Communication
```
CRUD   /announcements
POST   /announcements/:id/publish
POST   /notifications/send
CRUD   /academic-events
```

### Self-Service (`/my/*`)
```
GET    /my/timetable
GET    /my/teacher/classes
GET    /my/teacher/leaves
POST   /my/teacher/leaves
GET    /my/teacher/substitutions
GET    /my/student/grades
GET    /my/student/attendance
GET    /my/student/report-cards
GET    /my/student/invoices
GET    /my/guardian/children
GET    /my/guardian/children/:studentId/grades
GET    /my/guardian/children/:studentId/attendance
GET    /my/guardian/children/:studentId/report-cards
GET    /my/guardian/children/:studentId/invoices
```

### Dashboard & Audit
```
GET    /dashboard/overview
GET    /dashboard/attendance-today
GET    /dashboard/fees-summary
GET    /dashboard/recent-activity
GET    /platform/dashboard
GET    /platform/schools/expiring
GET    /audit-logs
GET    /audit-logs/:id
```

## Response Format

All endpoints return a consistent envelope:

```jsonc
// Success (single resource)
{ "success": true, "data": { ... } }

// Success (paginated list)
{ "success": true, "data": [...], "meta": { "page": 1, "limit": 20, "total": 87, "totalPages": 5 } }

// Error
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "Invalid input", "details": [...] } }

// No content (204): empty body
```

## Multi-Tenancy

Every tenant-bound resource is scoped to a `schoolId`. The school ID is extracted from the JWT token automatically.

Super admins (no schoolId in token) must pass `X-School-Id` header to access school-scoped endpoints.

## Subscription Tiers

| Feature | Free | Basic | Premium | Enterprise |
|---|:---:|:---:|:---:|:---:|
| Report Cards | | x | x | x |
| Fee Management | | x | x | x |
| Auto Scheduling | | | x | x |
| Per-Lesson Attendance | | | x | x |
| Online Payment | | | x | x |
| SMS Notifications | | | x | x |
| Custom Roles | | | x | x |
| Audit Logs | | | x | x |
| API Access | | | | x |

Use `requireFeature('feature_name', prisma)` middleware to gate routes by subscription tier.

## Testing

```bash
# Create test database
cp .env.example .env.test
# Edit .env.test: change DATABASE_URL to a separate test database

# Run tests
npm test

# Watch mode
npm run test:watch
```

Tests use Node.js built-in test runner (`node:test`) with real HTTP requests against the server.

## Docker

### Development

```bash
docker compose up -d    # Start Postgres + Redis
npm run dev             # Start app with hot reload
```

### Production Build

```bash
# Build image
docker build -t school-management .

# Run container
docker run -d \
  --name school-api \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@db:5432/schoolms" \
  -e JWT_SECRET="your-production-secret-min-32-chars" \
  -e NODE_ENV=production \
  -e CORS_ORIGIN="https://yourdomain.com" \
  school-management
```

The Dockerfile uses multi-stage builds:
1. **deps**: Install production dependencies only
2. **build**: Compile TypeScript + generate Prisma client
3. **production**: Minimal Alpine image with `dumb-init` and non-root user

## Production Checklist

### Security
- [ ] Set a strong `JWT_SECRET` (minimum 32 characters, randomly generated)
- [ ] Set `CORS_ORIGIN` to your frontend domain (not `*`)
- [ ] Set `NODE_ENV=production`
- [ ] Ensure PostgreSQL uses a strong password and is not publicly accessible
- [ ] Enable TLS/SSL on the database connection (`?sslmode=require` in DATABASE_URL)
- [ ] Put the API behind a reverse proxy (nginx, Caddy, or cloud LB) with HTTPS
- [ ] Configure rate limiting values for production traffic patterns

### Database
- [ ] Run `npm run db:migrate:prod` to apply all migrations
- [ ] Run `npm run db:seed` to seed permissions, roles, and demo data
- [ ] Set up automated database backups (daily minimum)
- [ ] Configure connection pooling (PgBouncer or cloud-managed pool)
- [ ] Add database monitoring and slow query alerts

### Infrastructure
- [ ] Deploy behind a load balancer with health check on `/health`
- [ ] Configure auto-scaling based on CPU/memory utilization
- [ ] Set up log aggregation (ship pino JSON logs to ELK, Datadog, or similar)
- [ ] Configure Redis for session management and caching
- [ ] Set up container orchestration (Docker Compose for simple, Kubernetes for scale)

### Monitoring
- [ ] Set up uptime monitoring on `/health` endpoint
- [ ] Configure error tracking (Sentry, Bugsnag, or similar)
- [ ] Set up APM for request latency and throughput metrics
- [ ] Alert on 5xx error rate spikes

### Email & Notifications
- [ ] Integrate email service (SendGrid, SES, etc.) for password reset and notifications
- [ ] Configure SMS provider for SMS notification channel
- [ ] Set up push notification service (FCM/APNs) for push channel

### Not Yet Implemented
- [ ] Overdue invoice scanner (daily cron job)
- [ ] Subscription expiry checker (daily cron job)
- [ ] File upload support (student photos, documents)
- [ ] Bulk import/export (CSV/Excel)
- [ ] PDF report generation (report cards, financial statements)
- [ ] Real-time features (WebSocket for live notifications)

## Project Structure

```
school-management/
  .env.example              # Environment template
  .dockerignore             # Docker build exclusions
  docker-compose.yml        # Dev infrastructure (Postgres + Redis)
  Dockerfile                # Multi-stage production build
  package.json              # Dependencies and scripts
  tsconfig.json             # TypeScript configuration
  prisma/
    schema.prisma           # Database schema (49 models, 23 enums)
    seed.ts                 # Seed script (permissions, roles, demo school)
    migrations/             # Database migrations
  src/
    index.ts                # Entry point (server start + graceful shutdown)
    server.ts               # Express app factory (middleware + routes)
    container.ts            # Dependency injection wiring
    config/
      env.ts                # Zod-validated environment variables
      swagger.ts            # OpenAPI 3.1 configuration
    shared/
      errors/
        app-error.ts        # Custom error class (statusCode, code, isOperational)
        error-handler.ts    # Global error handler (Zod, Prisma, SyntaxError, AppError)
      middleware/
        auth.middleware.ts           # JWT auth + RBAC (authenticate, requirePermission)
        audit-context.middleware.ts  # AsyncLocalStorage for audit trail
        feature-gate.middleware.ts   # Subscription tier gating
        rate-limit.middleware.ts     # Auth endpoint rate limiting
        request-id.middleware.ts     # X-Request-Id header
      audit/
        audited-prisma.ts   # Prisma $extends for automatic audit logging
      context/
        request-context.ts  # AsyncLocalStorage request context
      utils/
        logger.ts           # pino structured logger with redaction
        password.ts         # argon2id hash/verify
        pagination.ts       # Pagination result builder
      types/
        index.ts            # Shared types (ApiResponse, JwtPayload, etc.)
      database.ts           # Prisma client singleton with audit extension
    modules/                # 45 domain modules
      auth/                 # Authentication (login, refresh, logout, password reset)
      user/                 # User management
      role/                 # Role management with permission assignment
      permission/           # Permission listing (read-only)
      school/               # School management (platform + profile)
      academic-year/        # Academic year lifecycle
      term/                 # Terms within academic years
      department/           # School departments
      grade/                # Grade levels
      subject/              # Subjects with grade associations
      class-section/        # Class sections
      requirement/          # Class subject requirements
      student/              # Student management
      guardian/             # Guardian management
      student-guardian/     # Student-guardian relationships
      enrollment/           # Student enrollments
      teacher/              # Teacher management
      period-set/           # Period set configuration
      working-day/          # School working days
      period/               # Time periods
      time-slot/            # Time slots (auto-generated)
      room/                 # Room management
      lesson/               # Lessons and timetable views
      substitution/         # Teacher substitutions
      teacher-availability/ # Teacher availability
      teacher-leave/        # Teacher leave workflow
      student-attendance/   # Student attendance
      teacher-attendance/   # Teacher attendance
      grading-scale/        # Grading scales with levels
      exam/                 # Exam management
      exam-subject/         # Exam subjects
      student-grade/        # Student grades
      report-card/          # Report card snapshots
      fee-category/         # Fee categories
      fee-structure/        # Fee structures
      fee-discount/         # Fee discounts
      fee-invoice/          # Fee invoices
      fee-payment/          # Fee payments
      financial-report/     # Financial reporting
      announcement/         # School announcements
      notification/         # User notifications
      academic-event/       # Calendar events
      audit-log/            # Audit log viewer
      self-service/         # Teacher/student/guardian self-service
      dashboard/            # Admin and platform dashboards
  tests/
    helpers/
      setup.ts              # Test server, HTTP helpers, login utilities
    integration/
      api.integration.test.ts  # Integration test suite
```

## License

Private - All rights reserved.
