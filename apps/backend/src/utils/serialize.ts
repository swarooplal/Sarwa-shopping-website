import { safeJsonParse } from '@sarwa/shared';

export function parseTagsArray(value: string | null | undefined): string[] {
  return safeJsonParse<string[]>(value ?? '[]', []);
}

export function parseMetaKeywords(value: string | null | undefined): string[] {
  return safeJsonParse<string[]>(value ?? '[]', []);
}

export function serializeProduct(p: any) {
  if (!p) return null;
  return {
    ...p,
    price: Number(p.price),
    offerPrice: p.offerPrice != null ? Number(p.offerPrice) : null,
    weight: p.weight != null ? Number(p.weight) : null,
    tags: parseTagsArray(p.tagsJson ?? p.tags),
    metaKeywords: parseMetaKeywords(p.metaKeywordsJson ?? p.metaKeywords),
    variants: p.variants?.map((v: any) => ({
      ...v,
      price: v.price != null ? Number(v.price) : null,
    })),
    createdAt: p.createdAt?.toISOString?.(),
    updatedAt: p.updatedAt?.toISOString?.(),
  };
}

export function serializeOrder(o: any) {
  if (!o) return null;
  return {
    ...o,
    subtotal: Number(o.subtotal),
    discount: Number(o.discount),
    shipping: Number(o.shipping),
    tax: Number(o.tax),
    total: Number(o.total),
    items: o.items?.map((i: any) => ({
      ...i,
      unitPrice: Number(i.unitPrice),
      total: Number(i.total),
    })),
    timeline: o.timeline?.map((t: any) => ({
      ...t,
      at: t.at?.toISOString?.(),
    })),
    createdAt: o.createdAt?.toISOString?.(),
    updatedAt: o.updatedAt?.toISOString?.(),
  };
}
