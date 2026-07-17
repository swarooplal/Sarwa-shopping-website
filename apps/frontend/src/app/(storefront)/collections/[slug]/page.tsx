import { CollectionClient } from './CollectionClient';

export default function CollectionPage({ params }: { params: { slug: string } }) {
  return <CollectionClient slug={params.slug} />;
}
