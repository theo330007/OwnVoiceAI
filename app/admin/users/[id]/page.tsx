import { getUserById, getUserValidations } from '@/app/actions/users';
import { UserProfileForm } from './components/UserProfileForm';
import { UserActivity } from './components/UserActivity';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function UserDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getUserById(params.id);

  if (!user) {
    notFound();
  }

  const validations = await getUserValidations(params.id);

  return (
    <div className="min-h-screen bg-cream p-8">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-sage/70 hover:text-sage transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Users
        </Link>

        <div className="mb-8">
          <h1 className="font-serif text-4xl text-sage mb-2">{user.name}</h1>
          <p className="text-sage/70">{user.email}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Form - 2 columns */}
          <div className="lg:col-span-2">
            <UserProfileForm user={user} />
          </div>

          {/* Activity - 1 column */}
          <div>
            <UserActivity userId={user.id} validations={validations} />
          </div>
        </div>
      </div>
    </div>
  );
}
