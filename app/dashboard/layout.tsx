import { getCurrentUser } from '@/lib/auth';
import { DashboardSidebar } from './components/DashboardSidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="flex h-screen bg-cream overflow-hidden">
      <DashboardSidebar user={user} />
      <main className="flex-1 overflow-y-auto ml-16">{children}</main>
    </div>
  );
}
