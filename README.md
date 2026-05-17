# FOBOH Pricing Profile Challenge

A fullstack app where food & beverage suppliers create customer-specific pricing profiles, assign them to products, and resolve the final price when multiple profiles overlap.

**Stack:** React 19 + Vite + Tailwind + shadcn/ui | Node.js + Express + Prisma + PostgreSQL (Neon) | TypeScript end-to-end

---

## Setup

```bash
git clone https://github.com/jasmin926211/foboh-task.git
cd foboh-task
npm install
```

Create `packages/backend/.env`:

```env
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
```

Then run:

```bash
npm run db:migrate        # run Prisma migrations
npm run db:seed           # seed products + demo profiles
npm run dev               # starts backend (:5000) + frontend (:3000)
```

Tests: `npm run test -w packages/backend`
API docs: `http://localhost:5000/api-docs`

---

## Precedence Rule (the core decision)

When a customer has multiple pricing profiles that apply to the same product, the system needs a single, deterministic answer. Here's how it works:

**Step 1 -Only published profiles compete.** Draft profiles are excluded from winner selection entirely. They still appear in the waterfall audit trail (marked `rejected`) so the supplier can see what _would_ apply if published, but they never affect the price.

**Step 2 -Most specific scope wins (6-tier hierarchy).** A profile targeting a specific customer is always more relevant than one targeting their group, which is always more relevant than a global profile. Within each level, "selected products" is more specific than "all products":

| Tier | Who             | Products          | Example                                      |
| ---- | --------------- | ----------------- | -------------------------------------------- |
| 1    | Single customer | Selected products | "Bondi Cellars gets $95 on Koyama Methode"   |
| 2    | Single customer | All products      | "Bondi Cellars gets 5% off everything"       |
| 3    | Customer group  | Selected products | "$15 off Sparkling for VIPs"                 |
| 4    | Customer group  | All products      | "10% off all Wine for Independent Retailers" |
| 5    | Everyone        | Selected products | "$2 off these three SKUs"                    |
| 6    | Everyone        | All products      | "5% off the entire catalog"                  |

A Tier 1 profile always beats Tier 3, regardless of which produces a lower price. Specificity wins because in wholesale, a deal negotiated directly with a customer should never be silently overridden by a broad group promotion.

**Step 3 -Same tier? Lowest price wins.** If two published profiles land in the same tier (e.g. a customer belongs to two groups that both have Tier 4 profiles), the one producing the lower computed price is selected. This gives the customer the best available deal within that specificity level, which matches commercial expectation: when you're eligible for two equivalent promotions, you get the better one.

**Step 4 -Floor protection.** If a product has a cost price and minimum margin %, the system computes a floor: `costPrice * (1 + minMarginPercent / 100)`. If the winning price falls below this floor, it's clamped up. This prevents any discount from eroding the supplier's minimum margin, no matter how aggressive the profile.

### The scenario from the brief

Bondi Cellars is in both "Independent Retailers" and "VIP" groups. They order Koyama Methode Brut Nature NV. Three profiles match:

- **Profile C** (Tier 1 -customer + selected): Custom $95 on this exact product for Bondi Cellars
- **Profile B** (Tier 3 -group + selected): $15 off Sparkling for VIPs
- **Profile A** (Tier 4 -group + all): 10% off all Wine for Independent Retailers

**Result: $95.00** -Profile C wins because Tier 1 beats Tier 3 and 4. The supplier negotiated a specific price with Bondi Cellars; group promos don't override it.

For a non-Sparkling product like High Garden Pinot Noir, only Profile A matches (Tier 4), so the price is $279.06 - 10% = **$251.15**.

### Why this rule and not alternatives

- **Why not "lowest price always wins"?** Because a supplier who negotiates a $95 deal with Bondi Cellars doesn't want a broad group promo accidentally undercutting it. Specificity-first means direct customer deals are always honoured.
- **Why not "most recent profile wins"?** Recency is fragile. Editing an old profile would silently change which one wins. Specificity is stable and predictable.
- **Why lowest-price as the tiebreaker (not highest)?** Within the same tier, profiles are equally "relevant" -neither is more specific. Choosing the lower price gives the customer the best deal, which is the commercial default in wholesale. A supplier who wants to override this can always create a more specific profile (move up a tier).

### What the resolver returns

The resolver endpoint (`GET /api/resolved-prices?customerId=...`) returns, for each product:

- The **final price** and which profile produced it
- The **tier** and human-readable tier label
- A **waterfall** -every profile evaluated, in order, with verdict (`won`/`lost`/`rejected`) and the reason
- **Floor protection** status (whether the floor was applied and the before/after prices)
- **Margin insight** -flags when the winning price diverges >10% from the average of same-tier profiles

This gives the supplier full transparency into _why_ each product costs what it does.

---

## Trade-offs and What I'd Do Next

**Specificity over recency is a deliberate choice.** It means you can't override a customer-level profile with a group promo without editing or removing the customer profile first. I chose this because in wholesale, direct customer agreements should be stable -a marketing team running a group promo shouldn't accidentally break a negotiated deal. The trade-off is less flexibility for "last one in wins" workflows, but those are harder to reason about and debug.

**The N+1 in `resolveAllPrices` is the main scaling concern.** Each product issues a separate `resolvePrice` call with its own DB queries. For 5 products in the demo, this is fine. At hundreds of products, I'd refactor to fetch all applicable profiles in one query, then resolve in-memory -a single pass instead of N round-trips. I left it as-is because the per-product approach is easier to read and test, and optimizing it wasn't worth the complexity for this scope.

**What I'd build next:** Expanded test coverage for the resolution logic (edge cases: no profiles, all drafts, multi-group overlaps, floor clamping), Redis caching of resolved prices with invalidation on profile changes, JWT auth with role-based access, and profile expiry dates so promos auto-deactivate. The margin divergence threshold (currently 10%) should also be supplier-configurable rather than hardcoded.
