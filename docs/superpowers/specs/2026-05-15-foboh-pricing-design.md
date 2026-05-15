# FOBOH Customer-Specific Pricing — Design Spec

## Overview

Fullstack application (React + Node.js) for managing customer-specific pricing profiles. Suppliers can select products, apply price adjustments (fixed $ or dynamic %), preview computed prices, and save profiles. An overlapping-profile resolver determines the final price when a product belongs to multiple profiles.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + TypeScript + Zod validation + Swagger/OpenAPI
- **Database**: PostgreSQL (Neon DB) with Prisma ORM
- **State Management**: TanStack Query (server state) + React local state
- **Routing**: React Router v6
- **Logging**: Winston (structured logging, same pattern as tkf-backend)
- **Project Structure**: Monorepo with `packages/frontend` and `packages/backend`
- **GitHub**: https://github.com/jasmin926211/foboh-task

## Architecture Pattern

Following the **Controller → Service → Model** layered architecture from admin-backend and tkf-backend:

- **Controllers**: Thin request/response handlers. Extract params, call service, return response. Entry/exit logging.
- **Services**: Business logic. Database operations via Prisma. Throw custom exceptions.
- **Models**: Prisma schema defines PostgreSQL tables. Prisma Client for type-safe queries.
- **Policies**: Zod validation schemas (TypeScript equivalent of Joi policies pattern).
- **Middlewares**: Error handling, request logging, validation.
- **Utilities**: Logger, custom exceptions, helpers.

## Database Configuration

**Neon DB (PostgreSQL)**:
```
postgresql://neondb_owner:npg_fM0T3vjFeOlg@ep-steep-band-aemej13n-pooler.c-2.us-east-2.aws.neon.tech/foboh?sslmode=require&channel_binding=require
```

**ORM**: Prisma (TypeScript-first, auto-generated types, migrations, works perfectly with Neon DB).

## Data Models (Prisma Schema)

### Product

```prisma
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
```

### PricingProfile

```prisma
model PricingProfile {
  id                  String   @id @default(uuid())
  name                String
  customerName        String   @map("customer_name")
  adjustmentType      AdjustmentType @map("adjustment_type")
  adjustmentDirection AdjustmentDirection @map("adjustment_direction")
  adjustmentValue     Float    @map("adjustment_value")
  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")

  profileProducts ProfileProduct[]

  @@map("pricing_profiles")
}

enum AdjustmentType {
  fixed
  dynamic
}

enum AdjustmentDirection {
  increase
  decrease
}
```

### ProfileProduct (Join Table)

```prisma
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

### Computed Price (TypeScript type — not a DB table)

```typescript
interface ComputedPrice {
  productId: string;
  productTitle: string;
  sku: string;
  basePrice: number;
  newPrice: number;
  adjustmentType: string;
  adjustmentDirection: string;
  adjustmentValue: number;
  profileId: string;
  profileName: string;
}
```

## Seed Data (5 Wine Products)

| Title | SKU | Sub-Category | Segment | Brand | Base Price |
|-------|-----|-------------|---------|-------|-----------|
| Penfolds Grange 2019 | PEN-GRG-2019 | Red | Premium | Penfolds | $850.00 |
| Yellow Tail Shiraz | YT-SHZ-001 | Red | Budget | Yellow Tail | $8.99 |
| Cloudy Bay Sauvignon Blanc | CB-SB-2022 | White | Premium | Cloudy Bay | $28.50 |
| Moet & Chandon Imperial | MC-IMP-NV | Sparkling | Premium | Moet & Chandon | $65.00 |
| Whispering Hills Rose | WH-RSE-2023 | Rose | Standard | Whispering Hills | $14.99 |

Seed data is loaded via `prisma db seed` using a `seed.ts` script.

## Price Calculation Rules

- **Fixed increase**: `newPrice = basePrice + adjustmentValue`
- **Fixed decrease**: `newPrice = basePrice - adjustmentValue`
- **Dynamic increase**: `newPrice = basePrice + (adjustmentValue / 100 * basePrice)`
- **Dynamic decrease**: `newPrice = basePrice - (adjustmentValue / 100 * basePrice)`
- **Floor**: `newPrice = Math.max(0, newPrice)` — never negative

## Overlapping Profile Precedence Rule

**Rule: Most recently updated profile wins.**

When a product appears in multiple pricing profiles for the same customer, the profile with the latest `updatedAt` timestamp takes precedence. This mirrors real-world pricing behavior where the most recent pricing decision supersedes older ones.

### Resolver Logic

```typescript
function resolvePrice(productId: string, customerName: string, profiles: PricingProfile[]): number {
  const applicableProfiles = profiles
    .filter(p => p.customerName === customerName && p.productIds.includes(productId))
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  if (applicableProfiles.length === 0) {
    return product.basePrice; // no profile applies
  }

  const winningProfile = applicableProfiles[0]; // most recent
  return computePrice(product.basePrice, winningProfile);
}
```

## API Endpoints

All endpoints prefixed with `/api`.

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products. Query: `search`, `subCategory`, `segment`, `brand` |
| GET | `/api/products/:id` | Get a single product |

### Pricing Profiles

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/pricing-profiles` | Create profile |
| GET | `/api/pricing-profiles` | List all profiles. Optional query: `customerName` |
| GET | `/api/pricing-profiles/:id` | Get profile with computed prices for each product |
| PUT | `/api/pricing-profiles/:id` | Update profile (updates `updatedAt`) |
| DELETE | `/api/pricing-profiles/:id` | Delete profile |

### Price Resolver

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/resolved-prices?customerName=X` | Get final resolved prices for all products for a customer |
| GET | `/api/products/:id/resolved-price?customerName=X` | Get resolved price for a single product for a customer |

### Docs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api-docs` | Swagger UI |

## Validation (Zod Policies)

Following admin-backend's `policies/` pattern but with Zod instead of Joi:

### Create Profile Policy

```typescript
const createProfilePolicy = {
  body: z.object({
    name: z.string().min(1).max(100),
    customerName: z.string().min(1).max(100),
    adjustmentType: z.enum(["fixed", "dynamic"]),
    adjustmentDirection: z.enum(["increase", "decrease"]),
    adjustmentValue: z.number().positive(),
    productIds: z.array(z.string().uuid()).min(1),
  }),
};
```

### Update Profile Policy

Same as create but all fields optional (partial update).

### Query Policies

```typescript
const listProductsPolicy = {
  query: z.object({
    search: z.string().optional(),
    subCategory: z.string().optional(),
    segment: z.string().optional(),
    brand: z.string().optional(),
  }),
};
```

## Custom Exception Classes

Following the exact pattern from tkf-backend and admin-backend:

```typescript
// src/utilities/exceptions/
BadRequestException      // 400 — Invalid input
UnauthorizedException    // 401 — Auth failure (for future use)
ForbiddenException       // 403 — Permission denied (for future use)
ResourceNotFoundException // 404 — Not found
ConflictException        // 409 — Duplicate/conflict
InternalServerException  // 500 — Server error
```

**Exception structure:**
```typescript
class BadRequestException extends Error {
  statusCode: number;
  title: string;
  description: string;

  constructor(exception: string | ExceptionPayload) {
    super();
    generateException(this, 400, 'Bad request', exception);
  }
}
```

**Error response format** (matches both projects):
```json
{
  "error": {
    "title": "Bad request",
    "description": "Adjustment value must be positive"
  }
}
```

## Backend Project Structure

```
packages/backend/
├── src/
│   ├── server.ts                          # Express app entry point
│   ├── config/
│   │   ├── index.ts                       # Environment config (from .env)
│   │   └── logger.ts                      # Winston logger setup
│   ├── controllers/
│   │   ├── index.ts                       # Main router (combines all routes)
│   │   ├── product/
│   │   │   ├── index.ts                   # Product routes definition
│   │   │   ├── listProducts.controller.ts
│   │   │   └── getProduct.controller.ts
│   │   └── pricingProfile/
│   │       ├── index.ts                   # Pricing profile routes definition
│   │       ├── createProfile.controller.ts
│   │       ├── listProfiles.controller.ts
│   │       ├── getProfile.controller.ts
│   │       ├── updateProfile.controller.ts
│   │       ├── deleteProfile.controller.ts
│   │       └── resolvePrice.controller.ts
│   ├── services/
│   │   ├── product/
│   │   │   ├── index.ts                   # Export all product services
│   │   │   ├── listProducts.service.ts
│   │   │   └── getProduct.service.ts
│   │   └── pricingProfile/
│   │       ├── index.ts                   # Export all profile services
│   │       ├── createProfile.service.ts
│   │       ├── listProfiles.service.ts
│   │       ├── getProfile.service.ts
│   │       ├── updateProfile.service.ts
│   │       ├── deleteProfile.service.ts
│   │       └── resolvePrice.service.ts
│   ├── policies/
│   │   ├── product/
│   │   │   └── index.ts                   # Product validation schemas
│   │   └── pricingProfile/
│   │       └── index.ts                   # Profile validation schemas
│   ├── middlewares/
│   │   ├── index.ts                       # Export all middlewares
│   │   ├── errorHandling.ts               # Global error handler
│   │   ├── requestLogger.ts               # HTTP request logging
│   │   ├── resourceNotFound.ts            # 404 handler
│   │   └── validateRequest.ts             # Zod validation middleware
│   ├── utilities/
│   │   ├── logger.ts                      # Winston logger instance
│   │   ├── computePrice.ts               # Price calculation helper
│   │   └── exceptions/
│   │       ├── index.ts
│   │       ├── generateException.ts
│   │       ├── BadRequestException.ts
│   │       ├── ResourceNotFoundException.ts
│   │       ├── ConflictException.ts
│   │       └── InternalServerException.ts
│   ├── prisma/
│   │   ├── schema.prisma                  # Database schema
│   │   ├── seed.ts                        # Seed 5 wine products
│   │   └── client.ts                      # Prisma client singleton
│   └── swagger.ts                         # Swagger/OpenAPI config
├── package.json
├── tsconfig.json
├── .env
└── nodemon.json
```

## Frontend Project Structure

```
packages/frontend/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── ui/                            # shadcn components
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   └── Layout.tsx
│   │   ├── ProductTable.tsx
│   │   ├── ProductFilters.tsx
│   │   ├── PricingProfileForm.tsx
│   │   ├── PricePreviewTable.tsx
│   │   └── ResolvedPricesTable.tsx
│   ├── pages/
│   │   ├── ProductsPage.tsx
│   │   ├── CreateProfilePage.tsx
│   │   ├── EditProfilePage.tsx
│   │   ├── ProfilesListPage.tsx
│   │   └── ResolvedPricesPage.tsx
│   ├── api/
│   │   ├── client.ts                      # Axios instance
│   │   ├── products.ts                    # Product API functions
│   │   └── pricingProfiles.ts             # Profile API functions
│   ├── hooks/
│   │   ├── useProducts.ts                 # TanStack Query hooks
│   │   └── useProfiles.ts
│   ├── types/
│   │   └── index.ts                       # Shared frontend types
│   └── lib/
│       └── utils.ts                       # Tailwind cn() util
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── components.json                        # shadcn config
└── index.html
```

## Frontend Pages

### 1. Products Page (`/`)

- Search bar (filters by title, SKU — debounced)
- Filter dropdowns: Sub-Category, Segment, Brand
- Product table: Checkbox, Title, SKU, Sub-Category, Segment, Brand, Base Price
- Select-all checkbox in table header
- "Create Pricing Profile" button (disabled when no products selected)
- Floating selection count indicator

### 2. Create Pricing Profile Page (`/profiles/new`)

- Profile name input
- Customer name input
- Adjustment type toggle: Fixed ($) / Dynamic (%)
- Direction toggle: Increase / Decrease
- Adjustment value input
- Selected products table with live price preview: Title, Base Price, New Price
- Price change shown in green (increase) or red (decrease)
- Save button → POST to API → redirect to profiles list

### 3. Edit Pricing Profile Page (`/profiles/:id/edit`)

- Same as create but pre-filled with existing profile data
- Can add/remove products
- Save button → PUT to API

### 4. Pricing Profiles List Page (`/profiles`)

- Table: Name, Customer, Adjustment Type, Value, Product Count, Created, Updated
- Click row to view/edit
- Delete button with confirmation

### 5. Resolved Prices Page (`/resolved-prices`)

- Customer name input/dropdown
- Table showing all products with their resolved final prices
- Indicates which profile is the source of each price
- Products with no applicable profile show base price

## Middleware Pipeline

Following tkf-backend order:

```
HTTP Request
→ cors()
→ express.json()
→ express.urlencoded({ extended: true })
→ requestLogger (Winston HTTP logging)
→ Route handlers (controller → service → Prisma)
→ resourceNotFound (404)
→ errorHandling (global error handler — must be last)
```

## Controller Pattern (TypeScript)

```typescript
// src/controllers/pricingProfile/createProfile.controller.ts
import { Request, Response, NextFunction } from 'express';
import logger from '../../utilities/logger';
import * as profileServices from '../../services/pricingProfile';

const createProfileController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  logger.info('Entry: createProfileController');
  try {
    const response = await profileServices.createProfile(req.body);
    logger.info('Exit: createProfileController — success');
    res.status(201).json(response);
  } catch (error) {
    logger.error(`Exit: createProfileController — error: ${error}`);
    next(error);
  }
};

export default createProfileController;
```

## Service Pattern (TypeScript)

```typescript
// src/services/pricingProfile/createProfile.service.ts
import prisma from '../../prisma/client';
import logger from '../../utilities/logger';
import { BadRequestException, InternalServerException } from '../../utilities/exceptions';
import { CreateProfileBody } from '../../policies/pricingProfile';

const createProfile = async (body: CreateProfileBody) => {
  try {
    logger.info('Entry: createProfile service');

    const profile = await prisma.pricingProfile.create({
      data: {
        name: body.name,
        customerName: body.customerName,
        adjustmentType: body.adjustmentType,
        adjustmentDirection: body.adjustmentDirection,
        adjustmentValue: body.adjustmentValue,
        profileProducts: {
          create: body.productIds.map(productId => ({ productId })),
        },
      },
      include: { profileProducts: { include: { product: true } } },
    });

    logger.info('Exit: createProfile service — success');
    return profile;
  } catch (error: any) {
    logger.error(`Error in createProfile: ${error.message}`);
    if (error.statusCode) throw error;
    throw new InternalServerException('Failed to create pricing profile');
  }
};

export default createProfile;
```

## Route Definition Pattern

```typescript
// src/controllers/pricingProfile/index.ts
import { Router } from 'express';
import { validateRequest } from '../../middlewares';
import * as policies from '../../policies/pricingProfile';
import createProfileController from './createProfile.controller';
import listProfilesController from './listProfiles.controller';
// ...

const router = Router();

router.route('/')
  .post(validateRequest(policies.createProfilePolicy), createProfileController)
  .get(validateRequest(policies.listProfilesPolicy), listProfilesController);

router.route('/:id')
  .get(getProfileController)
  .put(validateRequest(policies.updateProfilePolicy), updateProfileController)
  .delete(deleteProfileController);

export default router;
```

## Error Handling

- Backend returns consistent JSON: `{ error: { title, description } }`
- 400 for validation errors, 404 for not found, 409 for conflicts, 500 for server errors
- Frontend shows toast notifications using sonner (shadcn-compatible)

## Testing

- Backend: Unit tests for price calculation and resolver logic (Vitest)
- Manual testing checklist in README

## NPM Scripts

```json
{
  "dev": "Run both frontend and backend concurrently",
  "dev:backend": "nodemon with ts-node for backend",
  "dev:frontend": "vite dev server",
  "build": "Build both packages",
  "db:migrate": "prisma migrate dev",
  "db:seed": "prisma db seed",
  "db:studio": "prisma studio (GUI for database)"
}
```
