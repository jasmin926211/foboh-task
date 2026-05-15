-- CreateEnum
CREATE TYPE "AdjustmentType" AS ENUM ('fixed', 'dynamic');

-- CreateEnum
CREATE TYPE "AdjustmentDirection" AS ENUM ('increase', 'decrease');

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Wine',
    "sub_category" TEXT NOT NULL,
    "segment" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "base_price" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_profiles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL,
    "adjustment_type" "AdjustmentType" NOT NULL,
    "adjustment_direction" "AdjustmentDirection" NOT NULL,
    "adjustment_value" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_products" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,

    CONSTRAINT "profile_products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "profile_products_profile_id_product_id_key" ON "profile_products"("profile_id", "product_id");

-- AddForeignKey
ALTER TABLE "profile_products" ADD CONSTRAINT "profile_products_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "pricing_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_products" ADD CONSTRAINT "profile_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
