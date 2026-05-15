export interface SeedProduct {
  id: string;
  name: string;
  sku: string;
  pack: string;
  image: string;
  checked: boolean;
}

export interface PriceTableRow {
  id: string;
  title: string;
  skuCode: string;
  category: string;
  basedOnPrice: number;
  adjustment: number;
  newPrice: number;
}

export const seedProducts: SeedProduct[] = [
  {
    id: '1',
    name: 'HN Half Day Hazy',
    sku: '903222100XT',
    pack: '12 × 375ML Can Case',
    image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=96&h=96&fit=crop',
    checked: false
  },
  {
    id: '2',
    name: 'Crumbl Cookies',
    sku: '903222100XT',
    pack: '12 × 375ML Can Case',
    image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=96&h=96&fit=crop',
    checked: true
  },
  {
    id: '3',
    name: 'Crumbl Cookies',
    sku: '903222100XT',
    pack: '12 × 375ML Can Case',
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=96&h=96&fit=crop',
    checked: true
  },
  {
    id: '4',
    name: 'HN Half Day Hazy',
    sku: '903222100XT',
    pack: '12 × 375ML Can Case',
    image: 'https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=96&h=96&fit=crop',
    checked: false
  },
  {
    id: '5',
    name: 'Necessaire',
    sku: '903222100XT',
    pack: '12 × 375ML Can Case',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=96&h=96&fit=crop',
    checked: true
  }
];

export const priceTableRows: PriceTableRow[] = [
  {
    id: '1',
    title: 'HN Half Day Hazy',
    skuCode: 'SKU or UOM',
    category: 'Wine',
    basedOnPrice: 45.0,
    adjustment: -5.0,
    newPrice: 40.0
  },
  {
    id: '2',
    title: 'Crumb Cookies',
    skuCode: 'SKU or UOM',
    category: 'Wine',
    basedOnPrice: 45.0,
    adjustment: -5.0,
    newPrice: 40.0
  },
  {
    id: '3',
    title: 'Necessaire',
    skuCode: 'SKU or UOM',
    category: 'Wine',
    basedOnPrice: 45.0,
    adjustment: -5.0,
    newPrice: 40.0
  }
];
