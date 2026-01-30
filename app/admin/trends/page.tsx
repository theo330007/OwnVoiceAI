import Link from 'next/link';
import { getTrendsByLayer } from '@/app/actions/trends';
import { TrendsList } from './components/TrendsList';
import { AddTrendForm } from './components/AddTrendForm';

export default async function ManageTrendsPage() {
  const macroTrends = await getTrendsByLayer('macro');

  return (
    <div className="min-h-screen bg-cream">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-4xl text-sage mb-2">
                Manage Trends
              </h1>
              <p className="text-sage/70">
                View, add, and manage wellness trends
              </p>
            </div>
            <Link
              href="/admin/dashboard"
              className="text-sm text-sage/70 hover:text-sage transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Trends List */}
        <div className="mb-8">
          <TrendsList macroTrends={macroTrends} />
        </div>

        {/* Add Trend Form */}
        <div className="max-w-2xl">
          <AddTrendForm />
        </div>
      </div>
    </div>
  );
}
