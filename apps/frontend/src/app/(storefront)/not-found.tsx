import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-x py-24 text-center">
      <span className="eyebrow">Error 404</span>
      <h1 className="font-serif text-6xl mt-2">Page not found</h1>
      <p className="text-sm text-charcoal-300 mt-3">The page you’re looking for has slipped through the fabric.</p>
      <Link href="/" className="btn-primary mt-8 inline-flex">Back to home</Link>
    </div>
  );
}
