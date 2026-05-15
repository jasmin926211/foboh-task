# FOBOH — Customer-Specific Pricing

A fullstack application for managing customer-specific pricing profiles for food and beverage suppliers. Built as part of the FOBOH technical assessment.

## Tech Stack

### Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js 5
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
│   │   └── src/
│   │       ├── config/                # Environment configuration
│   │       ├── controllers/           # Route handlers (thin layer)
│   │       │   ├── product/           # GET /products, GET /products/:id
│   │       │   └── pricingProfile/    # CRUD + resolver endpoints
│   │       ├── services/              # Business logic layer
│   │       │   ├── product/           # Product queries with search/filter
│   │       │   └── pricingProfile/    # Pricing logic + overlapping resolver
│   │       ├── policies/              # Zod validation schemas
│   │       │   ├── product/
│   │       │   └── pricingProfile/
│   │       ├── middlewares/           # Express middlewares
│   │       │   ├── errorHandling.ts   # Global error handler
│   │       │   ├── requestLogger.ts   # HTTP request/response logging
│   │       │   ├── resourceNotFound.ts # 404 handler
│   │       │   └── validateRequest.ts  # Zod validation middleware
│   │       ├── utilities/
│   │       │   ├── exceptions/        # Custom HTTP exception classes
│   │       │   ├── computePrice.ts    # Price calculation logic
│   │       │   └── logger.ts          # Winston logger instance
│   │       ├── prisma/
│   │       │   ├── schema.prisma      # Database schema
│   │       │   ├── client.ts          # Prisma client singleton
│   │       │   ├── seed.ts            # Seed 5 wine products
│   │       │   └── migrations/        # Database migrations
│   │       ├── swagger.ts             # OpenAPI configuration
│   │       └── server.ts              # Express entry point
│   └── frontend/
│       └── src/
│           ├── api/                   # Axios API client functions
│           ├── components/
│           │   ├── layout/            # Layout with navigation
│           │   └── ui/                # shadcn/ui components
│           ├── types/                 # TypeScript interfaces
│           ├── App.tsx                # Root with routing + providers
│           └── main.tsx               # Entry point
├── package.json                       # Root workspace config
└── README.md
```

## Architecture

The backend follows a **Controller → Service → Model** layered architecture:

- **Controllers** — Thin request/response handlers. Extract params, call service, return response. Entry/exit logging on every request.
- **Services** — Business logic layer. Database operations via Prisma ORM. Throws custom exceptions on failure.
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
npm init -y
# Configured workspaces: ["packages/backend", "packages/frontend"]
```

### 2. Set Up the Backend

```bash
cd packages/backend
npm install express cors zod winston swagger-jsdoc swagger-ui-express @prisma/client dotenv
npm install -D typescript ts-node nodemon prisma @types/node @types/express @types/cors
```

Configured TypeScript (`tsconfig.json`) targeting ES2022 with strict mode enabled. Added `nodemon.json` for auto-reload during development.

### 3. Database with Prisma + Neon PostgreSQL

```bash
npx prisma init --datasource-provider postgresql
```

Defined three models in `schema.prisma`:
- **Product** — Wine products with title, SKU, category, segment, brand, base price
- **PricingProfile** — Customer pricing rules with adjustment type/direction/value
- **ProfileProduct** — Many-to-many join table linking profiles to products

Applied migration and seeded 5 Australian wine products.

### 4. Built the Layered Backend Architecture

Structured the backend following a module-based Controller → Service → Model pattern:

- Each module (`product`, `pricingProfile`) has its own controller, service, and policy directory
- Controllers are thin — they extract request data, call the service, and return the response
- Services contain all business logic and database operations
- Policies define Zod schemas for request validation, applied via `validateRequest` middleware

### 5. Set Up the Frontend

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install @tanstack/react-query react-router-dom axios sonner
npx shadcn@latest init -d
npx shadcn@latest add button input table checkbox select badge card dialog separator
```

Configured Vite proxy to forward `/api` requests to the backend. Set up TanStack Query for server state management and React Router for navigation.

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

### Why This Rule?

This mirrors real-world pricing behavior where the most recent pricing decision supersedes older ones. It's simple, predictable, and easy for users to understand — the last update always wins.

### Resolver Endpoint

```
GET /api/resolved-prices?customerName=Acme Corp
```

Returns the final computed price for every product, applying the winning profile for each. Products with no applicable profile return the base price.

### Resolver Logic

```
1. Find all profiles for the given customer
2. For each product, find profiles that include it
3. Sort applicable profiles by updatedAt (descending)
4. Apply the most recent profile's adjustment
5. Return computed price (or base price if no profile applies)
```

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9

### Setup

```bash
# Clone the repository
git clone https://github.com/jasmin926211/foboh-task.git
cd foboh-task

# Install all dependencies
npm install

# Set up environment variables
cp packages/backend/.env.example packages/backend/.env
# Edit .env with your DATABASE_URL

# Generate Prisma client
cd packages/backend && npx prisma generate && cd ../..

# Run database migrations
npm run db:migrate

# Seed the database with 5 wine products
npm run db:seed

# Start development servers (backend + frontend)
npm run dev
```

This starts:
- **Backend** at `http://localhost:5000`
- **Frontend** at `http://localhost:3000`
- **Swagger Docs** at `http://localhost:5000/api-docs`
- **Health Check** at `http://localhost:5000/health`

## API Endpoints

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products (filter: `search`, `subCategory`, `segment`, `brand`) |
| GET | `/api/products/:id` | Get a single product by ID |

### Pricing Profiles

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/pricing-profiles` | Create a pricing profile |
| GET | `/api/pricing-profiles` | List all profiles (filter: `customerName`) |
| GET | `/api/pricing-profiles/:id` | Get profile with computed prices |
| PUT | `/api/pricing-profiles/:id` | Update a pricing profile |
| DELETE | `/api/pricing-profiles/:id` | Delete a pricing profile |

### Price Resolver

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/resolved-prices?customerName=X` | Get resolved prices for all products for a customer |
| GET | `/api/products/:id/resolved-price?customerName=X` | Get resolved price for a single product |

## Seed Data

| Product | SKU | Category | Segment | Brand | Base Price |
|---------|-----|----------|---------|-------|-----------|
| Penfolds Grange 2019 | PEN-GRG-2019 | Red | Premium | Penfolds | $850.00 |
| Yellow Tail Shiraz | YT-SHZ-001 | Red | Budget | Yellow Tail | $8.99 |
| Cloudy Bay Sauvignon Blanc | CB-SB-2022 | White | Premium | Cloudy Bay | $28.50 |
| Moet & Chandon Imperial | MC-IMP-NV | Sparkling | Premium | Moet & Chandon | $65.00 |
| Whispering Hills Rose | WH-RSE-2023 | Rose | Standard | Whispering Hills | $14.99 |
