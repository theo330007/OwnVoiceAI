import { ChatInterface } from './components/ChatInterface';
import { requireAuth } from '@/lib/auth';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function LabPage() {
  await requireAuth();
  return (
    <div className="min-h-screen bg-cream">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sage/70 hover:text-sage transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="font-serif text-4xl text-sage mb-2">
            OwnVoice AI Lab
          </h1>
          <p className="text-sage/70">
            Validate your content ideas with AI-powered trend analysis and
            scientific research
          </p>
        </div>

        <ChatInterface />
      </div>
    </div>
  );
}
