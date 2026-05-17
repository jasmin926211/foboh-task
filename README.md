## Setup to run project

```bash
git clone https://github.com/jasmin926211/foboh-task.git

cd foboh-task
git checkout development
npm install
```

create one .env file in the `packages/backend/.env`

```env
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
```

Then run:

```bash
npm run dev               # backend port is (:5000) and frontend port is (:3000)
```

---

## How pricing is resolved

When multiple profiles match the same product for a customer, the system picks one winner using three rules:

1. **Most specific wins.** Customer-level beats group-level beats global. Selected products beats all products.
2. **Same specificity? Lowest price wins.** Gives the customer the best deal among equally relevant profiles.
3. **Floor protection.** If the winning price drops below `costPrice × (1 + minMargin%)`, it's clamped up to protect margin.

| Tier | Target          | Scope             |
| ---- | --------------- | ----------------- |
| 1    | Single customer | Selected products |
| 2    | Single customer | All products      |
| 3    | Customer group  | Selected products |
| 4    | Customer group  | All products      |
| 5    | Everyone        | Selected products |
| 6    | Everyone        | All products      |

Only published profiles compete. Drafts show in the waterfall as `rejected` but never affect the price.

**Example:** Bondi Cellars is in "Independent Retailers" and "VIP" groups. For Koyama Methode Brut Nature NV, three profiles match a custom $95 price for Bondi (Tier 1), $15 off for VIPs (Tier 3), and 10% off for Independent Retailers (Tier 4). **Tier 1 wins → $95.00.** The direct customer deal isn't overridden by group promos.

**Why not "lowest price always wins"?** A negotiated deal with a specific customer would get silently undercut by broad group discounts. **Why not "most recent wins"?** Editing any profile would unpredictably change winners. Specificity is stable.

The resolver (`GET /resolved-prices?customerId=...`) returns the final price, winning profile, tier, a full waterfall audit trail with verdicts, floor protection status, and margin insight warnings.

---

## Trade-offs and What I'd Do Next

### Design decisions

- **Soft delete over hard delete.** Deleting a product sets `deletedAt` rather than removing the row. Junction rows in `profileProducts` are cleaned up immediately, but the product data is preserved for historical reference. The cost is every product query must filter `deletedAt: null`.

- **Live query for "All Products" scope.** Profiles with `scope: 'all'` don't store junction rows they query all active products at resolution time. New products automatically get pricing, deleted products automatically disappear. The alternative (storing a row per product) would need a sync job every time the catalog changes.

- **Fixed 6-tier hierarchy, not configurable priority.** The tier order is hardcoded: customer beats group, group beats global, selected beats all. A user can't override this (e.g., make a group profile beat a customer profile). This is intentional it keeps resolution predictable and removes an entire class of "why did this price change?" questions.

- **Floor price is a hard clamp.** If `costPrice` and `minMarginPercent` are set, the floor (`costPrice × (1 + margin/100)`) can never be bypassed. A supplier who wants to run a loss-leader must clear the margin on the product itself. This prevents accidental below-cost pricing but removes flexibility for intentional loss strategies.

- **First-created wins same-tier ties.** When two profiles share a tier, the one with the earlier `createdAt` wins. No extra "priority" column needed, but users can't reorder priority without recreating profiles.

- **Full waterfall in every response.** The resolver returns every profile evaluated with its verdict and reason. This makes the response payload larger (N products × M profiles entries), but gives complete audit transparency. For a catalog of 50 products and 10 profiles, this is ~500 entries per request acceptable at this scale.

### What I'd do next

1. **Authentication and role-based access**
   Add a JWT-based auth flow with two roles supplier and customer so suppliers manage their own profiles and customers can only see prices that apply to them.

2. **Profile versioning**
   Need to save version every profile on save. Today, editing a profile (or editing an underlying product) silently changes the price of historical orders, which breaks invoice reconciliation and dispute resolution. Versioning means each order is priced against the profile snapshot that was live at the time it was placed.

3. **Configurable margin divergence threshold**
   The margin-insight warning currently fires at a hardcoded 10% divergence between a winning custom price and the next-best group rate. Different suppliers run on different margins, so this should be a per-supplier setting a bulk-rice supplier might want 3%, a fine-wine supplier might want 20%.

4. **Shadow-mode preview on save**
   Before a new or edited profile is committed, run it against the last 90 days of orders and return an impact summary: how many customers would be affected, the projected revenue delta, and any existing profiles that would be silently overridden. The compute is cheap it's just the existing resolver replayed across recent orders with the new profile added and it stops suppliers from shipping pricing changes blind.

5. **Profile staleness detection**
   A custom price set today reflects today's costs, today's base price, and today's group rates but all three keep moving. In older profile, a once-fair custom price can be lower than the customer's current group rate and below cost, and nobody notices. I'd add a nightly job that flags profiles where the last edit is over six months old and the resolved price now diverges significantly from the current best group rate or breaches the per-product margin floor. Suppliers receive a weekly digest rather than per-profile alerts, so they stay informed without being nagged.

## AI usage

---

I have taken help and used Claude to reach the final output. I have provided my whole transcript. When I started the implementation the first time, AI gave me a simple solution without anything extraordinary. First he gave me that last added customer in whichever profile it wins, but I have some idea already that in the market there are many companies doing business like this. One solution AI suggested is more specific, such as scoring each profile by how narrowly it targets. Most specific (exact customer + exact product) beats less specific (group + category), but this doesn't help the customer when a broader profile would actually be cheaper. AI proposed first that when any customer has multiple existing pricing profiles. It's directly decided by the cheapest price or expensive price winning, but in this way many times businesses will face loss or compromise their margins silently. and special customers of the supplier negotiated prices overridden by this method. So this will not be good for any businesses. Then I have done the customer assignment step separately, like for individual customers, customer groups, and all customers. Doing this, I got a different intital solutions "Just return the final price" (no waterfall), "Last updated wins" (recency-based), "Lowest price always wins" (flat comparison), which I have implemented.

---

Extra:
Tests: `npm run test -w packages/backend`
API docs: `http://localhost:5000/api-docs`
