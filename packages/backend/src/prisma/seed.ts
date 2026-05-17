import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const products = [
  {
    title: 'High Garden Pinot Noir 2021',
    sku: 'HGVPIN216',
    category: 'Wine',
    subCategory: 'Red',
    segment: 'Premium',
    brand: 'High Garden',
    basePrice: 279.06
  },
  {
    title: 'Koyama Methode Brut Nature NV',
    sku: 'KOYBRUNV6',
    category: 'Wine',
    subCategory: 'Sparkling',
    segment: 'Premium',
    brand: 'Koyama Wines',
    basePrice: 120.0
  },
  {
    title: 'Koyama Riesling 2018',
    sku: 'KOYNR1837',
    category: 'Wine',
    subCategory: 'Port/Dessert',
    segment: 'Premium',
    brand: 'Koyama Wines',
    basePrice: 215.04
  },
  {
    title: 'Koyama Tussock Riesling 2019',
    sku: 'KOYRIE19',
    category: 'Wine',
    subCategory: 'White',
    segment: 'Premium',
    brand: 'Koyama Wines',
    basePrice: 215.04
  },
  {
    title: 'Lacourte-Godbillon Brut Cru NV',
    sku: 'LACBNATNV6',
    category: 'Wine',
    subCategory: 'Sparkling',
    segment: 'Premium',
    brand: 'Lacourte-Godbillon',
    basePrice: 409.32
  }
];

async function main() {
  console.log('Seeding products...');

  const seededProducts: Record<string, string> = {};

  for (const product of products) {
    const p = await prisma.product.upsert({
      where: { sku: product.sku },
      update: product,
      create: product
    });
    seededProducts[product.sku] = p.id;
  }

  console.log(`Seeded ${products.length} products`);

  console.log('Seeding customer...');
  const bondiCellars = await prisma.customer.upsert({
    where: { name: 'Bondi Cellars' },
    update: {},
    create: { name: 'Bondi Cellars', email: 'orders@bondicellars.com.au' }
  });

  console.log('Seeding customer groups...');
  const independentRetailers = await prisma.customerGroup.upsert({
    where: { name: 'Independent Retailers' },
    update: {},
    create: {
      name: 'Independent Retailers',
      description: 'Independent bottle shops and wine retailers'
    }
  });

  const vipGroup = await prisma.customerGroup.upsert({
    where: { name: 'VIP' },
    update: {},
    create: { name: 'VIP', description: 'High-value customers with priority pricing' }
  });

  console.log('Seeding memberships...');
  await prisma.customerGroupMembership.upsert({
    where: {
      customerId_customerGroupId: {
        customerId: bondiCellars.id,
        customerGroupId: independentRetailers.id
      }
    },
    update: {},
    create: { customerId: bondiCellars.id, customerGroupId: independentRetailers.id }
  });

  await prisma.customerGroupMembership.upsert({
    where: {
      customerId_customerGroupId: {
        customerId: bondiCellars.id,
        customerGroupId: vipGroup.id
      }
    },
    update: {},
    create: { customerId: bondiCellars.id, customerGroupId: vipGroup.id }
  });

  console.log('Seeding pricing profiles...');

  const profileA = await prisma.pricingProfile.create({
    data: {
      name: 'Wine Discount -Independents',
      customerGroupId: independentRetailers.id,
      adjustmentType: 'dynamic',
      adjustmentDirection: 'decrease',
      adjustmentValue: 10,
      status: 'published',
      scope: 'all'
    }
  });
  console.log(`  Profile A: ${profileA.name} (Tier 4 -Group + All Products)`);

  await new Promise((r) => setTimeout(r, 100));

  const sparklingSkus = ['KOYBRUNV6', 'LACBNATNV6'];
  const sparklingIds = sparklingSkus.map((sku) => seededProducts[sku]);

  const profileB = await prisma.pricingProfile.create({
    data: {
      name: 'Sparkling Promo -VIPs',
      customerGroupId: vipGroup.id,
      adjustmentType: 'fixed',
      adjustmentDirection: 'decrease',
      adjustmentValue: 15,
      status: 'published',
      scope: 'selected',
      profileProducts: {
        create: sparklingIds.map((productId) => ({ productId }))
      }
    }
  });
  console.log(`  Profile B: ${profileB.name} (Tier 3 -Group + Selected Products)`);

  await new Promise((r) => setTimeout(r, 100));

  const koyamaMethodeId = seededProducts['KOYBRUNV6'];

  const profileC = await prisma.pricingProfile.create({
    data: {
      name: 'Bondi Cellars -Koyama Special',
      customerId: bondiCellars.id,
      adjustmentType: 'custom',
      adjustmentDirection: null,
      adjustmentValue: null,
      status: 'published',
      scope: 'selected',
      profileProducts: {
        create: [{ productId: koyamaMethodeId, customPrice: 95 }]
      }
    }
  });
  console.log(`  Profile C: ${profileC.name} (Tier 1 -Customer + Selected Products)`);

  console.log('\nSeed complete! Demo scenario ready.');
  console.log(
    'Visit /resolved-prices, select "Bondi Cellars" to see overlapping profile resolution.'
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
