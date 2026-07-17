import { PoliciesClient } from '@/components/storefront/PoliciesClient';

export default function PolicyPage({ params }: { params: { slug: string } }) {
  return <PoliciesClient slug={params.slug} />;
}
