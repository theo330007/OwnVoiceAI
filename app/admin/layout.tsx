import { requireAdmin } from '@/lib/admin-guard';
import Link from 'next/link';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This will redirect to /auth/login if not authenticated
  // or to /dashboard if not an admin
  await requireAdmin();

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-sage/5 border-b border-sage/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="font-serif text-xl text-sage">Admin Panel</h2>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/admin/projects"
                className="text-sm text-sage/70 hover:text-sage transition-colors"
              >
                Projects
              </Link>
              <Link
                href="/admin/trends"
                className="text-sm text-sage/70 hover:text-sage transition-colors"
              >
                Trends
              </Link>
            </div>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
