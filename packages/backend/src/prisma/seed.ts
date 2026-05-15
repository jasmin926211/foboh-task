import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

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
