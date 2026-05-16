# FOBOH — Customer-Specific Pricing Platform

A fullstack monorepo application for managing **customer-specific pricing profiles** for food and beverage suppliers. Suppliers can create dynamic pricing rules per customer, assign them to specific products, and resolve final computed prices — handling overlapping profile scenarios with a clear precedence strategy.

Built as part of the **FOBOH technical assessment**.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Business Logic](#business-logic)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Frontend Pages & Components](#frontend-pages--components)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)

---

## Tech Stack

### Backend

| Technology        | Version | Purpose                                 |
| ----------------- | ------- | --------------------------------------- |
| Node.js           | >= 18   | JavaScript runtime                      |
| Express.js        | 5.2.1   | HTTP framework                          |
| TypeScript        | 6.0.3   | Type-safe JavaScript                    |
| Prisma            | 7.8.0   | ORM with migrations & type-safe queries |
| PostgreSQL (Neon) | —       | Relational database                     |
| Zod               | 4.4.3   | Runtime schema validation               |
| Winston           | 3.19.0  | Structured logging                      |
| Swagger/OpenAPI   | 3.0.0   | Interactive API documentation           |
| Prettier          | 3.8.3   | Code formatting                         |
| Nodemon           | 3.1.14  | Hot-reload during development           |

### Frontend

| Technology          | Version  | Purpose                           |
| ------------------- | -------- | --------------------------------- |
| React               | 19.2.6   | UI library                        |
| TypeScript          | 6.0.2    | Type-safe JavaScript              |
| Vite                | 8.0.12   | Build tool & dev server           |
| Tailwind CSS        | 4.3.0    | Utility-first CSS framework       |
| shadcn/ui + Base-UI | 1.4.1    | Accessible UI component library   |
| React Router        | 7.15.1   | Client-side routing               |
| TanStack Query      | 5.100.10 | Server state management & caching |
| Axios               | 1.16.1   | HTTP client                       |
| Sonner              | 2.0.7    | Toast notifications               |
| Lucide React        | 1.16.0   | Icon library                      |

### Monorepo

| Technology     | Purpose                               |
| -------------- | ------------------------------------- |
| npm workspaces | Monorepo package management           |
| concurrently   | Run backend + frontend simultaneously |

---

## Project Structure

```
foboh/
├── package.json                          # Root workspace config with shared scripts
├── package-lock.json
├── README.md
│
├── packages/
│   ├── backend/
│   │   ├── package.json                  # Backend dependencies & scripts
│   │   ├── tsconfig.json                 # TypeScript config (ES2022, strict)
│   │   ├── nodemon.json                  # Dev server auto-reload config
│   │   ├── prisma.config.ts              # Prisma CLI configuration
│   │   ├── .prettierrc                   # Code formatting rules
│   │   ├── .env.example                  # Environment variable template
│   │   └── src/
│   │       ├── server.ts                 # Express app entry point & middleware stack
│   │       ├── swagger.ts                # OpenAPI/Swagger specification
│   │       ├── config/
│   │       │   └── index.ts              # Environment variable loader (PORT, NODE_ENV, DATABASE_URL)
│   │       ├── controllers/
│   │       │   ├── index.ts              # Route definitions & middleware binding
│   │       │   ├── product/
│   │       │   │   └── index.ts          # Product request handlers
│   │       │   └── pricingProfile/
│   │       │       └── index.ts          # Pricing profile + price resolver handlers
│   │       ├── services/
│   │       │   ├── product/
│   │       │   │   └── index.ts          # Product queries with search & filtering
│   │       │   └── pricingProfile/
│   │       │       └── index.ts          # Profile CRUD + price resolution logic
│   │       ├── policies/
│   │       │   ├── product/
│   │       │   │   └── index.ts          # Zod schemas for product endpoints
│   │       │   └── pricingProfile/
│   │       │       └── index.ts          # Zod schemas for profile endpoints
│   │       ├── middlewares/
│   │       │   ├── index.ts              # Middleware barrel export
│   │       │   ├── errorHandling.ts      # Global error response formatter
│   │       │   ├── requestLogger.ts      # HTTP request/response timing logger
│   │       │   ├── resourceNotFound.ts   # 404 catch-all handler
│   │       │   └── validateRequest.ts    # Zod schema validation middleware
│   │       ├── utilities/
│   │       │   ├── computePrice.ts       # Core pricing calculation engine
│   │       │   ├── logger.ts             # Winston logger instance
│   │       │   └── exceptions/
│   │       │       ├── index.ts              # Exception barrel export
│   │       │       ├── generateException.ts  # Exception factory
│   │       │       ├── BadRequestException.ts       # 400 — validation failures
│   │       │       ├── ResourceNotFoundException.ts # 404 — resource not found
│   │       │       ├── ConflictException.ts         # 409 — duplicate conflicts
│   │       │       └── InternalServerException.ts   # 500 — unexpected errors
│   │       └── prisma/
│   │           ├── schema.prisma         # Database models, enums & relations
│   │           ├── client.ts             # Prisma client singleton (PrismaPg adapter)
│   │           ├── seed.ts               # Seed 5 wine products (upsert pattern)
│   │           └── migrations/
│   │               └── 20260515122950_init/
│   │                   └── migration.sql # Initial migration SQL
│   │
│   └── frontend/
│       ├── package.json                  # Frontend dependencies & scripts
│       ├── index.html                    # HTML entry point
│       ├── vite.config.ts                # Vite config (proxy, aliases, Tailwind plugin)
│       ├── tsconfig.json                 # TypeScript project references
│       ├── tsconfig.app.json             # App TypeScript config (ES2023, JSX)
│       ├── tsconfig.node.json            # Node-side TypeScript config
│       ├── components.json               # shadcn/ui configuration
│       ├── eslint.config.js              # ESLint config for React + TypeScript
│       └── src/
│           ├── main.tsx                  # React DOM entry point
│           ├── App.tsx                   # Root component — Router, QueryClient, Toaster
│           ├── index.css                 # Global styles, Tailwind imports, CSS variables
│           ├── api/
│           │   ├── client.ts             # Axios instance (baseURL: /api)
│           │   ├── products.ts           # Product API functions (fetch, filter)
│           │   └── pricingProfiles.ts    # Profile API functions (CRUD + resolve)
│           ├── components/
│           │   ├── layout/
│           │   │   └── Layout.tsx        # App shell — header, navigation, outlet
│           │   └── ui/                   # shadcn/ui components (Base-UI + Tailwind)
│           │       ├── badge.tsx
│           │       ├── button.tsx
│           │       ├── card.tsx
│           │       ├── checkbox.tsx
│           │       ├── dialog.tsx
│           │       ├── input.tsx
│           │       ├── select.tsx
│           │       ├── separator.tsx
│           │       └── table.tsx
│           ├── types/
│           │   └── index.ts              # Shared TypeScript interfaces
│           ├── lib/
│           │   └── utils.ts              # cn() — clsx + tailwind-merge helper
│           └── assets/
│               └── hero.png
```

---

## Architecture

### Backend — Layered Architecture

The backend follows a **Controller → Service → Policy** pattern with a composable middleware pipeline:

```
Request
  │
  ├─→ CORS
  ├─→ JSON Body Parser
  ├─→ Request Logger (timing + status level)
  │
  ├─→ Route Matched?
  │     │
  │     ├─→ validateRequest(policy)     ← Zod schema validation
  │     ├─→ Controller                  ← Extract params, call service, return response
  │     │     └─→ Service               ← Business logic + Prisma DB operations
  │     │           └─→ computePrice()  ← Price calculation utility
  │     │
  │     └─→ Response (200/201)
  │
  ├─→ 404 Handler (resourceNotFound)
  └─→ Error Handler (errorHandling)     ← Catches exceptions, returns JSON error
```

**Layer Responsibilities:**

| Layer           | Responsibility                                                                             |
| --------------- | ------------------------------------------------------------------------------------------ |
| **Controllers** | Thin request/response handlers. Extract params, call service, return JSON.                 |
| **Services**    | All business logic and database operations via Prisma. Throw custom exceptions on failure. |
| **Policies**    | Zod validation schemas for request body, query params, and URL params.                     |
| **Middlewares** | Cross-cutting concerns: error handling, logging, validation, 404 handling.                 |
| **Utilities**   | Price computation engine, Winston logger, custom exception classes.                        |

### Error Handling Strategy

All custom exceptions follow a consistent format:

| Exception                   | Status | Usage                         |
| --------------------------- | ------ | ----------------------------- |
| `BadRequestException`       | 400    | Invalid input / validation    |
| `ResourceNotFoundException` | 404    | Resource doesn't exist        |
| `ConflictException`         | 409    | Duplicate / business conflict |
| `InternalServerException`   | 500    | Unexpected server error       |

**Standardized error response:**

```json
{
  "error": {
    "title": "Bad request",
    "description": "Adjustment value must be positive"
  }
}
```

### Frontend Architecture

```
Browser URL
  │
  ├─→ React Router (BrowserRouter)
  │     └─→ Layout Component (Header + Nav)
  │           └─→ Page Component (via <Outlet />)
  │
  ├─→ TanStack Query (server state, caching, refetch)
  │     └─→ API Client (Axios → /api proxy → backend:5000)
  │
  └─→ Sonner (toast notifications)
```

**State Management:**

- **Server state**: TanStack React Query (fetch, cache, sync, invalidate)
- **Client routing**: React Router v7 with `useLocation()` for active link detection
- **Local state**: React component state for forms and UI interactions

---

## Database Schema

### Entity Relationship Diagram

```
┌──────────────────────┐       ┌──────────────────────┐       ┌──────────────────────┐
│       Product         │       │    ProfileProduct     │       │   PricingProfile      │
├──────────────────────┤       ├──────────────────────┤       ├──────────────────────┤
│ id          UUID  PK │◄──────│ product_id   UUID FK │       │ id          UUID  PK │
│ title       String   │       │ profile_id   UUID FK │──────►│ name        String   │
│ sku         String U │       │ id           UUID PK │       │ customer_name String │
│ category    String   │       └──────────────────────┘       │ adjustment_type Enum │
│ sub_category String  │        UNIQUE(profile_id,            │ adjustment_direction  │
│ segment     String   │               product_id)            │              Enum    │
│ brand       String   │        ON DELETE CASCADE              │ adjustment_value     │
│ base_price  Float    │                                      │              Float   │
│ created_at  DateTime │                                      │ created_at  DateTime │
│ updated_at  DateTime │                                      │ updated_at  DateTime │
└──────────────────────┘                                      └──────────────────────┘
```

### Enums

```prisma
enum AdjustmentType {
  fixed       // Absolute dollar amount adjustment
  dynamic     // Percentage-based adjustment
}

enum AdjustmentDirection {
  increase    // Add to base price
  decrease    // Subtract from base price
}
```

### Seed Data (5 Wine Products)

| Product                    | SKU          | Category  | Segment  | Brand            | Base Price |
| -------------------------- | ------------ | --------- | -------- | ---------------- | ---------- |
| Penfolds Grange 2019       | PEN-GRG-2019 | Red       | Premium  | Penfolds         | $850.00    |
| Yellow Tail Shiraz         | YT-SHZ-001   | Red       | Budget   | Yellow Tail      | $8.99      |
| Cloudy Bay Sauvignon Blanc | CB-SB-2022   | White     | Premium  | Cloudy Bay       | $28.50     |
| Moet & Chandon Imperial    | MC-IMP-NV    | Sparkling | Premium  | Moet & Chandon   | $65.00     |
| Whispering Hills Rose      | WH-RSE-2023  | Rose      | Standard | Whispering Hills | $14.99     |

Seeding uses an **upsert pattern** (by SKU) for idempotent re-runs.

---

## API Reference

**Base URL:** `http://localhost:5000/api`

### Products

#### `GET /api/products` — List all products

**Query Parameters:**

| Param         | Type   | Required | Description                                   |
| ------------- | ------ | -------- | --------------------------------------------- |
| `search`      | string | No       | Search by title or SKU (case-insensitive)     |
| `subCategory` | string | No       | Filter by sub-category (e.g., "Red", "White") |
| `segment`     | string | No       | Filter by segment (e.g., "Premium", "Budget") |
| `brand`       | string | No       | Filter by brand name                          |

**Response:** `200 OK`

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Penfolds Grange 2019",
    "sku": "PEN-GRG-2019",
    "category": "Wine",
    "subCategory": "Red",
    "segment": "Premium",
    "brand": "Penfolds",
    "basePrice": 850.0,
    "createdAt": "2026-05-15T12:30:00.000Z",
    "updatedAt": "2026-05-15T12:30:00.000Z"
  }
]
```

#### `GET /api/products/:id` — Get a single product

**Path Parameters:**

| Param | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| `id`  | UUID | Yes      | Product ID  |

**Response:** `200 OK` — Single product object

**Error:** `404` — `{ "error": { "title": "Not found", "description": "Product not found" } }`

---

### Pricing Profiles

#### `POST /api/pricing-profiles` — Create a pricing profile

**Request Body:**

```json
{
  "name": "VIP Wine Discount",
  "customerName": "Acme Corp",
  "adjustmentType": "dynamic",
  "adjustmentDirection": "decrease",
  "adjustmentValue": 15,
  "productIds": [
    "550e8400-e29b-41d4-a716-446655440000",
    "660e8400-e29b-41d4-a716-446655440001"
  ]
}
```

| Field                 | Type     | Required | Validation                   |
| --------------------- | -------- | -------- | ---------------------------- |
| `name`                | string   | Yes      | 1–100 characters             |
| `customerName`        | string   | Yes      | 1–100 characters             |
| `adjustmentType`      | enum     | Yes      | `"fixed"` or `"dynamic"`     |
| `adjustmentDirection` | enum     | Yes      | `"increase"` or `"decrease"` |
| `adjustmentValue`     | number   | Yes      | Must be positive             |
| `productIds`          | string[] | Yes      | Array of UUIDs, minimum 1    |

**Response:** `201 Created`

```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "name": "VIP Wine Discount",
  "customerName": "Acme Corp",
  "adjustmentType": "dynamic",
  "adjustmentDirection": "decrease",
  "adjustmentValue": 15,
  "createdAt": "2026-05-15T14:00:00.000Z",
  "updatedAt": "2026-05-15T14:00:00.000Z",
  "profileProducts": [
    {
      "id": "...",
      "profileId": "770e8400-...",
      "productId": "550e8400-...",
      "product": {
        "id": "550e8400-...",
        "title": "Penfolds Grange 2019",
        "...": "..."
      }
    }
  ]
}
```

#### `GET /api/pricing-profiles` — List all profiles

| Query Param    | Type   | Required | Description             |
| -------------- | ------ | -------- | ----------------------- |
| `customerName` | string | No       | Filter by customer name |

**Response:** `200 OK` — Array of profiles sorted by `updatedAt` (most recent first)

#### `GET /api/pricing-profiles/:id` — Get profile with computed prices

**Response:** `200 OK` — Profile object plus computed prices:

```json
{
  "id": "770e8400-...",
  "name": "VIP Wine Discount",
  "adjustmentType": "dynamic",
  "adjustmentDirection": "decrease",
  "adjustmentValue": 15,
  "profileProducts": ["..."],
  "computedPrices": [
    {
      "productId": "550e8400-...",
      "productTitle": "Penfolds Grange 2019",
      "sku": "PEN-GRG-2019",
      "basePrice": 850.0,
      "newPrice": 722.5
    }
  ]
}
```

#### `PUT /api/pricing-profiles/:id` — Update a profile

Same body fields as `POST` but all fields are **optional**. If `productIds` is provided, the entire product assignment is replaced.

**Response:** `200 OK` — Updated profile with nested products

#### `DELETE /api/pricing-profiles/:id` — Delete a profile

**Response:** `200 OK`

```json
{
  "message": "Profile deleted successfully"
}
```

---

### Price Resolution

#### `GET /api/resolved-prices` — Resolve prices for all products

| Query Param    | Type   | Required | Description              |
| -------------- | ------ | -------- | ------------------------ |
| `customerName` | string | Yes      | Customer name to resolve |

**Response:** `200 OK`

```json
[
  {
    "productId": "550e8400-...",
    "productTitle": "Penfolds Grange 2019",
    "basePrice": 850.0,
    "newPrice": 722.5,
    "profileId": "770e8400-...",
    "profileName": "VIP Wine Discount"
  },
  {
    "productId": "660e8400-...",
    "productTitle": "Yellow Tail Shiraz",
    "basePrice": 8.99,
    "newPrice": 8.99,
    "profileId": null,
    "profileName": null
  }
]
```

> Products with no applicable profile return `basePrice` as `newPrice` with `null` profile fields.

#### `GET /api/products/:id/resolved-price` — Resolve price for a single product

| Param          | Location | Type   | Required | Description   |
| -------------- | -------- | ------ | -------- | ------------- |
| `id`           | path     | UUID   | Yes      | Product ID    |
| `customerName` | query    | string | Yes      | Customer name |

**Response:** `200 OK` — Single resolved price object

---

### Health & Documentation

| Method | Endpoint    | Description                     |
| ------ | ----------- | ------------------------------- |
| GET    | `/health`   | Health check — returns `200 OK` |
| GET    | `/api-docs` | Swagger UI interactive docs     |

---

## Business Logic

### Price Calculation Engine

The core pricing formula is in `utilities/computePrice.ts`:

| Adjustment Type | Direction | Formula                                                      |
| --------------- | --------- | ------------------------------------------------------------ |
| **Fixed**       | Increase  | `newPrice = basePrice + adjustmentValue`                     |
| **Fixed**       | Decrease  | `newPrice = basePrice - adjustmentValue`                     |
| **Dynamic**     | Increase  | `newPrice = basePrice + (basePrice × adjustmentValue / 100)` |
| **Dynamic**     | Decrease  | `newPrice = basePrice - (basePrice × adjustmentValue / 100)` |

**Post-processing:**

- Result is **rounded to 2 decimal places** (cents)
- Result is **floored at $0.00** (never negative)

```
finalPrice = Math.max(0, Math.round(newPrice * 100) / 100)
```

### Overlapping Profile Precedence

**Rule: Most recently updated profile wins.**

When a product appears in multiple pricing profiles for the same customer:

1. Query all profiles for the given customer that contain the product
2. Sort by `updatedAt` descending (most recent first)
3. Apply **only** the first (most recent) profile's adjustment
4. If no profiles match, return the product's base price unchanged

**Why this rule?** It mirrors real-world pricing behavior where the most recent pricing decision supersedes older ones. It's simple, predictable, and easy for users to understand — the last update always wins.

### Validation Rules

All inputs are validated at the middleware layer before reaching controllers:

- **UUID params**: Must be valid UUID format
- **Profile name**: 1–100 characters
- **Customer name**: 1–100 characters
- **Adjustment value**: Must be a positive number
- **Product IDs**: Array must contain at least 1 valid UUID
- **Adjustment type/direction**: Must match enum values exactly

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- **PostgreSQL** database (local or cloud, e.g., [Neon](https://neon.tech))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/jasmin926211/foboh-task.git
cd foboh-task

# 2. Install all dependencies (root + backend + frontend)
npm install

# 3. Set up environment variables
cp packages/backend/.env.example packages/backend/.env
```

Edit `packages/backend/.env` with your database connection string:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
```

### Database Setup

```bash
# Generate Prisma client
cd packages/backend && npx prisma generate && cd ../..

# Run database migrations
npm run db:migrate

# Seed the database with 5 wine products
npm run db:seed
```

### Run Development Servers

```bash
# Start both backend and frontend concurrently
npm run dev
```

This starts:

| Service           | URL                                             |
| ----------------- | ----------------------------------------------- |
| **Backend API**   | http://localhost:5000                           |
| **Frontend**      | http://localhost:3000                           |
| **Swagger Docs**  | http://localhost:5000/api-docs                  |
| **Health Check**  | http://localhost:5000/health                    |
| **Prisma Studio** | Run `npm run db:studio` → http://localhost:5555 |

> The Vite dev server proxies all `/api` requests to the backend at `localhost:5000`.

---

## Available Scripts

### Root (Monorepo)

| Script                 | Command                         | Description                             |
| ---------------------- | ------------------------------- | --------------------------------------- |
| `npm run dev`          | `concurrently backend frontend` | Start both servers concurrently         |
| `npm run dev:backend`  | `npm run dev -w backend`        | Start backend only                      |
| `npm run dev:frontend` | `npm run dev -w frontend`       | Start frontend only                     |
| `npm run build`        | `tsc && vite build`             | Build both packages for production      |
| `npm run db:migrate`   | `prisma migrate dev`            | Run Prisma database migrations          |
| `npm run db:seed`      | `prisma db seed`                | Seed database with sample wine products |
| `npm run db:studio`    | `prisma studio`                 | Open Prisma Studio GUI                  |
| `npm run db:setup`     | `db:migrate && db:seed`         | Run migrations then seed (full setup)   |

### Backend (`packages/backend`)

| Script                | Command                                    | Description                      |
| --------------------- | ------------------------------------------ | -------------------------------- |
| `npm run dev`         | `nodemon` (ts-node src/server.ts)          | Start dev server with hot reload |
| `npm run build`       | `tsc`                                      | Compile TypeScript to `dist/`    |
| `npm start`           | `node dist/server.js`                      | Start production server          |
| `npm run db:migrate`  | `npx prisma migrate dev`                   | Run database migrations          |
| `npm run db:seed`     | `npx prisma db seed`                       | Seed the database                |
| `npm run db:studio`   | `npx prisma studio`                        | Open Prisma Studio               |
| `npm run db:generate` | `npx prisma generate`                      | Regenerate Prisma client         |
| `npm run format`      | `prettier --write "src/**/*.{ts,js,json}"` | Format all source files          |

### Frontend (`packages/frontend`)

| Script            | Command                | Description                          |
| ----------------- | ---------------------- | ------------------------------------ |
| `npm run dev`     | `vite`                 | Start Vite dev server (port 3000)    |
| `npm run build`   | `tsc -b && vite build` | Type-check then build for production |
| `npm run lint`    | `eslint .`             | Run ESLint on all files              |
| `npm run preview` | `vite preview`         | Preview production build locally     |

---

## Frontend Pages & Components

### Routes

| Path                 | Page             | Description                              |
| -------------------- | ---------------- | ---------------------------------------- |
| `/`                  | Products         | Browse and filter the product catalog    |
| `/profiles`          | Pricing Profiles | List all pricing profiles with filters   |
| `/profiles/new`      | Create Profile   | Form to create a new pricing profile     |
| `/profiles/:id/edit` | Edit Profile     | Form to edit an existing pricing profile |
| `/resolved-prices`   | Resolved Prices  | View computed prices per customer        |

### Layout

- **Header navigation** with links to Products, Pricing Profiles, and Resolved Prices
- **Active link highlighting** using React Router's `useLocation()`
- **Responsive container** with `max-w-7xl` width constraint
- **Content outlet** renders matched route component via `<Outlet />`

### UI Component Library (shadcn/ui)

| Component   | File                          | Description                                                                 |
| ----------- | ----------------------------- | --------------------------------------------------------------------------- |
| `Button`    | `components/ui/button.tsx`    | 6 variants (default, outline, secondary, ghost, destructive, link), 7 sizes |
| `Input`     | `components/ui/input.tsx`     | Text input with focus/invalid states                                        |
| `Select`    | `components/ui/select.tsx`    | Dropdown with scrollable options                                            |
| `Table`     | `components/ui/table.tsx`     | Full table components with hover states                                     |
| `Card`      | `components/ui/card.tsx`      | Container with header, content, footer                                      |
| `Dialog`    | `components/ui/dialog.tsx`    | Modal popup with backdrop blur                                              |
| `Checkbox`  | `components/ui/checkbox.tsx`  | Accessible checkbox with check icon                                         |
| `Badge`     | `components/ui/badge.tsx`     | Inline label with 6 variants                                                |
| `Separator` | `components/ui/separator.tsx` | Horizontal/vertical divider                                                 |

### API Client Layer

| File                     | Functions                                                                                                               |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `api/client.ts`          | Axios instance with `/api` base URL                                                                                     |
| `api/products.ts`        | `fetchProducts(params?)`, `fetchProduct(id)`                                                                            |
| `api/pricingProfiles.ts` | `fetchProfiles()`, `fetchProfile(id)`, `createProfile()`, `updateProfile()`, `deleteProfile()`, `fetchResolvedPrices()` |

### TypeScript Types

```typescript
Product; // id, title, sku, category, subCategory, segment, brand, basePrice
PricingProfile; // id, name, customerName, adjustmentType, adjustmentDirection, adjustmentValue, profileProducts
ProfileProduct; // id, profileId, productId, product?
ComputedPrice; // productId, productTitle, sku, basePrice, newPrice
ResolvedPrice; // productId, productTitle, basePrice, newPrice, profileId?, profileName?
CreateProfilePayload; // name, customerName, adjustmentType, adjustmentDirection, adjustmentValue, productIds[]
```

---

## Environment Variables

### Backend (`packages/backend/.env`)

| Variable       | Required | Default       | Description                                      |
| -------------- | -------- | ------------- | ------------------------------------------------ |
| `PORT`         | No       | `5000`        | Port the Express server listens on               |
| `NODE_ENV`     | No       | `development` | Environment mode (`development` / `production`)  |
| `DATABASE_URL` | Yes      | —             | PostgreSQL connection string (e.g., Neon DB URL) |

**Example `.env` file:**

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@ep-cool-name-123456.us-east-2.aws.neon.tech/foboh?sslmode=require"
```

### Frontend

The frontend uses Vite's built-in dev server proxy — no environment variables required. All `/api` requests are proxied to `http://localhost:5000` during development.

---
