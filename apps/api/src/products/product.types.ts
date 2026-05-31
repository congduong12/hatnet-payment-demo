export type ProductType = 'ONE_TIME' | 'PLAN';

export type ProductSummary = {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  productType: ProductType;
  priceAmount: number;
  priceCurrency: string;
  displayPrice: string;
  category: string;
  tags: string[];
  metadata: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
