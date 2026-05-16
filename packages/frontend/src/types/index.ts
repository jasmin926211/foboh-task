export interface Product {
  id: string;
  title: string;
  sku: string;
  category: string;
  subCategory: string;
  segment: string;
  brand: string;
  basePrice: number;
  costPrice?: number | null;
  minMarginPercent?: number | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string | null;
  memberships?: CustomerGroupMembership[];
  createdAt: string;
  updatedAt: string;
}

export interface CustomerGroup {
  id: string;
  name: string;
  description?: string | null;
  memberships?: CustomerGroupMembership[];
  _count?: { memberships: number };
  createdAt: string;
  updatedAt: string;
}

export interface CustomerGroupMembership {
  id: string;
  customerId: string;
  customerGroupId: string;
  customer?: Customer;
  customerGroup?: CustomerGroup;
}

export interface PricingProfile {
  id: string;
  name: string;
  customerId?: string | null;
  customerGroupId?: string | null;
  customer?: Customer | null;
  customerGroup?: CustomerGroup | null;
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

export interface WaterfallEntry {
  position: number;
  profileId: string;
  profileName: string;
  customerName: string;
  tier: number | null;
  tierLabel: string | null;
  scope: string;
  adjustment: {
    type: string;
    direction: string | null;
    value: number | null;
  };
  computedPrice: number;
  priceAfterFloor: number | null;
  verdict: 'won' | 'lost' | 'rejected';
  reason: string;
}

export interface MarginInsight {
  triggered: boolean;
  winningPrice: number;
  sameTierAvgPrice: number;
  divergencePercent: number;
  message: string | null;
}

export interface ResolvedPrice {
  productId: string;
  productTitle: string;
  basePrice: number;
  finalPrice: number;
  appliedProfile: { id: string; name: string } | null;
  tier: number | null;
  tierLabel: string | null;
  reason: string;

  costPrice: number | null;
  minMarginPercent: number | null;
  floorPrice: number | null;
  floorApplied: boolean;

  waterfall: WaterfallEntry[];
  marginInsight: MarginInsight;
}

export interface PaginatedProfiles {
  data: PricingProfile[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UpdateProfilePayload {
  name?: string;
  customerId?: string | null;
  customerGroupId?: string | null;
  adjustmentType?: 'fixed' | 'dynamic' | 'custom';
  adjustmentDirection?: 'increase' | 'decrease' | null;
  adjustmentValue?: number | null;
  status?: 'draft' | 'published';
  scope?: 'all' | 'selected';
  productIds?: string[];
  customPrices?: Record<string, number>;
}

export interface CreateProfilePayload {
  name: string;
  customerId?: string;
  customerGroupId?: string;
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
