# FOBOH — Customer-Specific Pricing Platform

A fullstack monorepo for managing **customer-specific pricing profiles** for food and beverage suppliers. Suppliers create pricing rules per customer or customer group, assign them to products, and resolve final prices using a 6-tier specificity system.

Built as part of the **FOBOH technical assessment**.

---

## Tech Stack

- **Backend:** Node.js, Express, TypeScript, Prisma, PostgreSQL (Neon), Zod
- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query
- **Monorepo:** npm workspaces + concurrently

---

## Prerequisites

- Node.js >= 18
- npm >= 9
- A PostgreSQL database (local or [Neon](https://neon.tech))

---

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/jasmin926211/foboh-task.git
cd foboh-task
npm install
```

### 2. Configure environment

```bash
cp packages/backend/.env.example packages/backend/.env
```

Edit `packages/backend/.env` and set your database URL:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
```

### 3. Set up the database

```bash
npm run db:setup   # runs migrations + seeds products, customers, groups & demo profiles
```

### 4. Run the app

```bash
npm run dev        # starts backend + frontend together
```

| Service     | URL                            |
| ----------- | ------------------------------ |
| Frontend    | http://localhost:3000          |
| Backend API | http://localhost:5000          |
| Swagger UI  | http://localhost:5000/api-docs |

### 5. Run tests

```bash
npm run test -w packages/backend
```

---

## Seed Data

The seed script creates:

- **5 products** (from the task specification):
  - High Garden Pinot Noir 2021 — $279.06
  - Koyama Methode Brut Nature NV — $120.00
  - Koyama Riesling 2018 — $215.04
  - Koyama Tussock Riesling 2019 — $215.04
  - Lacourte-Godbillon Brut Cru NV — $409.32

- **1 customer:** Bondi Cellars (member of both groups below)
- **2 customer groups:** Independent Retailers, VIP
- **3 overlapping pricing profiles** (see Worked Example below)

---

## Main Flow

1. **Browse products** at `/products` — the supplier product catalog.
2. **Create a pricing profile** at `/pricing/setup` — pick a customer or group, choose adjustment type (fixed/dynamic/custom) and direction (increase/decrease), and assign products.
3. **Resolve prices** at `/resolved-prices` — select a customer to see their final price for every product, with full transparency into which profile won and why.

---

## Price Resolution — 6-Tier Specificity

When multiple profiles apply to the same product for a customer, the system uses a **6-tier specificity hierarchy** (most specific wins):

| Tier | Scope                             | Description                                                                |
| ---- | --------------------------------- | -------------------------------------------------------------------------- |
| 1    | Customer + Selected Products      | A profile targeting this exact customer for specific products              |
| 2    | Customer + All Products           | A profile targeting this exact customer for all products                   |
| 3    | Group + Selected Products         | A profile targeting a group the customer belongs to, for specific products |
| 4    | Group + All Products              | A profile targeting a group the customer belongs to, for all products      |
| 5    | All Customers + Selected Products | A global profile for specific products                                     |
| 6    | All Customers + All Products      | A global profile for all products                                          |

**Tie-breaking:** If two profiles are in the same tier, the **lowest computed price wins** (best price for the customer). Only **published** profiles participate in the winner selection; draft profiles appear in the waterfall for visibility but are marked as `rejected`.

### Price Formulas

- **Fixed:** `basePrice ± adjustmentValue`
- **Dynamic:** `basePrice ± (basePrice × adjustmentValue / 100)`
- **Custom:** An exact per-product price (stored on the profile-product junction)

Results are rounded to 2 decimal places. Negative prices are **rejected** at creation/update time with an HTTP 422 response — the system prevents them from being saved.

### Floor Price Protection

Each product can optionally have a **cost price** and **minimum margin percentage**. When both are set, the system computes a floor:

```
floorPrice = costPrice × (1 + minMarginPercent / 100)
```

If the winning profile's computed price falls below this floor, the final price is **clamped up** to the floor. This prevents any discount — no matter how aggressive — from eroding the supplier's minimum margin.

### Waterfall — Full Audit Trail

Every price resolution returns a **waterfall array** — a single ordered list of _all_ profiles that were evaluated, each with:

| Field            | Description                                                                     |
| ---------------- | ------------------------------------------------------------------------------- |
| `position`       | Sequential rank (1 = winner)                                                    |
| `profileName`    | The profile's name                                                              |
| `tier` / `tierLabel` | Specificity tier (1–6) and human-readable label                             |
| `computedPrice`  | The price this profile would produce                                            |
| `priceAfterFloor`| Floor-clamped price (only on the winner, when floor was triggered)               |
| `verdict`        | `won`, `lost`, or `rejected`                                                    |
| `reason`         | Why this entry won or lost (e.g. "Same tier (4) but higher price than 'X'")     |

Verdicts:
- **`won`** — the single winning profile (most specific tier, lowest price within that tier)
- **`lost`** — a published profile beaten by a higher-specificity tier or lower price at the same tier
- **`rejected`** — a draft profile (included for transparency, but never wins)

### Margin Insight — Proactive Alerting

When **2+ published profiles share the same tier** as the winner, the system computes margin insight:

- Calculates the **average price** across all same-tier published entries
- Flags when the winning price **diverges more than 10%** from that average
- Returns a human-readable message: _"Winning price is X% below the average of same-tier profiles ($Y.YY). Review floor protection settings."_

This helps suppliers catch misconfigured profiles before they impact revenue.

---

## API Response Structure

Each resolved price returns the following shape:

```json
{
  "productId": "...",
  "productTitle": "Shiraz 2022",
  "basePrice": 25.00,
  "finalPrice": 18.00,
  "appliedProfile": { "id": "...", "name": "VIP $8 Off" },
  "tier": 4,
  "tierLabel": "Group + All Products",
  "reason": "Applied profile 'VIP $8 Off' (Tier 4 — Group + All Products). 2 profiles matched. Floor applied: ...",
  "costPrice": 15.00,
  "minMarginPercent": 20,
  "floorPrice": 18.00,
  "floorApplied": true,
  "waterfall": [
    { "position": 1, "profileName": "VIP $8 Off", "tier": 4, "computedPrice": 17.00, "priceAfterFloor": 18.00, "verdict": "won", "reason": "..." },
    { "position": 2, "profileName": "Hotels 10% Off", "tier": 4, "computedPrice": 22.50, "priceAfterFloor": null, "verdict": "lost", "reason": "..." }
  ],
  "marginInsight": {
    "triggered": true,
    "winningPrice": 18.00,
    "sameTierAvgPrice": 19.75,
    "divergencePercent": -8.86,
    "message": "Winning price is 8.86% below the average of same-tier profiles ($19.75). Review floor protection settings."
  }
}
```

---

## Worked Example (Seeded Data)

After running `npm run db:seed`, select **Bondi Cellars** on the Resolved Prices page. Three published profiles overlap:

| Profile                        | Rule                               | Target                      | Tier                    |
| ------------------------------ | ---------------------------------- | --------------------------- | ----------------------- |
| Wine Discount — Independents   | 10% decrease on all products       | Independent Retailers group | 4 (Group + All)         |
| Sparkling Promo — VIPs         | $15 decrease on selected Sparkling | VIP group                   | 3 (Group + Selected)    |
| Bondi Cellars — Koyama Special | Custom $95 on Koyama Methode       | Bondi Cellars customer      | 1 (Customer + Selected) |

**Resolved prices for Bondi Cellars:**

| Product                        | Base    | Winner          | Tier | Final Price | Calculation                                        |
| ------------------------------ | ------- | --------------- | ---- | ----------- | -------------------------------------------------- |
| Koyama Methode Brut Nature NV  | $120.00 | Koyama Special  | 1    | **$95.00**  | Custom price (most specific — customer + selected) |
| Lacourte-Godbillon Brut Cru NV | $409.32 | Sparkling Promo | 3    | **$394.32** | $409.32 − $15 (group + selected beats group + all) |
| High Garden Pinot Noir 2021    | $279.06 | Wine Discount   | 4    | **$251.15** | $279.06 − 10% (only matching profile)              |
| Koyama Riesling 2018           | $215.04 | Wine Discount   | 4    | **$193.54** | $215.04 − 10%                                      |
| Koyama Tussock Riesling 2019   | $215.04 | Wine Discount   | 4    | **$193.54** | $215.04 − 10%                                      |

Each row also includes a full **waterfall** showing every profile considered (with verdict and reason) and a **marginInsight** object. Expand any row in the UI to see the complete audit trail.

### Multi-Group Overlap Example

If a customer belongs to **two groups** that each have a pricing profile at the same tier, the system automatically picks the **lowest price** (best deal for the customer) and clamps it to the floor if needed:

1. Both profiles compete at the same tier (e.g. Tier 4)
2. The profile producing the lower computed price wins
3. If the winning price falls below the floor → clamped to floor price
4. The waterfall shows both entries with clear reasons for who won and why

The supplier can always override this by creating a more specific profile (Tier 1–2) for that customer.

---

## Trade-offs

- **Specificity + best-price over recency:** The 6-tier system means a customer-level profile always beats a group-level one, regardless of update time. Within the same tier, the lowest price wins (not the most recently updated). This is more predictable for suppliers and gives customers the best available deal, but means you can't override a customer-level rule with a group promo without editing or removing the customer profile.

- **PostgreSQL (Neon) over SQLite:** PostgreSQL gives case-insensitive queries (`mode: 'insensitive'`), proper UUIDs, and production-readiness. The tradeoff is requiring a running database — Neon's serverless tier keeps this zero-cost for the demo.

- **Prisma N+1 in `resolveAllPrices`:** Each product issues a separate `resolvePrice` call. For 5 products this is fine. At scale (hundreds of products), this should be refactored into a single query that fetches all applicable profiles up front, then resolves in-memory.

- **No authentication:** This is a time-scoped demo. All endpoints are open. In production, every route would sit behind auth middleware.

- **Frontend state in component:** The `SetProductPricing` component manages significant local state. For this scope it's pragmatic; a larger app would benefit from a form library or state machine.

---

## What I'd Do Next

- **Unit + integration tests:** Expand beyond `computePrice` tests to cover the full resolution logic, edge cases (no profiles, all drafts, conflicting tiers), and API endpoint integration tests.
- **Caching:** Cache resolved prices per customer with invalidation on profile create/update/delete. Redis or in-memory with TTL.
- **Batch resolution:** Rewrite `resolveAllPrices` to fetch all applicable profiles in one query, then resolve in-memory — eliminates the N+1 pattern.
- **Auth & RBAC:** JWT-based authentication with role-based access (admin creates profiles, viewer can only resolve prices).
- **Audit logging:** Track who changed which profile and when, with a changelog table.
- **Profile expiry dates:** Add optional `expiresAt` field so promotional profiles auto-deactivate.
- **Bulk import/export:** CSV upload for products and pricing rules.
- **Configurable margin threshold:** Allow suppliers to set their own divergence threshold (currently hardcoded at 10%) for margin insight alerts.

---

## Useful Scripts

| Command                            | What it does                       |
| ---------------------------------- | ---------------------------------- |
| `npm run dev`                      | Start backend + frontend           |
| `npm run db:migrate`               | Run Prisma migrations              |
| `npm run db:seed`                  | Seed products + demo scenario      |
| `npm run db:studio`                | Open Prisma Studio at `:5555`      |
| `npm run build`                    | Build both packages for production |
| `npm run test -w packages/backend` | Run backend unit tests             |

---

## Project Structure

```
foboh/
├── packages/
│   ├── backend/    # Express + Prisma + Zod API (port 5000)
│   └── frontend/   # React + Vite app (port 3000)
└── package.json    # npm workspaces root
```

Full API documentation is available in Swagger UI at `/api-docs`.
