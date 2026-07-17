import Link from 'next/link';

export default function AdminNotFound() {
  return (
    <div className="text-center py-24">
      <p className="font-serif text-3xl">Not found</p>
      <Link href="/admin" className="btn-primary mt-4 inline-flex">Dashboard</Link>
    </div>
  );
}
