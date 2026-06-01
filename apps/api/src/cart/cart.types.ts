export type CartStatus = 'ACTIVE' | 'CHECKED_OUT' | 'CLEARED';

export type CartItemSummary = {
  id: string;
  productId: string;
  slug: string;
  name: string;
  displayPrice: string;
  priceAmount: number;
  priceCurrency: string;
  quantity: number;
  lineTotalAmount: number;
};

export type CartSummary = {
  id: string;
  status: CartStatus;
  items: CartItemSummary[];
  subtotalAmount: number;
  currency: string;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
};
