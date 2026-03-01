import { getCurrentUser } from '@/lib/auth';
import { DashboardSidebar } from '@/app/dashboard/components/DashboardSidebar';

export default async function EditorialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen bg-cream">
      <DashboardSidebar user={user} />
      <main className="flex-1 ml-16">{children}</main>
    </div>
  );
}
