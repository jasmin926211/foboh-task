# FOBOH Project Setup — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up a fully working monorepo with React frontend + Express/TypeScript backend, connected to Neon PostgreSQL, with proper project structure — then push to GitHub.

**Architecture:** npm workspaces monorepo with `packages/backend` (Express + Prisma + TypeScript) and `packages/frontend` (React + Vite + Tailwind + shadcn/ui). Backend follows Controller → Service → Model layered pattern from user's existing projects.

**Tech Stack:** Node 25, TypeScript 5, Express 4, Prisma ORM, PostgreSQL (Neon), React 18, Vite, Tailwind CSS 3, shadcn/ui, Winston logger, Zod validation

---

### Task 1: Initialize git repo and clone from GitHub

**Files:**
- Create: `.gitignore`

- [ ] **Step 1: Clone the existing GitHub repo into current directory**

```bash
cd /Users/jasminthummar/Desktop
rm -rf foboh
git clone https://github.com/jasmin926211/foboh-task.git foboh
cd foboh
```

- [ ] **Step 2: Create comprehensive .gitignore**

Create `.gitignore`:

```
node_modules/
dist/
.env
.env.local
*.log
.DS_Store
.prisma/
packages/backend/prisma/*.db
```

- [ ] **Step 3: Create root package.json for npm workspaces**

Create `package.json`:

```json
{
  "name": "foboh-task",
  "version": "1.0.0",
  "private": true,
  "description": "FOBOH customer-specific pricing for food and beverage suppliers",
  "workspaces": [
    "packages/backend",
    "packages/frontend"
  ],
  "scripts": {
    "dev": "concurrently -n backend,frontend -c blue,green \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "npm run dev -w packages/backend",
    "dev:frontend": "npm run dev -w packages/frontend",
    "build": "npm run build -w packages/backend && npm run build -w packages/frontend",
    "db:migrate": "npm run db:migrate -w packages/backend",
    "db:seed": "npm run db:seed -w packages/backend",
    "db:studio": "npm run db:studio -w packages/backend",
    "db:setup": "npm run db:migrate && npm run db:seed"
  },
  "devDependencies": {
    "concurrently": "^9.1.2"
  }
}
```

- [ ] **Step 4: Create workspace directories**

```bash
mkdir -p packages/backend packages/frontend
```

- [ ] **Step 5: Commit**

```bash
git add .gitignore package.json
git commit -m "chore: initialize monorepo with npm workspaces"
```

---

### Task 2: Set up backend package with TypeScript + Express

**Files:**
- Create: `packages/backend/package.json`
- Create: `packages/backend/tsconfig.json`
- Create: `packages/backend/nodemon.json`
- Create: `packages/backend/.env`

- [ ] **Step 1: Create backend package.json**

Create `packages/backend/package.json`:

```json
{
  "name": "@foboh/backend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "nodemon",
    "build": "tsc",
    "start": "node dist/server.js",
    "db:migrate": "npx prisma migrate dev",
    "db:seed": "npx prisma db seed",
    "db:studio": "npx prisma studio",
    "db:generate": "npx prisma generate"
  },
  "prisma": {
    "seed": "npx ts-node --compiler-options {\"module\":\"CommonJS\"} src/prisma/seed.ts"
  }
}
```

- [ ] **Step 2: Install backend dependencies**

```bash
cd packages/backend
npm install express cors zod winston swagger-jsdoc swagger-ui-express @prisma/client
npm install -D typescript @types/node @types/express @types/cors @types/swagger-jsdoc @types/swagger-ui-express ts-node nodemon prisma
```

- [ ] **Step 3: Create tsconfig.json**

Create `packages/backend/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 4: Create nodemon.json**

Create `packages/backend/nodemon.json`:

```json
{
  "watch": ["src"],
  "ext": "ts",
  "ignore": ["src/**/*.test.ts"],
  "exec": "ts-node src/server.ts"
}
```

- [ ] **Step 5: Create .env file**

Create `packages/backend/.env`:

```
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://neondb_owner:npg_fM0T3vjFeOlg@ep-steep-band-aemej13n-pooler.c-2.us-east-2.aws.neon.tech/foboh?sslmode=require&channel_binding=require"
```

- [ ] **Step 6: Commit**

```bash
cd /Users/jasminthummar/Desktop/foboh
git add packages/backend/package.json packages/backend/tsconfig.json packages/backend/nodemon.json
git commit -m "chore: set up backend package with TypeScript and Express"
```

Note: Do NOT commit .env file.

---

### Task 3: Set up Prisma schema and database

**Files:**
- Create: `packages/backend/src/prisma/schema.prisma`
- Create: `packages/backend/src/prisma/client.ts`
- Create: `packages/backend/src/prisma/seed.ts`

- [ ] **Step 1: Initialize Prisma**

```bash
cd packages/backend
npx prisma init --datasource-provider postgresql
```

This creates `prisma/schema.prisma` and updates `.env`. Move schema to `src/prisma/`:

```bash
mkdir -p src/prisma
mv prisma/schema.prisma src/prisma/schema.prisma
rm -rf prisma
```

- [ ] **Step 2: Write the Prisma schema**

Create `packages/backend/src/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum AdjustmentType {
  fixed
  dynamic
}

enum AdjustmentDirection {
  increase
  decrease
}

model Product {
  id          String   @id @default(uuid())
  title       String
  sku         String   @unique
  category    String   @default("Wine")
  subCategory String   @map("sub_category")
  segment     String
  brand       String
  basePrice   Float    @map("base_price")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  profileProducts ProfileProduct[]

  @@map("products")
}

model PricingProfile {
  id                  String              @id @default(uuid())
  name                String
  customerName        String              @map("customer_name")
  adjustmentType      AdjustmentType      @map("adjustment_type")
  adjustmentDirection AdjustmentDirection  @map("adjustment_direction")
  adjustmentValue     Float               @map("adjustment_value")
  createdAt           DateTime            @default(now()) @map("created_at")
  updatedAt           DateTime            @updatedAt @map("updated_at")

  profileProducts ProfileProduct[]

  @@map("pricing_profiles")
}

model ProfileProduct {
  id        String         @id @default(uuid())
  profileId String         @map("profile_id")
  productId String         @map("product_id")

  profile   PricingProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)
  product   Product        @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([profileId, productId])
  @@map("profile_products")
}
```

Update `packages/backend/package.json` — add prisma config to point to custom schema location. Add to the JSON:

```json
{
  "prisma": {
    "schema": "src/prisma/schema.prisma",
    "seed": "npx ts-node --compiler-options {\"module\":\"CommonJS\"} src/prisma/seed.ts"
  }
}
```

- [ ] **Step 3: Create Prisma client singleton**

Create `packages/backend/src/prisma/client.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;
```

- [ ] **Step 4: Create seed file**

Create `packages/backend/src/prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const products = [
  {
    title: 'Penfolds Grange 2019',
    sku: 'PEN-GRG-2019',
    category: 'Wine',
    subCategory: 'Red',
    segment: 'Premium',
    brand: 'Penfolds',
    basePrice: 850.0,
  },
  {
    title: 'Yellow Tail Shiraz',
    sku: 'YT-SHZ-001',
    category: 'Wine',
    subCategory: 'Red',
    segment: 'Budget',
    brand: 'Yellow Tail',
    basePrice: 8.99,
  },
  {
    title: 'Cloudy Bay Sauvignon Blanc',
    sku: 'CB-SB-2022',
    category: 'Wine',
    subCategory: 'White',
    segment: 'Premium',
    brand: 'Cloudy Bay',
    basePrice: 28.5,
  },
  {
    title: 'Moet & Chandon Imperial',
    sku: 'MC-IMP-NV',
    category: 'Wine',
    subCategory: 'Sparkling',
    segment: 'Premium',
    brand: 'Moet & Chandon',
    basePrice: 65.0,
  },
  {
    title: 'Whispering Hills Rose',
    sku: 'WH-RSE-2023',
    category: 'Wine',
    subCategory: 'Rose',
    segment: 'Standard',
    brand: 'Whispering Hills',
    basePrice: 14.99,
  },
];

async function main() {
  console.log('Seeding products...');

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: product,
      create: product,
    });
  }

  console.log(`Seeded ${products.length} products`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

- [ ] **Step 5: Run Prisma migration and seed**

```bash
cd packages/backend
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

- [ ] **Step 6: Commit**

```bash
cd /Users/jasminthummar/Desktop/foboh
git add packages/backend/src/prisma/
git commit -m "feat: add Prisma schema with Product, PricingProfile, ProfileProduct models and seed data"
```

---

### Task 4: Set up backend utilities — logger, exceptions

**Files:**
- Create: `packages/backend/src/config/index.ts`
- Create: `packages/backend/src/config/logger.ts`
- Create: `packages/backend/src/utilities/logger.ts`
- Create: `packages/backend/src/utilities/exceptions/generateException.ts`
- Create: `packages/backend/src/utilities/exceptions/BadRequestException.ts`
- Create: `packages/backend/src/utilities/exceptions/ResourceNotFoundException.ts`
- Create: `packages/backend/src/utilities/exceptions/ConflictException.ts`
- Create: `packages/backend/src/utilities/exceptions/InternalServerException.ts`
- Create: `packages/backend/src/utilities/exceptions/index.ts`

- [ ] **Step 1: Create config**

Create `packages/backend/src/config/index.ts`:

```typescript
import dotenv from 'dotenv';
dotenv.config();

const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
};

export default config;
```

Install dotenv:

```bash
cd packages/backend
npm install dotenv
```

- [ ] **Step 2: Create Winston logger**

Create `packages/backend/src/utilities/logger.ts`:

```typescript
import winston from 'winston';
import config from '../config';

const { combine, timestamp, printf, colorize } = winston.format;

const logFormat = printf(({ level, message, timestamp, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] ${level}: ${message}${metaStr}`;
});

const logger = winston.createLogger({
  level: config.nodeEnv === 'development' ? 'debug' : 'info',
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
  transports: [
    new winston.transports.Console({
      format: combine(colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
    }),
  ],
});

export default logger;
```

- [ ] **Step 3: Create exception classes**

Create `packages/backend/src/utilities/exceptions/generateException.ts`:

```typescript
interface ExceptionPayload {
  statusCode?: number;
  title?: string;
  description?: string;
}

function generateException(
  instance: any,
  statusCode: number,
  title: string,
  exception: string | ExceptionPayload
) {
  if (typeof exception === 'string') {
    instance.statusCode = statusCode;
    instance.title = title;
    instance.description = exception;
  } else {
    instance.statusCode = exception.statusCode || statusCode;
    instance.title = exception.title || title;
    instance.description = exception.description || '';
  }
}

export default generateException;
```

Create `packages/backend/src/utilities/exceptions/BadRequestException.ts`:

```typescript
import generateException from './generateException';

class BadRequestException extends Error {
  statusCode!: number;
  title!: string;
  description!: string;

  constructor(exception: string | { statusCode?: number; title?: string; description?: string }) {
    super(typeof exception === 'string' ? exception : exception.description);
    generateException(this, 400, 'Bad request', exception);
  }
}

export default BadRequestException;
```

Create `packages/backend/src/utilities/exceptions/ResourceNotFoundException.ts`:

```typescript
import generateException from './generateException';

class ResourceNotFoundException extends Error {
  statusCode!: number;
  title!: string;
  description!: string;

  constructor(exception: string | { statusCode?: number; title?: string; description?: string }) {
    super(typeof exception === 'string' ? exception : exception.description);
    generateException(this, 404, 'Resource not found', exception);
  }
}

export default ResourceNotFoundException;
```

Create `packages/backend/src/utilities/exceptions/ConflictException.ts`:

```typescript
import generateException from './generateException';

class ConflictException extends Error {
  statusCode!: number;
  title!: string;
  description!: string;

  constructor(exception: string | { statusCode?: number; title?: string; description?: string }) {
    super(typeof exception === 'string' ? exception : exception.description);
    generateException(this, 409, 'Conflict', exception);
  }
}

export default ConflictException;
```

Create `packages/backend/src/utilities/exceptions/InternalServerException.ts`:

```typescript
import generateException from './generateException';

class InternalServerException extends Error {
  statusCode!: number;
  title!: string;
  description!: string;

  constructor(exception: string | { statusCode?: number; title?: string; description?: string }) {
    super(typeof exception === 'string' ? exception : exception.description);
    generateException(this, 500, 'Internal server error', exception);
  }
}

export default InternalServerException;
```

Create `packages/backend/src/utilities/exceptions/index.ts`:

```typescript
export { default as BadRequestException } from './BadRequestException';
export { default as ResourceNotFoundException } from './ResourceNotFoundException';
export { default as ConflictException } from './ConflictException';
export { default as InternalServerException } from './InternalServerException';
```

- [ ] **Step 4: Commit**

```bash
cd /Users/jasminthummar/Desktop/foboh
git add packages/backend/src/config/ packages/backend/src/utilities/
git commit -m "feat: add config, Winston logger, and custom exception classes"
```

---

### Task 5: Set up backend middlewares

**Files:**
- Create: `packages/backend/src/middlewares/errorHandling.ts`
- Create: `packages/backend/src/middlewares/requestLogger.ts`
- Create: `packages/backend/src/middlewares/resourceNotFound.ts`
- Create: `packages/backend/src/middlewares/validateRequest.ts`
- Create: `packages/backend/src/middlewares/index.ts`

- [ ] **Step 1: Create error handling middleware**

Create `packages/backend/src/middlewares/errorHandling.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import logger from '../utilities/logger';

const errorHandling = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err.statusCode && err.title) {
    logger.error(`Handled error: ${err.title} - ${err.description}`);
    res.status(err.statusCode).json({
      error: {
        title: err.title,
        description: err.description,
      },
    });
    return;
  }

  logger.error(`Unhandled error: ${err.stack || err.message || err}`);
  res.status(500).json({
    error: {
      title: 'Internal server error',
      description: 'Something went wrong',
    },
  });
};

export default errorHandling;
```

- [ ] **Step 2: Create request logger middleware**

Create `packages/backend/src/middlewares/requestLogger.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import logger from '../utilities/logger';

const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    logger[level](`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });

  next();
};

export default requestLogger;
```

- [ ] **Step 3: Create resource not found middleware**

Create `packages/backend/src/middlewares/resourceNotFound.ts`:

```typescript
import { Request, Response, _NextFunction } from 'express';

const resourceNotFound = (req: Request, res: Response) => {
  res.status(404).json({
    error: {
      title: 'Not found',
      description: `Cannot ${req.method} ${req.originalUrl}`,
    },
  });
};

export default resourceNotFound;
```

- [ ] **Step 4: Create Zod validation middleware**

Create `packages/backend/src/middlewares/validateRequest.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { BadRequestException } from '../utilities/exceptions';

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

const validateRequest = (schemas: ValidationSchemas) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as any;
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as any;
      }
      next();
    } catch (error: any) {
      const message = error.errors
        ? error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')
        : 'Validation failed';
      next(new BadRequestException(message));
    }
  };
};

export default validateRequest;
```

- [ ] **Step 5: Create middleware barrel export**

Create `packages/backend/src/middlewares/index.ts`:

```typescript
export { default as errorHandling } from './errorHandling';
export { default as requestLogger } from './requestLogger';
export { default as resourceNotFound } from './resourceNotFound';
export { default as validateRequest } from './validateRequest';
```

- [ ] **Step 6: Commit**

```bash
cd /Users/jasminthummar/Desktop/foboh
git add packages/backend/src/middlewares/
git commit -m "feat: add middlewares — error handling, request logger, validation, 404"
```

---

### Task 6: Set up backend controllers, services, policies (empty structure + server entry)

**Files:**
- Create: `packages/backend/src/controllers/index.ts`
- Create: `packages/backend/src/controllers/product/index.ts`
- Create: `packages/backend/src/controllers/pricingProfile/index.ts`
- Create: `packages/backend/src/services/product/index.ts`
- Create: `packages/backend/src/services/pricingProfile/index.ts`
- Create: `packages/backend/src/policies/product/index.ts`
- Create: `packages/backend/src/policies/pricingProfile/index.ts`
- Create: `packages/backend/src/utilities/computePrice.ts`
- Create: `packages/backend/src/swagger.ts`
- Create: `packages/backend/src/server.ts`

- [ ] **Step 1: Create price computation utility**

Create `packages/backend/src/utilities/computePrice.ts`:

```typescript
interface PriceAdjustment {
  adjustmentType: 'fixed' | 'dynamic';
  adjustmentDirection: 'increase' | 'decrease';
  adjustmentValue: number;
}

const computePrice = (basePrice: number, adjustment: PriceAdjustment): number => {
  let newPrice: number;

  if (adjustment.adjustmentType === 'fixed') {
    newPrice =
      adjustment.adjustmentDirection === 'increase'
        ? basePrice + adjustment.adjustmentValue
        : basePrice - adjustment.adjustmentValue;
  } else {
    const percentage = adjustment.adjustmentValue / 100;
    newPrice =
      adjustment.adjustmentDirection === 'increase'
        ? basePrice + basePrice * percentage
        : basePrice - basePrice * percentage;
  }

  return Math.max(0, Math.round(newPrice * 100) / 100);
};

export default computePrice;
```

- [ ] **Step 2: Create product policies**

Create `packages/backend/src/policies/product/index.ts`:

```typescript
import { z } from 'zod';

export const listProductsPolicy = {
  query: z.object({
    search: z.string().optional(),
    subCategory: z.string().optional(),
    segment: z.string().optional(),
    brand: z.string().optional(),
  }),
};

export const getProductPolicy = {
  params: z.object({
    id: z.string().uuid(),
  }),
};
```

- [ ] **Step 3: Create pricing profile policies**

Create `packages/backend/src/policies/pricingProfile/index.ts`:

```typescript
import { z } from 'zod';

export const createProfilePolicy = {
  body: z.object({
    name: z.string().min(1).max(100),
    customerName: z.string().min(1).max(100),
    adjustmentType: z.enum(['fixed', 'dynamic']),
    adjustmentDirection: z.enum(['increase', 'decrease']),
    adjustmentValue: z.number().positive(),
    productIds: z.array(z.string().uuid()).min(1),
  }),
};

export type CreateProfileBody = z.infer<typeof createProfilePolicy.body>;

export const updateProfilePolicy = {
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    customerName: z.string().min(1).max(100).optional(),
    adjustmentType: z.enum(['fixed', 'dynamic']).optional(),
    adjustmentDirection: z.enum(['increase', 'decrease']).optional(),
    adjustmentValue: z.number().positive().optional(),
    productIds: z.array(z.string().uuid()).min(1).optional(),
  }),
};

export type UpdateProfileBody = z.infer<typeof updateProfilePolicy.body>;

export const getProfilePolicy = {
  params: z.object({
    id: z.string().uuid(),
  }),
};

export const listProfilesPolicy = {
  query: z.object({
    customerName: z.string().optional(),
  }),
};

export const resolvedPricesPolicy = {
  query: z.object({
    customerName: z.string().min(1),
  }),
};
```

- [ ] **Step 4: Create product services**

Create `packages/backend/src/services/product/index.ts`:

```typescript
import prisma from '../../prisma/client';
import logger from '../../utilities/logger';
import { ResourceNotFoundException } from '../../utilities/exceptions';

export const listProducts = async (filters: {
  search?: string;
  subCategory?: string;
  segment?: string;
  brand?: string;
}) => {
  logger.info('Entry: listProducts service');

  const where: any = {};

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { sku: { contains: filters.search, mode: 'insensitive' } },
    ];
  }
  if (filters.subCategory) where.subCategory = filters.subCategory;
  if (filters.segment) where.segment = filters.segment;
  if (filters.brand) where.brand = filters.brand;

  const products = await prisma.product.findMany({ where, orderBy: { title: 'asc' } });

  logger.info(`Exit: listProducts service — found ${products.length} products`);
  return products;
};

export const getProduct = async (id: string) => {
  logger.info('Entry: getProduct service');

  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) {
    throw new ResourceNotFoundException(`Product with id ${id} not found`);
  }

  logger.info('Exit: getProduct service — success');
  return product;
};
```

- [ ] **Step 5: Create pricing profile services**

Create `packages/backend/src/services/pricingProfile/index.ts`:

```typescript
import prisma from '../../prisma/client';
import logger from '../../utilities/logger';
import { ResourceNotFoundException, InternalServerException } from '../../utilities/exceptions';
import computePrice from '../../utilities/computePrice';
import { CreateProfileBody, UpdateProfileBody } from '../../policies/pricingProfile';

export const createProfile = async (body: CreateProfileBody) => {
  logger.info('Entry: createProfile service');

  const profile = await prisma.pricingProfile.create({
    data: {
      name: body.name,
      customerName: body.customerName,
      adjustmentType: body.adjustmentType,
      adjustmentDirection: body.adjustmentDirection,
      adjustmentValue: body.adjustmentValue,
      profileProducts: {
        create: body.productIds.map((productId) => ({ productId })),
      },
    },
    include: { profileProducts: { include: { product: true } } },
  });

  logger.info('Exit: createProfile service — success');
  return profile;
};

export const listProfiles = async (customerName?: string) => {
  logger.info('Entry: listProfiles service');

  const where = customerName ? { customerName } : {};

  const profiles = await prisma.pricingProfile.findMany({
    where,
    include: { profileProducts: true },
    orderBy: { updatedAt: 'desc' },
  });

  logger.info(`Exit: listProfiles service — found ${profiles.length} profiles`);
  return profiles;
};

export const getProfile = async (id: string) => {
  logger.info('Entry: getProfile service');

  const profile = await prisma.pricingProfile.findUnique({
    where: { id },
    include: { profileProducts: { include: { product: true } } },
  });

  if (!profile) {
    throw new ResourceNotFoundException(`Pricing profile with id ${id} not found`);
  }

  const computedPrices = profile.profileProducts.map((pp) => ({
    productId: pp.product.id,
    productTitle: pp.product.title,
    sku: pp.product.sku,
    basePrice: pp.product.basePrice,
    newPrice: computePrice(pp.product.basePrice, {
      adjustmentType: profile.adjustmentType,
      adjustmentDirection: profile.adjustmentDirection,
      adjustmentValue: profile.adjustmentValue,
    }),
  }));

  logger.info('Exit: getProfile service — success');
  return { ...profile, computedPrices };
};

export const updateProfile = async (id: string, body: UpdateProfileBody) => {
  logger.info('Entry: updateProfile service');

  const existing = await prisma.pricingProfile.findUnique({ where: { id } });
  if (!existing) {
    throw new ResourceNotFoundException(`Pricing profile with id ${id} not found`);
  }

  const { productIds, ...updateData } = body;

  const profile = await prisma.pricingProfile.update({
    where: { id },
    data: {
      ...updateData,
      ...(productIds && {
        profileProducts: {
          deleteMany: {},
          create: productIds.map((productId) => ({ productId })),
        },
      }),
    },
    include: { profileProducts: { include: { product: true } } },
  });

  logger.info('Exit: updateProfile service — success');
  return profile;
};

export const deleteProfile = async (id: string) => {
  logger.info('Entry: deleteProfile service');

  const existing = await prisma.pricingProfile.findUnique({ where: { id } });
  if (!existing) {
    throw new ResourceNotFoundException(`Pricing profile with id ${id} not found`);
  }

  await prisma.pricingProfile.delete({ where: { id } });

  logger.info('Exit: deleteProfile service — success');
  return { message: 'Profile deleted successfully' };
};

export const resolvePrice = async (productId: string, customerName: string) => {
  logger.info('Entry: resolvePrice service');

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new ResourceNotFoundException(`Product with id ${productId} not found`);
  }

  const profiles = await prisma.pricingProfile.findMany({
    where: {
      customerName,
      profileProducts: { some: { productId } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  if (profiles.length === 0) {
    return {
      productId: product.id,
      productTitle: product.title,
      basePrice: product.basePrice,
      newPrice: product.basePrice,
      profileId: null,
      profileName: null,
    };
  }

  const winningProfile = profiles[0];

  logger.info('Exit: resolvePrice service — success');
  return {
    productId: product.id,
    productTitle: product.title,
    basePrice: product.basePrice,
    newPrice: computePrice(product.basePrice, {
      adjustmentType: winningProfile.adjustmentType,
      adjustmentDirection: winningProfile.adjustmentDirection,
      adjustmentValue: winningProfile.adjustmentValue,
    }),
    profileId: winningProfile.id,
    profileName: winningProfile.name,
  };
};

export const resolveAllPrices = async (customerName: string) => {
  logger.info('Entry: resolveAllPrices service');

  const products = await prisma.product.findMany({ orderBy: { title: 'asc' } });

  const results = await Promise.all(
    products.map((product) => resolvePrice(product.id, customerName))
  );

  logger.info('Exit: resolveAllPrices service — success');
  return results;
};
```

- [ ] **Step 6: Create product controllers**

Create `packages/backend/src/controllers/product/index.ts`:

```typescript
import { Router, Request, Response, NextFunction } from 'express';
import { validateRequest } from '../../middlewares';
import * as policies from '../../policies/product';
import * as productServices from '../../services/product';
import logger from '../../utilities/logger';

const router = Router();

const listProductsController = async (req: Request, res: Response, next: NextFunction) => {
  logger.info('Entry: listProductsController');
  try {
    const products = await productServices.listProducts(req.query as any);
    logger.info('Exit: listProductsController — success');
    res.json(products);
  } catch (error) {
    logger.error(`Exit: listProductsController — error: ${error}`);
    next(error);
  }
};

const getProductController = async (req: Request, res: Response, next: NextFunction) => {
  logger.info('Entry: getProductController');
  try {
    const product = await productServices.getProduct(req.params.id);
    logger.info('Exit: getProductController — success');
    res.json(product);
  } catch (error) {
    logger.error(`Exit: getProductController — error: ${error}`);
    next(error);
  }
};

router.get('/', validateRequest(policies.listProductsPolicy), listProductsController);
router.get('/:id', validateRequest(policies.getProductPolicy), getProductController);

export default router;
```

- [ ] **Step 7: Create pricing profile controllers**

Create `packages/backend/src/controllers/pricingProfile/index.ts`:

```typescript
import { Router, Request, Response, NextFunction } from 'express';
import { validateRequest } from '../../middlewares';
import * as policies from '../../policies/pricingProfile';
import * as profileServices from '../../services/pricingProfile';
import logger from '../../utilities/logger';

const router = Router();

const createProfileController = async (req: Request, res: Response, next: NextFunction) => {
  logger.info('Entry: createProfileController');
  try {
    const profile = await profileServices.createProfile(req.body);
    logger.info('Exit: createProfileController — success');
    res.status(201).json(profile);
  } catch (error) {
    logger.error(`Exit: createProfileController — error: ${error}`);
    next(error);
  }
};

const listProfilesController = async (req: Request, res: Response, next: NextFunction) => {
  logger.info('Entry: listProfilesController');
  try {
    const profiles = await profileServices.listProfiles(req.query.customerName as string);
    logger.info('Exit: listProfilesController — success');
    res.json(profiles);
  } catch (error) {
    logger.error(`Exit: listProfilesController — error: ${error}`);
    next(error);
  }
};

const getProfileController = async (req: Request, res: Response, next: NextFunction) => {
  logger.info('Entry: getProfileController');
  try {
    const profile = await profileServices.getProfile(req.params.id);
    logger.info('Exit: getProfileController — success');
    res.json(profile);
  } catch (error) {
    logger.error(`Exit: getProfileController — error: ${error}`);
    next(error);
  }
};

const updateProfileController = async (req: Request, res: Response, next: NextFunction) => {
  logger.info('Entry: updateProfileController');
  try {
    const profile = await profileServices.updateProfile(req.params.id, req.body);
    logger.info('Exit: updateProfileController — success');
    res.json(profile);
  } catch (error) {
    logger.error(`Exit: updateProfileController — error: ${error}`);
    next(error);
  }
};

const deleteProfileController = async (req: Request, res: Response, next: NextFunction) => {
  logger.info('Entry: deleteProfileController');
  try {
    const result = await profileServices.deleteProfile(req.params.id);
    logger.info('Exit: deleteProfileController — success');
    res.json(result);
  } catch (error) {
    logger.error(`Exit: deleteProfileController — error: ${error}`);
    next(error);
  }
};

const resolvePriceController = async (req: Request, res: Response, next: NextFunction) => {
  logger.info('Entry: resolvePriceController');
  try {
    const result = await profileServices.resolvePrice(req.params.id, req.query.customerName as string);
    logger.info('Exit: resolvePriceController — success');
    res.json(result);
  } catch (error) {
    logger.error(`Exit: resolvePriceController — error: ${error}`);
    next(error);
  }
};

const resolveAllPricesController = async (req: Request, res: Response, next: NextFunction) => {
  logger.info('Entry: resolveAllPricesController');
  try {
    const results = await profileServices.resolveAllPrices(req.query.customerName as string);
    logger.info('Exit: resolveAllPricesController — success');
    res.json(results);
  } catch (error) {
    logger.error(`Exit: resolveAllPricesController — error: ${error}`);
    next(error);
  }
};

router
  .route('/')
  .post(validateRequest(policies.createProfilePolicy), createProfileController)
  .get(validateRequest(policies.listProfilesPolicy), listProfilesController);

router
  .route('/:id')
  .get(validateRequest(policies.getProfilePolicy), getProfileController)
  .put(validateRequest(policies.updateProfilePolicy), updateProfileController)
  .delete(validateRequest(policies.getProfilePolicy), deleteProfileController);

export default { profileRouter: router, resolvePriceController, resolveAllPricesController };
```

- [ ] **Step 8: Create main router**

Create `packages/backend/src/controllers/index.ts`:

```typescript
import { Router } from 'express';
import productRouter from './product';
import pricingProfileRoutes from './pricingProfile';
import { validateRequest } from '../middlewares';
import * as profilePolicies from '../policies/pricingProfile';

const router = Router();

router.use('/products', productRouter);
router.use('/pricing-profiles', pricingProfileRoutes.profileRouter);

router.get(
  '/products/:id/resolved-price',
  validateRequest(profilePolicies.resolvedPricesPolicy),
  pricingProfileRoutes.resolvePriceController
);

router.get(
  '/resolved-prices',
  validateRequest(profilePolicies.resolvedPricesPolicy),
  pricingProfileRoutes.resolveAllPricesController
);

export default router;
```

- [ ] **Step 9: Create Swagger config**

Create `packages/backend/src/swagger.ts`:

```typescript
import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FOBOH Pricing API',
      version: '1.0.0',
      description: 'Customer-specific pricing management for food and beverage suppliers',
    },
    servers: [{ url: '/api' }],
  },
  apis: ['./src/controllers/**/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
```

- [ ] **Step 10: Create server entry point**

Create `packages/backend/src/server.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import config from './config';
import logger from './utilities/logger';
import { requestLogger, resourceNotFound, errorHandling } from './middlewares';
import routes from './controllers';
import swaggerSpec from './swagger';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api', routes);

app.use(resourceNotFound);
app.use(errorHandling);

app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
  logger.info(`Swagger docs at http://localhost:${config.port}/api-docs`);
});

export default app;
```

- [ ] **Step 11: Commit**

```bash
cd /Users/jasminthummar/Desktop/foboh
git add packages/backend/src/
git commit -m "feat: add complete backend — controllers, services, policies, middlewares, server"
```

---

### Task 7: Set up frontend with Vite + React + TypeScript + Tailwind + shadcn/ui

**Files:**
- Create: `packages/frontend/` (full Vite scaffold)

- [ ] **Step 1: Scaffold Vite project**

```bash
cd /Users/jasminthummar/Desktop/foboh/packages
npm create vite@latest frontend -- --template react-ts
cd frontend
```

- [ ] **Step 2: Install dependencies**

```bash
npm install @tanstack/react-query react-router-dom axios sonner
npm install -D tailwindcss @tailwindcss/vite
```

- [ ] **Step 3: Configure Tailwind**

Replace `packages/frontend/src/index.css` with:

```css
@import "tailwindcss";
```

Update `packages/frontend/vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
```

Update `packages/frontend/tsconfig.json` — add paths:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

- [ ] **Step 4: Initialize shadcn/ui**

```bash
npx shadcn@latest init -d
```

Then install the components we need:

```bash
npx shadcn@latest add button input table checkbox select badge card dialog toast separator
```

- [ ] **Step 5: Create basic App with routing**

Replace `packages/frontend/src/App.tsx`:

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import Layout from './components/layout/Layout';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<div>Products Page (coming soon)</div>} />
            <Route path="/profiles" element={<div>Profiles List (coming soon)</div>} />
            <Route path="/profiles/new" element={<div>Create Profile (coming soon)</div>} />
            <Route path="/profiles/:id/edit" element={<div>Edit Profile (coming soon)</div>} />
            <Route path="/resolved-prices" element={<div>Resolved Prices (coming soon)</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;
```

- [ ] **Step 6: Create Layout component**

Create `packages/frontend/src/components/layout/Layout.tsx`:

```tsx
import { Outlet, Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Products' },
  { path: '/profiles', label: 'Pricing Profiles' },
  { path: '/resolved-prices', label: 'Resolved Prices' },
];

export default function Layout() {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-gray-900">FOBOH Pricing</h1>
            <nav className="flex gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium transition-colors ${
                    pathname === item.path
                      ? 'text-blue-600'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
```

- [ ] **Step 7: Create API client and types**

Create `packages/frontend/src/types/index.ts`:

```typescript
export interface Product {
  id: string;
  title: string;
  sku: string;
  category: string;
  subCategory: string;
  segment: string;
  brand: string;
  basePrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface PricingProfile {
  id: string;
  name: string;
  customerName: string;
  adjustmentType: 'fixed' | 'dynamic';
  adjustmentDirection: 'increase' | 'decrease';
  adjustmentValue: number;
  profileProducts: ProfileProduct[];
  createdAt: string;
  updatedAt: string;
}

export interface ProfileProduct {
  id: string;
  profileId: string;
  productId: string;
  product?: Product;
}

export interface ComputedPrice {
  productId: string;
  productTitle: string;
  sku?: string;
  basePrice: number;
  newPrice: number;
}

export interface ResolvedPrice {
  productId: string;
  productTitle: string;
  basePrice: number;
  newPrice: number;
  profileId: string | null;
  profileName: string | null;
}

export interface CreateProfilePayload {
  name: string;
  customerName: string;
  adjustmentType: 'fixed' | 'dynamic';
  adjustmentDirection: 'increase' | 'decrease';
  adjustmentValue: number;
  productIds: string[];
}
```

Create `packages/frontend/src/api/client.ts`:

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

export default apiClient;
```

Create `packages/frontend/src/api/products.ts`:

```typescript
import apiClient from './client';
import { Product } from '../types';

export const fetchProducts = async (params?: {
  search?: string;
  subCategory?: string;
  segment?: string;
  brand?: string;
}): Promise<Product[]> => {
  const { data } = await apiClient.get('/products', { params });
  return data;
};

export const fetchProduct = async (id: string): Promise<Product> => {
  const { data } = await apiClient.get(`/products/${id}`);
  return data;
};
```

Create `packages/frontend/src/api/pricingProfiles.ts`:

```typescript
import apiClient from './client';
import { PricingProfile, CreateProfilePayload, ResolvedPrice } from '../types';

export const fetchProfiles = async (customerName?: string): Promise<PricingProfile[]> => {
  const { data } = await apiClient.get('/pricing-profiles', {
    params: customerName ? { customerName } : {},
  });
  return data;
};

export const fetchProfile = async (id: string) => {
  const { data } = await apiClient.get(`/pricing-profiles/${id}`);
  return data;
};

export const createProfile = async (payload: CreateProfilePayload): Promise<PricingProfile> => {
  const { data } = await apiClient.post('/pricing-profiles', payload);
  return data;
};

export const updateProfile = async (
  id: string,
  payload: Partial<CreateProfilePayload>
): Promise<PricingProfile> => {
  const { data } = await apiClient.put(`/pricing-profiles/${id}`, payload);
  return data;
};

export const deleteProfile = async (id: string): Promise<void> => {
  await apiClient.delete(`/pricing-profiles/${id}`);
};

export const fetchResolvedPrices = async (customerName: string): Promise<ResolvedPrice[]> => {
  const { data } = await apiClient.get('/resolved-prices', { params: { customerName } });
  return data;
};
```

- [ ] **Step 8: Clean up Vite defaults**

Remove default Vite files:

```bash
rm -f packages/frontend/src/App.css packages/frontend/src/assets/react.svg packages/frontend/public/vite.svg
```

Replace `packages/frontend/src/main.tsx`:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 9: Commit**

```bash
cd /Users/jasminthummar/Desktop/foboh
git add packages/frontend/
git commit -m "feat: set up frontend — React, Vite, Tailwind, shadcn/ui, routing, API client"
```

---

### Task 8: Install root dependencies and verify everything works

- [ ] **Step 1: Install all dependencies from root**

```bash
cd /Users/jasminthummar/Desktop/foboh
npm install
```

- [ ] **Step 2: Run Prisma generate and migration**

```bash
cd packages/backend
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

- [ ] **Step 3: Test backend starts**

```bash
cd /Users/jasminthummar/Desktop/foboh
npm run dev:backend
```

Verify: `GET http://localhost:5000/health` returns `{ "status": "ok" }`

- [ ] **Step 4: Test frontend starts**

```bash
npm run dev:frontend
```

Verify: Opens on `http://localhost:3000` with navigation header.

- [ ] **Step 5: Commit any adjustments**

```bash
git add -A
git commit -m "chore: install dependencies and verify project setup"
```

---

### Task 9: Create README.md

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write comprehensive README**

Create `README.md`:

````markdown
# FOBOH — Customer-Specific Pricing

A fullstack application for managing customer-specific pricing profiles for food and beverage suppliers. Built as part of the FOBOH technical assessment.

## Tech Stack

### Backend
- **Runtime**: Node.js 25 + TypeScript
- **Framework**: Express.js
- **ORM**: Prisma with PostgreSQL (Neon DB)
- **Validation**: Zod
- **Logging**: Winston
- **API Docs**: Swagger/OpenAPI at `/api-docs`

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6

## Project Structure

```
foboh/
├── packages/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── config/            # Environment configuration
│   │   │   ├── controllers/       # Route handlers (thin layer)
│   │   │   │   ├── product/       # Product endpoints
│   │   │   │   └── pricingProfile/ # Pricing profile endpoints
│   │   │   ├── services/          # Business logic layer
│   │   │   │   ├── product/       # Product business logic
│   │   │   │   └── pricingProfile/ # Pricing + resolver logic
│   │   │   ├── policies/          # Zod validation schemas
│   │   │   │   ├── product/
│   │   │   │   └── pricingProfile/
│   │   │   ├── middlewares/       # Express middlewares
│   │   │   │   ├── errorHandling.ts
│   │   │   │   ├── requestLogger.ts
│   │   │   │   ├── resourceNotFound.ts
│   │   │   │   └── validateRequest.ts
│   │   │   ├── utilities/         # Helpers and exceptions
│   │   │   │   ├── exceptions/    # Custom HTTP exceptions
│   │   │   │   ├── computePrice.ts
│   │   │   │   └── logger.ts
│   │   │   ├── prisma/           # Database schema, client, seed
│   │   │   ├── swagger.ts
│   │   │   └── server.ts         # Express entry point
│   │   └── package.json
│   └── frontend/
│       ├── src/
│       │   ├── api/              # API client functions
│       │   ├── components/       # React components + shadcn/ui
│       │   ├── hooks/            # Custom React hooks
│       │   ├── pages/            # Page components
│       │   ├── types/            # TypeScript interfaces
│       │   └── App.tsx           # Root with routing
│       └── package.json
├── package.json                  # Root workspace config
└── README.md
```

## Architecture

The backend follows a **Controller → Service → Model** layered architecture:

- **Controllers** — Thin request/response handlers. Extract params, call service, return response.
- **Services** — Business logic layer. Database operations via Prisma. Throws custom exceptions on failure.
- **Policies** — Zod validation schemas applied via middleware before controller execution.
- **Middlewares** — Error handling, request logging, input validation, 404 handler.
- **Utilities** — Winston logger, custom exception classes, price computation helper.

### Middleware Pipeline

```
Request → CORS → JSON Parser → Request Logger → Route Handler → 404 Handler → Error Handler
```

### Custom Exception Classes

| Exception | Status | Usage |
|-----------|--------|-------|
| `BadRequestException` | 400 | Invalid input / validation failure |
| `ResourceNotFoundException` | 404 | Resource doesn't exist |
| `ConflictException` | 409 | Duplicate / business logic conflict |
| `InternalServerException` | 500 | Unexpected server error |

All errors return a consistent response format:

```json
{
  "error": {
    "title": "Bad request",
    "description": "Adjustment value must be positive"
  }
}
```

## How I Built This Project

### 1. Initialized the Monorepo

Created an npm workspaces monorepo to keep frontend and backend in a single repository while maintaining clean separation.

```bash
mkdir foboh && cd foboh
git init
# Created root package.json with workspaces: ["packages/backend", "packages/frontend"]
```

### 2. Set Up the Backend

```bash
cd packages/backend
npm init -y
npm install express cors zod winston swagger-jsdoc swagger-ui-express @prisma/client
npm install -D typescript ts-node nodemon prisma @types/node @types/express @types/cors
```

Configured TypeScript (`tsconfig.json`) targeting ES2022 with strict mode. Added `nodemon.json` for auto-reload during development.

### 3. Database with Prisma + Neon PostgreSQL

```bash
npx prisma init --datasource-provider postgresql
```

Defined three models in `schema.prisma`:
- **Product** — Wine products with title, SKU, category, segment, brand, base price
- **PricingProfile** — Customer pricing rules with adjustment type/direction/value
- **ProfileProduct** — Many-to-many join table linking profiles to products

Ran migrations and seeded 5 wine products.

### 4. Built the Layered Backend Architecture

Structured the backend following a module-based Controller → Service → Model pattern:

- Each module (product, pricingProfile) has its own controller, service, and policy directory
- Controllers are thin — they extract request data, call the service, and return the response
- Services contain all business logic and database operations
- Policies define Zod schemas for request validation

### 5. Set Up the Frontend

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install @tanstack/react-query react-router-dom axios sonner
npx shadcn@latest init -d
npx shadcn@latest add button input table checkbox select badge card
```

Configured Vite proxy to forward `/api` requests to the backend, added TanStack Query for server state management, and set up React Router for navigation.

## Price Calculation

| Type | Direction | Formula |
|------|-----------|---------|
| Fixed | Increase | `newPrice = basePrice + value` |
| Fixed | Decrease | `newPrice = basePrice - value` |
| Dynamic | Increase | `newPrice = basePrice + (value% × basePrice)` |
| Dynamic | Decrease | `newPrice = basePrice - (value% × basePrice)` |

New price is never negative (floored at $0.00).

## Overlapping Profile Precedence Rule

**Most recently updated profile wins.**

When a product appears in multiple pricing profiles for the same customer, the profile with the latest `updatedAt` timestamp takes precedence.

### Resolver Endpoint

```
GET /api/resolved-prices?customerName=Acme Corp
```

Returns the final computed price for every product, applying the winning profile for each.

### Why This Rule?

This mirrors real-world pricing behavior where the most recent pricing decision supersedes older ones. It's simple, predictable, and easy for users to understand — "the last update wins."

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9
- PostgreSQL database (or use the provided Neon DB connection)

### Setup

```bash
# Clone the repository
git clone https://github.com/jasmin926211/foboh-task.git
cd foboh-task

# Install all dependencies
npm install

# Set up the database
cp packages/backend/.env.example packages/backend/.env
# Edit .env with your DATABASE_URL

# Run migrations and seed data
npm run db:setup

# Start development servers
npm run dev
```

This starts:
- **Backend** at `http://localhost:5000`
- **Frontend** at `http://localhost:3000`
- **Swagger Docs** at `http://localhost:5000/api-docs`

## API Endpoints

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (filterable by search, subCategory, segment, brand) |
| GET | `/api/products/:id` | Get a single product |

### Pricing Profiles

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/pricing-profiles` | Create a pricing profile |
| GET | `/api/pricing-profiles` | List all profiles |
| GET | `/api/pricing-profiles/:id` | Get profile with computed prices |
| PUT | `/api/pricing-profiles/:id` | Update a profile |
| DELETE | `/api/pricing-profiles/:id` | Delete a profile |

### Price Resolver

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/resolved-prices?customerName=X` | Resolved prices for all products |
| GET | `/api/products/:id/resolved-price?customerName=X` | Resolved price for one product |
````

- [ ] **Step 2: Create .env.example**

Create `packages/backend/.env.example`:

```
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
```

- [ ] **Step 3: Commit**

```bash
cd /Users/jasminthummar/Desktop/foboh
git add README.md packages/backend/.env.example
git commit -m "docs: add comprehensive README with architecture, setup, and API documentation"
```

---

### Task 10: Push to GitHub

- [ ] **Step 1: Push all commits**

```bash
cd /Users/jasminthummar/Desktop/foboh
git push origin main
```

- [ ] **Step 2: Verify on GitHub**

```bash
gh repo view jasmin926211/foboh-task --web
```
