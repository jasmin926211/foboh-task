export interface Product {
  id: string;
  title: string;
  sku: string;
  category: string;
  subCategory: string;
  segment: string;
  brand: string;
  basePrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface PricingProfile {
  id: string;
  name: string;
  customerName: string;
  adjustmentType: 'fixed' | 'dynamic';
  adjustmentDirection: 'increase' | 'decrease';
  adjustmentValue: number;
  profileProducts: ProfileProduct[];
  createdAt: string;
  updatedAt: string;
}

export interface ProfileProduct {
  id: string;
  profileId: string;
  productId: string;
  product?: Product;
}

export interface ComputedPrice {
  productId: string;
  productTitle: string;
  sku?: string;
  basePrice: number;
  newPrice: number;
}

export interface ResolvedPrice {
  productId: string;
  productTitle: string;
  basePrice: number;
  newPrice: number;
  profileId: string | null;
  profileName: string | null;
}

export interface CreateProfilePayload {
  name: string;
  customerName: string;
  adjustmentType: 'fixed' | 'dynamic';
  adjustmentDirection: 'increase' | 'decrease';
  adjustmentValue: number;
  productIds: string[];
}
