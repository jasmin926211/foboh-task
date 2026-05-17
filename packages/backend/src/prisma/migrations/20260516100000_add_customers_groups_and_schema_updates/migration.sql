-- Add 'custom' to AdjustmentType enum (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'custom' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'AdjustmentType')) THEN
    ALTER TYPE "AdjustmentType" ADD VALUE 'custom';
  END IF;
END $$;

-- CreateTable: customers (idempotent)
CREATE TABLE IF NOT EXISTS "customers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "customers_name_key" ON "customers"("name");

-- CreateTable: customer_groups (idempotent)
CREATE TABLE IF NOT EXISTS "customer_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_groups_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "customer_groups_name_key" ON "customer_groups"("name");

-- CreateTable: customer_group_memberships (idempotent)
CREATE TABLE IF NOT EXISTS "customer_group_memberships" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "customer_group_id" TEXT NOT NULL,

    CONSTRAINT "customer_group_memberships_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "customer_group_memberships_customer_id_customer_group_id_key" ON "customer_group_memberships"("customer_id", "customer_group_id");

-- AddForeignKeys for customer_group_memberships (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'customer_group_memberships_customer_id_fkey') THEN
    ALTER TABLE "customer_group_memberships" ADD CONSTRAINT "customer_group_memberships_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'customer_group_memberships_customer_group_id_fkey') THEN
    ALTER TABLE "customer_group_memberships" ADD CONSTRAINT "customer_group_memberships_customer_group_id_fkey" FOREIGN KEY ("customer_group_id") REFERENCES "customer_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AlterTable: products -add cost_price and min_margin_percent (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'cost_price') THEN
    ALTER TABLE "products" ADD COLUMN "cost_price" DOUBLE PRECISION;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'min_margin_percent') THEN
    ALTER TABLE "products" ADD COLUMN "min_margin_percent" DOUBLE PRECISION;
  END IF;
END $$;

-- AlterTable: pricing_profiles -drop customer_name if exists, add customer_id and customer_group_id
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pricing_profiles' AND column_name = 'customer_name') THEN
    ALTER TABLE "pricing_profiles" DROP COLUMN "customer_name";
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pricing_profiles' AND column_name = 'customer_id') THEN
    ALTER TABLE "pricing_profiles" ADD COLUMN "customer_id" TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pricing_profiles' AND column_name = 'customer_group_id') THEN
    ALTER TABLE "pricing_profiles" ADD COLUMN "customer_group_id" TEXT;
  END IF;
END $$;

-- Make adjustment_direction and adjustment_value nullable
ALTER TABLE "pricing_profiles" ALTER COLUMN "adjustment_direction" DROP NOT NULL;
ALTER TABLE "pricing_profiles" ALTER COLUMN "adjustment_value" DROP NOT NULL;

-- AddForeignKeys for pricing_profiles (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'pricing_profiles_customer_id_fkey') THEN
    ALTER TABLE "pricing_profiles" ADD CONSTRAINT "pricing_profiles_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'pricing_profiles_customer_group_id_fkey') THEN
    ALTER TABLE "pricing_profiles" ADD CONSTRAINT "pricing_profiles_customer_group_id_fkey" FOREIGN KEY ("customer_group_id") REFERENCES "customer_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- AlterTable: profile_products -add custom_price (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profile_products' AND column_name = 'custom_price') THEN
    ALTER TABLE "profile_products" ADD COLUMN "custom_price" DOUBLE PRECISION;
  END IF;
END $$;
