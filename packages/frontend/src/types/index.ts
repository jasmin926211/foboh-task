export interface Product {
  id: string;
  title: string;
  sku: string;
  category: string;
  subCategory: string;
  segment: string;
  brand: string;
  basePrice: number;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PricingProfile {
  id: string;
  name: string;
  customerName: string;
  adjustmentType: 'fixed' | 'dynamic' | 'custom';
  adjustmentDirection?: 'increase' | 'decrease' | null;
  adjustmentValue?: number | null;
  status: 'draft' | 'published';
  scope: 'all' | 'selected';
  profileProducts: ProfileProduct[];
  createdAt: string;
  updatedAt: string;
}

export interface ProfileProduct {
  id: string;
  profileId: string;
  productId: string;
  customPrice?: number | null;
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
  appliedProfile: { id: string; name: string } | null;
  reason: string;
  candidateProfiles: {
    id: string;
    name: string;
    adjustment: { type: string; direction: string; value: number };
    computedPrice: number;
    updatedAt: string;
    scope: string;
  }[];
  rejectedProfiles: {
    id: string;
    name: string;
    rejectionReason: string;
  }[];
}

export interface CreateProfilePayload {
  name: string;
  customerNames: string[];
  adjustmentType: 'fixed' | 'dynamic' | 'custom';
  adjustmentDirection?: 'increase' | 'decrease';
  adjustmentValue?: number;
  status?: 'draft' | 'published';
  scope?: 'all' | 'selected';
  productIds?: string[];
  customPrices?: Record<string, number>;
}

export interface PreviewPricesPayload {
  productIds?: string[];
  adjustmentType: 'fixed' | 'dynamic' | 'custom';
  adjustmentDirection?: 'increase' | 'decrease';
  adjustmentValue?: number;
  scope?: 'all' | 'selected';
  customPrices?: Record<string, number>;
}

export interface PreviewPrice {
  productId: string;
  productTitle: string;
  sku: string;
  category: string;
  basePrice: number;
  adjustment: number;
  newPrice: number;
}

export interface PreviewPricesResponse {
  results: PreviewPrice[];
  warnings: string[];
}
