'use client';

import { PageRenderer } from '@/components/storefront/PageRenderer';

export function PoliciesClient({ slug }: { slug: string }) {
  return <PageRenderer slug={slug} />;
}
