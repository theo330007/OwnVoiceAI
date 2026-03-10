import { ChatInterface } from './components/ChatInterface';
import { UserProfileCard } from './components/UserProfileCard';
import { getCurrentUser } from '@/lib/auth';

export default async function LabPage() {
  const user = await getCurrentUser();
  return (
    <div className="min-h-screen bg-cream">
      <div className="px-8 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-4xl text-sage">OwnVoice AI Lab</h1>
          <p className="text-sage/50 text-sm mt-1">
            Validate your content ideas with AI-powered trend analysis and scientific research
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6 items-start">
          {/* Left sidebar: profile card */}
          <div className="col-span-1">
            <UserProfileCard user={user} />
          </div>

          {/* Right: chat */}
          <div className="col-span-2">
            <ChatInterface user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}
