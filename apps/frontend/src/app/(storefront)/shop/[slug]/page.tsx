import { ShopCategoryClient } from './ShopCategoryClient';

export default function ShopCategoryPage({ params }: { params: { slug: string } }) {
  return <ShopCategoryClient slug={params.slug} />;
}
