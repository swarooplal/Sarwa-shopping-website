export const CURRENCY = 'INR';
export const FREE_SHIPPING_ABOVE = 1500;
export const SHIPPING_FEE = 99;
export const TAX_RATE = 0.05;
export const MAX_CART_QUANTITY = 10;

export const COLLECTION_TYPES = [
  'FEATURED',
  'WEDDING',
  'SILK',
  'DAILY',
  'OFFICE',
  'PARTY',
  'DESIGNER',
  'JEWELLERY',
] as const;

export const FABRICS = [
  'Silk',
  'Cotton',
  'Linen',
  'Chiffon',
  'Georgette',
  'Organza',
  'Tussar',
  'Banarasi',
  'Kanjivaram',
  'Chanderi',
  'Net',
  'Velvet',
] as const;

export const OCCASIONS = [
  'Wedding',
  'Festive',
  'Office',
  'Casual',
  'Party',
  'Cocktail',
  'Bridal',
  'Engagement',
  'Reception',
] as const;

export const COLORS = [
  'Red',
  'Maroon',
  'Pink',
  'Gold',
  'Green',
  'Blue',
  'Beige',
  'Black',
  'White',
  'Pastel',
  'Multi',
] as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
  RETURNED: 'Returned',
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  PAID: 'Paid',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
};

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: ['*'],
  MANAGER: [
    'products:*',
    'categories:*',
    'collections:*',
    'orders:*',
    'customers:*',
    'coupons:*',
    'inventory:*',
    'banners:*',
    'menus:*',
  ],
  EDITOR: [
    'products:read',
    'products:write',
    'categories:read',
    'categories:write',
    'menus:read',
    'menus:write',
    'banners:read',
    'banners:write',
    'blogs:*',
    'pages:*',
  ],
  STAFF: [
    'orders:read',
    'orders:write',
    'customers:read',
    'reviews:read',
    'reviews:write',
  ],
  CUSTOMER: [],
};
