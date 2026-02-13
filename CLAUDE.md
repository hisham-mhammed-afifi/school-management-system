# CLAUDE.md -- Node.js Production App Builder from ERD

> **For Claude Code.** This file is your single source of truth when building a Node.js backend from an ERD. Follow it precisely, in order, and verify each step before moving on.

---

## Ground Rules for Claude Code

- Read this entire file before writing any code.
- Follow the ERD-to-Code workflow steps in order. Do not skip steps.
- After generating each module, run `npx tsc --noEmit` to verify it compiles.
- After writing tests, run them immediately. Fix failures before moving on.
- Commit atomically: one commit per entity module, one for shared infrastructure.
- Never guess at types. If something is unclear in the ERD, ask the user.
- When in doubt, prefer explicit over clever.

---

## Tech Stack (locked, do not substitute)

| Layer | Choice | Notes |
|---|---|---|
| Runtime | Node.js 24.x | LTS from Oct 2025, supported until Apr 2028 |
| Language | TypeScript 5.8+ | Strict mode, erasable syntax only |
| Modules | ESM only | `"type": "module"` in package.json |
| Framework | Express 5.x | Native async error handling, no wrapper needed |
| ORM | Prisma (latest) | Schema-first, migration support, type-safe client |
| Validation | Zod (latest) | Runtime validation, TS type inference |
| Logging | pino + pino-pretty (dev) | Structured JSON logging |
| Testing | `node:test` + `node:assert/strict` | Built-in, no external test framework |
| Auth | jose (JWT), argon2 (hashing) | argon2 over bcrypt (faster, memory-hard) |
| API Docs | swagger-jsdoc + swagger-ui-express | OpenAPI 3.1 |
| Linting | ESLint 9 flat config + Prettier | TypeScript-aware rules |
| HTTP Security | helmet, cors, express-rate-limit | Always applied |

---

## Node.js 24 TypeScript Strategy

Node.js 24 has **stable type stripping** (no flags needed). It removes type annotations at runtime without transpilation. However, it does NOT transform TS-only syntax like `enum`, `namespace`, or constructor parameter properties.

**Our approach:**
- Write all source with `.ts` extensions in imports (e.g., `import { foo } from './bar.ts'`).
- Never use TS `enum`. Use `as const` objects instead (see pattern below).
- Set `erasableSyntaxOnly: true` in tsconfig so tsc catches any non-erasable syntax.
- Dev: `node --watch src/index.ts` (native type stripping, zero flags).
- Build: `tsc` compiles to JS and rewrites `.ts` imports to `.js` via `rewriteRelativeImportExtensions`.
- Prod: `node dist/index.js`.

**Enum replacement pattern:**

```typescript
// WRONG: TS enum (requires transformation, breaks native type stripping)
enum Role { ADMIN = 'ADMIN', USER = 'USER' }

// CORRECT: as const object + type derivation
export const Role = { ADMIN: 'ADMIN', USER: 'USER' } as const;
export type Role = (typeof Role)[keyof typeof Role];
// Usage: Role.ADMIN (value), Role (type) -- both work
```

**`using` keyword for explicit resource management (V8 13.6):**

```typescript
import { open } from 'node:fs/promises';

async function readConfig(path: string) {
  await using file = await open(path, 'r');
  // file is automatically closed when scope exits, even on error
  const content = await file.readFile({ encoding: 'utf-8' });
  return JSON.parse(content);
}
```

---

## tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",

    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "forceConsistentCasingInFileNames": true,

    "verbatimModuleSyntax": true,
    "erasableSyntaxOnly": true,
    "allowImportingTsExtensions": true,
    "rewriteRelativeImportExtensions": true,

    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

**Key decisions explained:**
- `verbatimModuleSyntax`: enforces `import type` for type-only imports (required for Node native TS).
- `erasableSyntaxOnly`: errors on `enum`, `namespace`, parameter properties. Keeps code compatible with Node's type stripping.
- `allowImportingTsExtensions` + `rewriteRelativeImportExtensions`: write `.ts` imports in source, tsc rewrites to `.js` in `dist/`.
- No `esModuleInterop`: conflicts with `verbatimModuleSyntax`. Use explicit `import * as` for CJS packages or use packages that ship ESM.
- No `exactOptionalPropertyTypes`: too aggressive, breaks many third-party library types.

---

## package.json

```json
{
  "name": "app",
  "version": "1.0.0",
  "type": "module",
  "engines": { "node": ">=24.0.0" },
  "scripts": {
    "dev": "node --env-file=.env --watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "typecheck": "tsc --noEmit",
    "test": "node --env-file=.env.test --test tests/**/*.test.ts",
    "test:watch": "node --env-file=.env.test --test --watch tests/**/*.test.ts",
    "lint": "eslint src/ tests/",
    "format": "prettier --write 'src/**/*.ts' 'tests/**/*.ts'",
    "db:generate": "prisma generate",
    "db:migrate:dev": "prisma migrate dev",
    "db:migrate:prod": "prisma migrate deploy",
    "db:push": "prisma db push",
    "db:seed": "node scripts/seed.ts",
    "db:studio": "prisma studio"
  }
}
```

**Notes:**
- `dev` uses `--watch` (Node 24 built-in, no nodemon) and `--env-file` (no dotenv).
- `test` uses a separate `.env.test` with a test database URL.
- No `--experimental-transform-types` needed because we avoid TS enums.

---

## Project Structure

```
project-root/
├── CLAUDE.md
├── package.json
├── tsconfig.json
├── .env                          # Local env (git-ignored)
├── .env.example                  # Documented env template (committed)
├── .env.test                     # Test env (git-ignored)
├── .gitignore
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── index.ts                  # Entry: load env, start server, handle shutdown
│   ├── server.ts                 # Express app factory (for testability)
│   ├── config/
│   │   └── env.ts                # Zod-validated env vars, export singleton
│   ├── modules/                  # One folder per ERD entity
│   │   └── user/
│   │       ├── user.routes.ts    # Route registration
│   │       ├── user.controller.ts
│   │       ├── user.service.ts
│   │       ├── user.repository.ts
│   │       ├── user.schema.ts    # Zod schemas + derived TS types
│   │       └── user.test.ts      # Co-located unit tests (optional)
│   ├── shared/
│   │   ├── errors/
│   │   │   ├── app-error.ts
│   │   │   └── error-handler.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── validate.middleware.ts
│   │   │   └── request-id.middleware.ts
│   │   ├── utils/
│   │   │   ├── logger.ts
│   │   │   ├── pagination.ts
│   │   │   └── password.ts
│   │   ├── types/
│   │   │   └── index.ts          # Shared types (ApiResponse, PaginatedResult, etc.)
│   │   └── database.ts           # Prisma client singleton + disconnect helper
│   └── container.ts              # DI wiring: builds all repos, services, controllers
├── tests/
│   ├── integration/
│   │   └── user.integration.test.ts
│   └── helpers/
│       └── setup.ts              # Test DB setup/teardown
└── scripts/
    └── seed.ts                   # Standalone seed script
```

---

## .gitignore

```
node_modules/
dist/
.env
.env.test
*.tsbuildinfo
coverage/
```

---

## ERD-to-Code Workflow

When given an ERD (image, text, DBML, or SQL DDL), follow these steps in exact order.

### Step 1: Analyze the ERD

Before writing any code, produce a written analysis:

1. List every entity with all its attributes, types, nullable status, defaults, and unique constraints.
2. List every relationship with its cardinality (1:1, 1:N, M:N) and which side owns the FK.
3. Note cascade rules (ON DELETE, ON UPDATE) or pick sensible defaults.
4. Identify junction tables for M:N relationships.
5. Identify columns needing indexes (FKs, frequently queried fields, unique fields).
6. Flag any ambiguity and ask the user before proceeding.

### Step 2: Generate Prisma Schema

**Type mapping reference:**

| ERD / SQL Type | Prisma Type |
|---|---|
| VARCHAR, TEXT, CHAR | String |
| INT, INTEGER, SMALLINT | Int |
| BIGINT, BIGSERIAL | BigInt |
| FLOAT, DOUBLE, REAL | Float |
| DECIMAL, NUMERIC | Decimal |
| BOOLEAN, BOOL | Boolean |
| DATE, DATETIME, TIMESTAMP | DateTime |
| UUID | String @id @default(uuid()) |
| JSON, JSONB | Json |
| ENUM values | Prisma `enum` (Prisma enums are fine, only TS enums are banned) |

**Every model must include these base fields:**

```prisma
model Entity {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt      @map("updated_at")
  // ... entity-specific fields

  @@map("entities") // snake_case table name
}
```

**Relationship patterns:**

```prisma
// ---- One-to-Many ----
model User {
  id    String @id @default(uuid())
  posts Post[]

  @@map("users")
}

model Post {
  id       String @id @default(uuid())
  authorId String @map("author_id")
  author   User   @relation(fields: [authorId], references: [id], onDelete: Cascade)

  @@index([authorId])
  @@map("posts")
}

// ---- Many-to-Many (explicit junction table) ----
model PostTag {
  postId    String   @map("post_id")
  tagId     String   @map("tag_id")
  assignedAt DateTime @default(now()) @map("assigned_at")
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  tag       Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([postId, tagId])
  @@index([tagId])
  @@map("post_tags")
}

// ---- One-to-One ----
model Profile {
  id     String @id @default(uuid())
  userId String @unique @map("user_id")
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("profiles")
}

// ---- Self-Referential ----
model Category {
  id       String     @id @default(uuid())
  name     String
  parentId String?    @map("parent_id")
  parent   Category?  @relation("CategoryTree", fields: [parentId], references: [id])
  children Category[] @relation("CategoryTree")

  @@index([parentId])
  @@map("categories")
}
```

**Database naming convention:** Prisma models are PascalCase, but map everything to snake_case in the DB via `@map` and `@@map`. This keeps the DB standard (snake_case) while keeping TypeScript standard (camelCase).

**After writing the schema, run:** `npx prisma validate`

### Step 3: Generate Zod Schemas

For each entity, create a `<entity>.schema.ts`:

```typescript
import { z } from 'zod';

// ---- Base schema (mirrors Prisma model shape) ----
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().max(255),
  name: z.string().min(1).max(255),
  role: z.enum(['ADMIN', 'USER', 'MODERATOR']),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

// ---- Create input (omit server-generated fields) ----
export const createUserSchema = userSchema
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    password: z.string().min(8).max(128),
  });

// ---- Update input (partial, no password unless explicit) ----
export const updateUserSchema = createUserSchema
  .omit({ password: true })
  .partial();

// ---- ID param validation ----
export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

// ---- List query params ----
export const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().max(255).optional(),
  sortBy: z.enum(['createdAt', 'name', 'email']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

// ---- Derived types ----
export type User = z.infer<typeof userSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ListQuery = z.infer<typeof listQuerySchema>;
```

**Rules:**
- Always derive TS types from Zod schemas. Never hand-write duplicate interfaces.
- Always include `idParamSchema` for validating route params.
- Always validate query params with coercion (`z.coerce`) since they arrive as strings.
- Never include `password` in the base schema or any response schema.

### Step 4: Generate Module Layers

For each entity, create four files. Follow this exact layering:

**Routes** -> **Controller** -> **Service** -> **Repository**

Each layer only calls the one directly below it. Never skip layers.

**`user.repository.ts`** (data access only, zero business logic):

```typescript
import type { PrismaClient, Prisma } from '@prisma/client';
import type { CreateUserInput, UpdateUserInput, ListQuery } from './user.schema.ts';

export class UserRepository {
  constructor(private readonly db: PrismaClient) {}

  async findMany(query: ListQuery) {
    const { page, limit, search, sortBy, order } = query;
    const where: Prisma.UserWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      this.db.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: order },
      }),
      this.db.user.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    return this.db.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string) {
    return this.db.user.findUnique({ where: { email } });
  }

  async create(data: Omit<CreateUserInput, 'password'> & { passwordHash: string }) {
    return this.db.user.create({
      data: {
        email: data.email,
        name: data.name,
        role: data.role,
        passwordHash: data.passwordHash,
      },
    });
  }

  async update(id: string, data: UpdateUserInput) {
    return this.db.user.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.db.user.delete({ where: { id } });
  }
}
```

**`user.service.ts`** (business logic, orchestration):

```typescript
import type { UserRepository } from './user.repository.ts';
import type { CreateUserInput, UpdateUserInput, ListQuery } from './user.schema.ts';
import { AppError } from '../../shared/errors/app-error.ts';
import { hashPassword } from '../../shared/utils/password.ts';

export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  async list(query: ListQuery) {
    return this.userRepo.findMany(query);
  }

  async getById(id: string) {
    const user = await this.userRepo.findById(id);
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    return user;
  }

  async create(input: CreateUserInput) {
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) throw new AppError('Email already in use', 409, 'EMAIL_CONFLICT');

    const passwordHash = await hashPassword(input.password);
    return this.userRepo.create({
      email: input.email,
      name: input.name,
      role: input.role,
      passwordHash,
    });
  }

  async update(id: string, input: UpdateUserInput) {
    await this.getById(id); // throws 404 if not found
    return this.userRepo.update(id, input);
  }

  async remove(id: string) {
    await this.getById(id);
    await this.userRepo.delete(id);
  }
}
```

**`user.controller.ts`** (HTTP concerns only: parse request, call service, format response):

```typescript
import type { Request, Response } from 'express';
import type { UserService } from './user.service.ts';
import { createUserSchema, updateUserSchema, listQuerySchema, idParamSchema } from './user.schema.ts';

export class UserController {
  constructor(private readonly userService: UserService) {}

  list = async (req: Request, res: Response) => {
    const query = listQuerySchema.parse(req.query);
    const result = await this.userService.list(query);
    res.json({
      success: true,
      data: result.data,
      meta: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages },
    });
  };

  getById = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const user = await this.userService.getById(id);
    res.json({ success: true, data: user });
  };

  create = async (req: Request, res: Response) => {
    const input = createUserSchema.parse(req.body);
    const user = await this.userService.create(input);
    res.status(201).json({ success: true, data: user });
  };

  update = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const input = updateUserSchema.parse(req.body);
    const user = await this.userService.update(id, input);
    res.json({ success: true, data: user });
  };

  remove = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    await this.userService.remove(id);
    res.status(204).send();
  };
}
```

**`user.routes.ts`** (route registration):

```typescript
import { Router } from 'express';
import type { UserController } from './user.controller.ts';
import { authenticate } from '../../shared/middleware/auth.middleware.ts';

export function createUserRoutes(controller: UserController): Router {
  const router = Router();

  router.get('/', controller.list);
  router.get('/:id', controller.getById);
  router.post('/', authenticate, controller.create);
  router.patch('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.remove);

  return router;
}
```

**Note:** No `asyncHandler` wrapper needed. Express 5 natively catches rejected promises from async route handlers and forwards them to the error-handling middleware.

### Step 5: Generate Shared Infrastructure

**`shared/errors/app-error.ts`:**

```typescript
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR', isOperational = true) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}
```

**`shared/errors/error-handler.ts`:**

```typescript
import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from './app-error.ts';
import { logger } from '../utils/logger.ts';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  // Operational errors (expected)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message },
    });
    return;
  }

  // Validation errors
  if (err instanceof ZodError) {
    res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        details: err.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      },
    });
    return;
  }

  // Prisma known errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        const target = (err.meta?.target as string[])?.join(', ') ?? 'field';
        res.status(409).json({
          success: false,
          error: { code: 'UNIQUE_VIOLATION', message: `Duplicate value for: ${target}` },
        });
        return;
      }
      case 'P2025':
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Record not found' },
        });
        return;
      case 'P2003':
        res.status(400).json({
          success: false,
          error: { code: 'FK_VIOLATION', message: 'Referenced record does not exist' },
        });
        return;
    }
  }

  // Unexpected errors
  const error = err instanceof Error ? err : new Error(String(err));
  logger.error({ err: error }, 'Unhandled error');
  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' },
  });
}
```

**`shared/utils/logger.ts`:**

```typescript
import pino from 'pino';

export const logger = pino({
  level: process.env['LOG_LEVEL'] ?? 'info',
  transport: process.env['NODE_ENV'] === 'development'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
  redact: {
    paths: ['req.headers.authorization', 'req.body.password', 'req.body.passwordHash'],
    censor: '[REDACTED]',
  },
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
});
```

**`shared/utils/password.ts`:**

```typescript
import * as argon2 from 'argon2';

export async function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
}

export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  return argon2.verify(hash, plain);
}
```

**`shared/middleware/auth.middleware.ts`:**

```typescript
import type { Request, Response, NextFunction } from 'express';
import * as jose from 'jose';
import { AppError } from '../errors/app-error.ts';

const JWT_SECRET = new TextEncoder().encode(process.env['JWT_SECRET'] ?? '');

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new AppError('Missing or invalid authorization header', 401, 'UNAUTHORIZED');
  }

  const token = header.slice(7);
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    (req as Record<string, unknown>)['user'] = payload;
    next();
  } catch {
    throw new AppError('Invalid or expired token', 401, 'INVALID_TOKEN');
  }
}
```

**`shared/database.ts`:**

```typescript
import { PrismaClient } from '@prisma/client';
import { logger } from './utils/logger.ts';

const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'warn' },
  ],
});

prisma.$on('error', (e) => logger.error({ err: e }, 'Prisma error'));
prisma.$on('warn', (e) => logger.warn({ msg: e.message }, 'Prisma warning'));

export { prisma };

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
```

**`shared/types/index.ts`:**

```typescript
export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ path: string; message: string }>;
  };
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

**`config/env.ts`:**

```typescript
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  CORS_ORIGIN: z.string().default('*'),
});

export type Env = z.infer<typeof envSchema>;

// Validate on import. App crashes at startup if env is invalid. This is intentional.
export const env: Env = envSchema.parse(process.env);
```

### Step 6: Wire It All Together

**`container.ts`** (DI via factory function):

```typescript
import { prisma } from './shared/database.ts';
import { UserRepository } from './modules/user/user.repository.ts';
import { UserService } from './modules/user/user.service.ts';
import { UserController } from './modules/user/user.controller.ts';

export function createContainer() {
  const userRepo = new UserRepository(prisma);
  const userService = new UserService(userRepo);
  const userController = new UserController(userService);

  // Add more modules here as ERD entities are implemented:
  // const postRepo = new PostRepository(prisma);
  // ...

  return { controllers: { userController } } as const;
}
```

**`server.ts`** (Express app factory, no listening):

```typescript
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { pinoHttp } from 'pino-http';
import { env } from './config/env.ts';
import { logger } from './shared/utils/logger.ts';
import { errorHandler } from './shared/errors/error-handler.ts';
import { createContainer } from './container.ts';
import { createUserRoutes } from './modules/user/user.routes.ts';

export function createServer() {
  const app = express();
  const { controllers } = createContainer();

  // ---- Global middleware ----
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === '/health' } }));

  // ---- Health check ----
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ---- API routes ----
  app.use('/api/v1/users', createUserRoutes(controllers.userController));
  // Register more entity routes here

  // ---- 404 handler ----
  app.use((_req, res) => {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } });
  });

  // ---- Error handler (must be last, must have 4 params) ----
  app.use(errorHandler);

  return app;
}
```

**`index.ts`** (entry point with graceful shutdown):

```typescript
import { env } from './config/env.ts';
import { logger } from './shared/utils/logger.ts';
import { createServer } from './server.ts';
import { disconnectDatabase } from './shared/database.ts';

const app = createServer();

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT, env: env.NODE_ENV }, 'Server started');
});

// ---- Graceful shutdown ----
async function shutdown(signal: string) {
  logger.info({ signal }, 'Shutdown signal received');
  server.close(async () => {
    await disconnectDatabase();
    logger.info('Server shut down gracefully');
    process.exit(0);
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error({ err: reason }, 'Unhandled rejection');
});

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception, shutting down');
  process.exit(1);
});
```

---

## Prisma Transaction Pattern

For operations that span multiple entities (e.g., creating an order with line items):

```typescript
async createOrderWithItems(input: CreateOrderInput) {
  return this.db.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: { customerId: input.customerId, status: 'PENDING' },
    });

    const items = await Promise.all(
      input.items.map((item) =>
        tx.orderItem.create({
          data: { orderId: order.id, productId: item.productId, quantity: item.quantity },
        }),
      ),
    );

    return { ...order, items };
  });
}
```

---

## Soft Delete Pattern

If the ERD has `deletedAt` or `isDeleted`, implement soft deletes:

```prisma
model User {
  // ... other fields
  deletedAt DateTime? @map("deleted_at")
}
```

```typescript
// Repository: add deletedAt filter to ALL read queries
private readonly notDeleted: Prisma.UserWhereInput = { deletedAt: null };

async findMany(query: ListQuery) {
  const where: Prisma.UserWhereInput = { ...this.notDeleted, ...buildFilters(query) };
  // ...
}

async softDelete(id: string) {
  return this.db.user.update({ where: { id }, data: { deletedAt: new Date() } });
}
```

---

## Testing with Node.js Built-in Test Runner

```typescript
import { describe, it, before, mock } from 'node:test';
import assert from 'node:assert/strict';
import { UserService } from '../src/modules/user/user.service.ts';
import type { UserRepository } from '../src/modules/user/user.repository.ts';
import { AppError } from '../src/shared/errors/app-error.ts';

describe('UserService', () => {
  let service: UserService;
  let mockFindById: ReturnType<typeof mock.fn>;

  before(() => {
    mockFindById = mock.fn(async (id: string) => ({
      id,
      name: 'Test User',
      email: 'test@example.com',
    }));

    const mockRepo = {
      findById: mockFindById,
      findByEmail: mock.fn(async () => null),
      create: mock.fn(async (data: unknown) => ({ id: 'new-id', ...(data as object) })),
      findMany: mock.fn(async () => ({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 })),
      update: mock.fn(async (_id: string, data: unknown) => data),
      delete: mock.fn(async () => undefined),
    } as unknown as UserRepository;

    service = new UserService(mockRepo);
  });

  it('should return user by id', async () => {
    const user = await service.getById('abc-123');
    assert.equal(user.id, 'abc-123');
    assert.equal(mockFindById.mock.callCount(), 1);
  });

  it('should throw 404 when user not found', async () => {
    mockFindById.mock.mockImplementation(async () => null);

    await assert.rejects(
      () => service.getById('nonexistent'),
      (err: unknown) => {
        assert.ok(err instanceof AppError);
        assert.equal(err.statusCode, 404);
        assert.equal(err.code, 'USER_NOT_FOUND');
        return true;
      },
    );
  });
});
```

**Testing rules:**
- Use `node:test` and `node:assert/strict` exclusively. No Jest, Vitest, Mocha, or Chai.
- Structure tests as Arrange/Act/Assert.
- Mock at the repository boundary. Never mock the database directly.
- Integration tests use a real test database (separate from dev).
- Run tests: `npm test`. Fix all failures before committing.

---

## Seed File Pattern

**`prisma/seed.ts`:**

```typescript
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/shared/utils/password.ts';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin',
      role: 'ADMIN',
      passwordHash: await hashPassword('changeme123'),
    },
  });

  console.log('Seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

---

## API Response Envelope

Every endpoint returns one of these shapes:

```typescript
// Single resource
{ "success": true, "data": { ... } }

// List with pagination
{ "success": true, "data": [ ... ], "meta": { "page": 1, "limit": 20, "total": 87, "totalPages": 5 } }

// Error
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "Invalid input", "details": [ ... ] } }

// No content (204): empty body
```

---

## Relationship Detection from ERD Notation

| ERD Notation | Relationship | Implementation |
|---|---|---|
| `1----1` | One-to-One | `@unique` on FK column |
| `1----*` or `1----N` | One-to-Many | FK on the "many" side, `@@index` on FK |
| `*----*` or `M----N` | Many-to-Many | Junction table with composite `@@id([fk1, fk2])` |
| `1----0..1` | Optional One-to-One | `@unique` + nullable FK (`String?`) |
| `0..*` | Optional One-to-Many | Nullable FK |
| Crow's foot notation | Read the "many" end (fork) vs "one" end (line) | Same rules above |

**Polymorphic relationships:** Avoid. Use separate FK columns or shared interface table instead.

---

## Security Checklist

- [ ] All inputs validated with Zod before processing
- [ ] Passwords hashed with argon2id (never stored plain)
- [ ] Passwords excluded from all API responses
- [ ] `helmet` applied globally for HTTP security headers
- [ ] `cors` configured with explicit origins in production (not `*`)
- [ ] Rate limiting on auth endpoints (`express-rate-limit`)
- [ ] UUID validated on all route params via Zod
- [ ] No stack traces in production error responses
- [ ] Log redaction for passwords, tokens, PII
- [ ] `--env-file` for env loading (no dotenv in production)
- [ ] Parameterized queries only (Prisma handles this)
- [ ] `Content-Type` validated (Express `json()` middleware)

---

## Code Quality Rules

- No `any`. Use `unknown` and narrow with type guards or Zod.
- No non-null assertions (`!`). Handle nullability explicitly.
- No `console.log` / `console.error`. Use the pino logger.
- No floating promises. Every promise is `await`ed or returned.
- No TS `enum`. Use `as const` objects.
- No `require()`. ESM imports only.
- No barrel files (`index.ts` re-exports) except `shared/types/index.ts`.
- Use `import type` for type-only imports (enforced by `verbatimModuleSyntax`).
- Use `satisfies` for type checking without widening.
- Use `using` / `await using` for disposable resources.
- Use `Error.isError()` for cross-realm error checking.
- Use `node:` prefix for all built-in modules.
- Prefer `Promise.all()` for independent concurrent operations.
- Keep functions under 40 lines. Extract when larger.

---

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Files | `entity.layer.ts` | `user.service.ts` |
| Classes | PascalCase | `UserService` |
| Functions, variables | camelCase | `findById` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES` |
| Types, Interfaces | PascalCase, no `I` prefix | `CreateUserInput` |
| `as const` objects | PascalCase | `Role` |
| Prisma models | PascalCase | `User` |
| DB tables (@@map) | snake_case plural | `users` |
| DB columns (@map) | snake_case | `created_at` |
| Env vars | UPPER_SNAKE_CASE | `DATABASE_URL` |
| Route paths | kebab-case plural | `/api/v1/order-items` |

---

## Docker Production Setup

```dockerfile
FROM node:24-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM base AS build
COPY package.json package-lock.json ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM base AS production
ENV NODE_ENV=production
RUN apk add --no-cache dumb-init
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY package.json ./

EXPOSE 3000
USER node
# dumb-init ensures SIGTERM is forwarded properly for graceful shutdown
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
```

**Notes:**
- Multi-stage build: deps (prod only), build (compile), production (minimal).
- `dumb-init` as PID 1 for proper signal forwarding.
- `USER node` drops root privileges.
- Env vars passed at runtime (not baked into image).
- Run `prisma migrate deploy` as part of deployment pipeline, not in CMD.

---

## .env.example

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/mydb?schema=public
JWT_SECRET=change-this-to-at-least-32-characters-long-secret
JWT_EXPIRES_IN=7d
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:3000
```

---

## Verification Checklist (run after every module)

1. `npx prisma validate` passes
2. `npm run typecheck` passes (zero errors)
3. `npm test` passes (zero failures)
4. `npm run lint` passes
5. Every ERD entity has: schema.prisma model, Zod schemas, repository, service, controller, routes
6. Every relationship has correct cardinality, FK indexes, and cascade rules
7. All routes registered in `server.ts`
8. Module wired in `container.ts`
9. `health` endpoint returns 200
10. Error handler catches ZodError, AppError, PrismaClientKnownRequestError, and unknown errors
