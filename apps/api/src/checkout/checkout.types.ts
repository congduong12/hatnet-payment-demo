export type OrderStatus = 'DRAFT' | 'PENDING_PAYMENT' | 'PAID' | 'PAYMENT_FAILED' | 'CANCELLED' | 'EXPIRED' | 'REFUNDED';

export type RoundingMode = 'ROUND_UP_TO_1000_VND';

export type CheckoutOrderItemSummary = {
  productId: string;
  productName: string;
  quantity: number;
  originalPriceAmount: number;
  originalPriceCurrency: string;
  checkoutUnitPriceAmount: number;
  checkoutLineAmount: number;
};

export type CheckoutOrderSummary = {
  id: string;
  status: OrderStatus;
  subtotalAmount: number;
  discountAmount: number;
  payableAmount: number;
  checkoutCurrency: 'VND';
  fxRate: number;
  fxSource: string;
  roundingMode: RoundingMode;
  items: CheckoutOrderItemSummary[];
  createdAt: string;
  updatedAt: string;
};

