import Link from 'next/link';
import { Sparkles, CheckCircle, Circle, ExternalLink } from 'lucide-react';

interface ContextField {
  label: string;
  value: string | string[] | null | undefined;
}

export function UserProfileCard({ user }: { user: any }) {
  const strategy = user?.metadata?.strategy || {};
  const industries: string[] = user?.metadata?.industries || (user?.industry ? [user.industry] : []);

  const contextFields: ContextField[] = [
    { label: 'Industries', value: industries },
    { label: 'Tone & Voice', value: strategy.tone },
    { label: 'Niche', value: strategy.niche },
    { label: 'Target Audience', value: strategy.target_audience },
    { label: 'Positioning', value: strategy.positioning },
    { label: 'Core Belief', value: strategy.core_belief },
    { label: 'Brand Words', value: strategy.brand_words },
  ];

  const activeCount = contextFields.filter((f) => {
    const v = f.value;
    return v && (Array.isArray(v) ? v.length > 0 : v.trim() !== '');
  }).length;

  const profileComplete = activeCount >= 3;

  return (
    <div className="space-y-4">
      {/* Creator identity */}
      <div className="bg-white rounded-3xl shadow-soft p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-dusty-rose rounded-full flex items-center justify-center shrink-0">
            <span className="text-white font-serif text-lg">
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sage truncate">{user?.name || 'Creator'}</p>
            {user?.business_name && (
              <p className="text-xs text-sage/50 truncate">{user.business_name}</p>
            )}
          </div>
        </div>

        {industries.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {industries.map((ind: string) => (
              <span key={ind} className="px-2.5 py-1 bg-dusty-rose/10 text-dusty-rose text-xs font-medium rounded-full">
                {ind}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* AI Customization card */}
      <div className="bg-white rounded-3xl shadow-soft p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-sage" />
          <h3 className="text-sm font-semibold text-sage">AI Customization</h3>
          <span className="ml-auto text-xs text-sage/40">{activeCount}/{contextFields.length}</span>
        </div>

        <p className="text-xs text-sage/50 mb-3 leading-relaxed">
          These profile fields are injected into every AI response to personalize recommendations.
        </p>

        <div className="space-y-2">
          {contextFields.map(({ label, value }) => {
            const hasValue = value && (Array.isArray(value) ? value.length > 0 : value.trim() !== '');
            const displayValue = Array.isArray(value) ? value.join(', ') : value;
            return (
              <div key={label} className="flex items-start gap-2">
                {hasValue ? (
                  <CheckCircle className="w-3.5 h-3.5 text-sage mt-0.5 shrink-0" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-sage/20 mt-0.5 shrink-0" />
                )}
                <div className="min-w-0">
                  <span className={`text-xs font-medium ${hasValue ? 'text-sage' : 'text-sage/30'}`}>
                    {label}
                  </span>
                  {hasValue && displayValue && (
                    <p className="text-[11px] text-sage/50 truncate leading-tight">{displayValue}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {!profileComplete && (
          <div className="mt-4 pt-4 border-t border-sage/8">
            <p className="text-xs text-sage/50 mb-2">
              Complete your strategy profile for richer AI personalization.
            </p>
            <Link
              href="/profile"
              className="inline-flex items-center gap-1 text-xs text-dusty-rose hover:text-dusty-rose/80 font-medium transition-colors"
            >
              Complete profile
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        )}
      </div>

      {/* Quick tip */}
      <div className="px-4 py-3 bg-sage/5 rounded-2xl">
        <p className="text-xs text-sage/60 leading-relaxed">
          <span className="font-semibold text-sage">Tip:</span> Describe your content idea freely — the AI will validate it against current trends and tailor hooks to your audience.
        </p>
      </div>
    </div>
  );
}
