export type ID = string;

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
  error?: { code: string; message: string };
}

export type Role = 'ADMIN' | 'MANAGER' | 'EDITOR' | 'STAFF' | 'CUSTOMER';

export interface User {
  id: ID;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: Role;
  avatar?: string;
  createdAt: string;
}

export interface Address {
  id: ID;
  label?: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault?: boolean;
}

export interface Category {
  id: ID;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  banner?: string;
  parentId?: ID | null;
  sortOrder: number;
  isVisible: boolean;
  seoTitle?: string;
  seoDescription?: string;
  children?: Category[];
}

export interface Collection {
  id: ID;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  type:
    | 'FEATURED'
    | 'WEDDING'
    | 'SILK'
    | 'DAILY'
    | 'OFFICE'
    | 'PARTY'
    | 'DESIGNER'
    | 'JEWELLERY';
}

export interface ProductImage {
  id: ID;
  url: string;
  alt?: string;
  sortOrder: number;
}

export interface ProductVariant {
  id: ID;
  size: string;
  sku: string;
  stock: number;
  price?: number;
}

export interface Product {
  id: ID;
  name: string;
  slug: string;
  sku: string;
  shortDescription?: string;
  description?: string;
  price: number;
  offerPrice?: number;
  stock: number;
  brand?: string;
  fabric?: string;
  occasion?: string;
  color?: string;
  weight?: number;
  tags: string[];
  images: ProductImage[];
  video?: string;
  variants: ProductVariant[];
  categories: Category[];
  collections: Collection[];
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string[];
  relatedProductIds: ID[];
  crossSellIds: ID[];
  upsellIds: ID[];
  isFeatured: boolean;
  isTrending: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MenuNode {
  id: ID;
  label: string;
  link?: string;
  icon?: string;
  parentId?: ID | null;
  sortOrder: number;
  isActive: boolean;
  categoryId?: ID | null;
  productIds?: ID[];
  children?: MenuNode[];
}

export interface Banner {
  id: ID;
  position: 'HERO' | 'SIDEBAR' | 'POPUP' | 'FOOTER';
  desktopImage: string;
  mobileImage?: string;
  heading?: string;
  subHeading?: string;
  buttonText?: string;
  buttonLink?: string;
  startAt?: string;
  endAt?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface CartItem {
  id: ID;
  productId: ID;
  variantId?: ID;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
}

export interface Cart {
  id: ID;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  couponCode?: string;
  estimatedDelivery?: string;
}

export interface OrderTimelineEntry {
  status: string;
  note?: string;
  at: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'RETURNED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface Order {
  id: ID;
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: 'RAZORPAY' | 'STRIPE' | 'COD';
  shippingAddress: Address;
  timeline: OrderTimelineEntry[];
  createdAt: string;
}

export interface Review {
  id: ID;
  productId: ID;
  userName: string;
  rating: number;
  title?: string;
  comment: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reply?: string;
  createdAt: string;
}

export interface Coupon {
  id: ID;
  code: string;
  type: 'PERCENTAGE' | 'FLAT';
  value: number;
  minPurchase?: number;
  expiry?: string;
  usageLimit?: number;
  perCustomerLimit?: number;
  active: boolean;
}

export interface BlogPost {
  id: ID;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  publishedAt?: string;
  isPublished: boolean;
}

export interface DashboardStats {
  revenue: number;
  orders: number;
  customers: number;
  conversionRate: number;
  visitors: number;
  topProducts: { productId: ID; name: string; sold: number; revenue: number }[];
  salesSeries: { date: string; amount: number }[];
}

export interface CmsPage {
  id: ID;
  slug: string;
  title: string;
  content: string;
  seoTitle?: string;
  seoDescription?: string;
  isPublished: boolean;
}
