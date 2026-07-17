export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function formatCurrency(amount: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function discountPercent(price: number, offerPrice: number): number {
  if (!offerPrice || offerPrice >= price) return 0;
  return Math.round(((price - offerPrice) / price) * 100);
}

export function calculateTax(subtotal: number, rate: number = 0.05): number {
  return Math.round(subtotal * rate);
}

export function calculateShipping(subtotal: number, freeAbove: number = 1500): number {
  return subtotal >= freeAbove ? 0 : 99;
}

export function buildTree<T extends { id: string; parentId?: string | null }>(
  items: T[]
): (T & { children: any[] })[] {
  const map = new Map<string, any>();
  const roots: any[] = [];
  for (const item of items) map.set(item.id, { ...item, children: [] });
  for (const item of items) {
    const node = map.get(item.id);
    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId).children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

export function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function truncate(text: string, length: number = 100): string {
  if (!text || text.length <= length) return text;
  return text.slice(0, length).trimEnd() + '…';
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function generateOrderNumber(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SARWA-${stamp}-${rnd}`;
}
