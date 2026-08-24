import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().regex(/^[0-9+\-\s()]{7,20}$/).optional(),
}).refine((d) => !!d.email || !!d.phone, {
  message: 'Email or phone is required',
});

export const LoginSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().regex(/^[0-9+\-\s()]{7,20}$/).optional(),
  password: z.string().min(1).optional(),
}).refine((d) => !!d.email || !!d.phone, {
  message: 'Email or phone is required',
});

// Auto-create-or-login: accepts email or phone; if the user does not
// exist they are created on the fly and signed in.
export const QuickAuthSchema = z.object({
  identifier: z.string().min(3),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
});

export type QuickAuthInput = z.infer<typeof QuickAuthSchema>;

export const AddressSchema = z.object({
  label: z.string().optional(),
  fullName: z.string().min(1),
  phone: z.string().regex(/^[0-9+\-\s()]{7,20}$/),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/),
  country: z.string().default('India'),
  isDefault: z.boolean().optional(),
});

export const CategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  banner: z.string().nullable().optional(),
  parentId: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
  isVisible: z.boolean().default(true),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
});

export const ProductVariantSchema = z.object({
  size: z.string().min(1),
  sku: z.string().min(1),
  stock: z.number().int().min(0),
  price: z.number().optional(),
});

export const ProductSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  sku: z.string().min(1),
  shortDescription: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  price: z.number().positive(),
  offerPrice: z.number().positive().nullable().optional(),
  stock: z.number().int().min(0).default(0),
  brand: z.string().nullable().optional(),
  fabric: z.string().nullable().optional(),
  occasion: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  weight: z.number().nullable().optional(),
  tags: z.array(z.string()).default([]),
  categoryIds: z.array(z.string()).default([]),
  collectionIds: z.array(z.string()).default([]),
  variants: z.array(ProductVariantSchema).default([]),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  metaKeywords: z.array(z.string()).default([]),
  relatedProductIds: z.array(z.string()).default([]),
  crossSellIds: z.array(z.string()).default([]),
  upsellIds: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  isTrending: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const BannerSchema = z.object({
  position: z.enum(['HERO', 'SIDEBAR', 'POPUP', 'FOOTER']).default('HERO'),
  desktopImage: z.string().url(),
  mobileImage: z.string().url().optional(),
  heading: z.string().optional(),
  subHeading: z.string().optional(),
  buttonText: z.string().optional(),
  buttonLink: z.string().url().optional(),
  startAt: z.string().optional(),
  endAt: z.string().optional(),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const MenuSchema = z.object({
  label: z.string().min(1),
  link: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  // Prefer linking to a Category by id; falls back to categorySlug for legacy entries.
  categoryId: z.string().optional().nullable(),
  categorySlug: z.string().optional().nullable(),
  productIds: z.array(z.string()).default([]),
});

export const MenuReorderSchema = z.array(
  z.object({
    id: z.string(),
    parentId: z.string().nullable().optional(),
    sortOrder: z.number().int(),
  })
);

export const CouponSchema = z.object({
  code: z.string().min(2).max(40).toUpperCase(),
  type: z.enum(['PERCENTAGE', 'FLAT']),
  value: z.number().positive(),
  minPurchase: z.number().optional(),
  expiry: z.string().optional(),
  usageLimit: z.number().int().positive().optional(),
  perCustomerLimit: z.number().int().positive().optional(),
  active: z.boolean().default(true),
});

export const CheckoutSchema = z.object({
  email: z.string().email(),
  shippingAddress: AddressSchema,
  billingAddress: AddressSchema.optional(),
  paymentMethod: z.enum(['RAZORPAY', 'STRIPE', 'COD']),
  notes: z.string().optional(),
});

export const RazorpayVerifySchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
  orderNumber: z.string(),
});

export const ReviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().min(2),
});

export const BlogPostSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().optional(),
  content: z.string().min(1),
  coverImage: z.string().url().optional(),
  tags: z.array(z.string()).default([]),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  isPublished: z.boolean().default(false),
});

export const CmsPageSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  content: z.string().min(1),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  isPublished: z.boolean().default(false),
});

export const CmsPageUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  isPublished: z.boolean().optional(),
});

export const ContactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(1),
  message: z.string().min(5),
});

export const NewsletterSchema = z.object({
  email: z.string().email(),
});

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type AddressInput = z.infer<typeof AddressSchema>;
export type CategoryInput = z.infer<typeof CategorySchema>;
export type ProductInput = z.infer<typeof ProductSchema>;
export type BannerInput = z.infer<typeof BannerSchema>;
export type MenuInput = z.infer<typeof MenuSchema>;
export type CouponInput = z.infer<typeof CouponSchema>;
export type CheckoutInput = z.infer<typeof CheckoutSchema>;
export type ReviewInput = z.infer<typeof ReviewSchema>;
export type BlogPostInput = z.infer<typeof BlogPostSchema>;
export type CmsPageInput = z.infer<typeof CmsPageSchema>;
export type ContactInput = z.infer<typeof ContactSchema>;
export type PaginationInput = z.infer<typeof PaginationSchema>;
