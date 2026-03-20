'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Loader2, CheckCircle2, CalendarPlus, LayoutGrid, Video, BookHeart, ShoppingBag } from 'lucide-react';
import { ValidationResult } from './ValidationResult';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const SCHEDULE_FORMATS = [
  { key: 'carousel',     label: 'Carousel', icon: LayoutGrid },
  { key: 'reel',         label: 'Reel',     icon: Video },
  { key: 'storytelling', label: 'Story',    icon: BookHeart },
  { key: 'sales',        label: 'Sales',    icon: ShoppingBag },
] as const;

// Returns 4 example prompts tailored to the user's niche/industries.
// Falls back gracefully when no profile data is available.
function getSuggestions(user: any): string[] {
  const industries: string[] = user?.metadata?.industries || (user?.industry ? [user.industry] : []);
  const all = industries.join(' ').toLowerCase();

  const isTech = /tech|saas|ai|automation|no.code|cyber|web3|crypto|software|developer/i.test(all);
  const isBusiness = /business|entrepreneur|finance|productivity|career|leadership|sales|startup/i.test(all);
  const isCreator = /content creation|social media|personal brand|copywriting|email marketing/i.test(all);
  const isLifestyle = /life coach|parenting|relationship|spiritual|travel|mindset|dating/i.test(all);
  const isHealth = /nutrition|wellness|fitness|health|weight|stress|hormone|fertility|burnout|skin|beauty|menopause|postpartum|gut|mindfulness/i.test(all);

  if (isTech) return [
    'Post idea: How AI tools are changing the way developers work in 2025',
    'LinkedIn post: 3 automation hacks that saved me 10 hours this week',
    'Thread: The no-code stack I use to run my entire SaaS business',
    'Reel: What non-technical founders always get wrong about building software',
  ];
  if (isBusiness) return [
    'Post idea: The biggest money mistake new entrepreneurs make in year 1',
    'LinkedIn: How I went from employee to 6-figure business owner in 18 months',
    'Reel: 3 productivity habits that quietly doubled my revenue',
    'Blog post: Why most business coaches give the same generic advice',
  ];
  if (isCreator) return [
    'Post idea: Why your Instagram growth has stalled (and the real fix)',
    'Reel: My full content creation process from idea to published post',
    'Thread: The copywriting formula that tripled my email open rates',
    'Blog post: Personal branding vs. business branding — what to focus on first',
  ];
  if (isLifestyle) return [
    'Post idea: The one daily habit that completely changed my mindset',
    'Reel: Morning routine for busy parents who want more energy',
    'Blog post: How to set boundaries without feeling guilty',
    'TikTok: 3 things I wish I knew before starting my self-development journey',
  ];
  if (isHealth) return [
    'Post idea: The connection between gut health and hormonal balance',
    'Instagram reel: 5 adaptogenic herbs for stress relief',
    'Blog post: How omega-3s support fertility',
    'TikTok: Morning routine for balanced cortisol',
  ];

  // Generic fallback when no profile is set
  return [
    'Post idea: The biggest mistake my clients make before working with me',
    'Reel: My 3 top tips for beginners in my niche',
    'Blog post: Why the traditional approach in my industry is broken',
    'Thread: What I learned after working with 100+ clients',
  ];
}


export function ChatInterface({
  user,
  initialTrend,
  pillars = [],
}: {
  user: any;
  initialTrend?: { title?: string; description?: string };
  pillars?: { title: string }[];
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [calFormat, setCalFormat] = useState('carousel');
  const [calPillar, setCalPillar] = useState(pillars[0]?.title || '');
  const [calState, setCalState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [calResult, setCalResult] = useState<{ date: string; day_name: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const trendSubmitted = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Show "Create Project" button after at least one full exchange
  const hasExchange = messages.filter((m) => m.role === 'assistant' && !m.error).length >= 1;

  // Build user profile subset to send to the AI
  const buildUserProfile = () => {
    if (!user) return undefined;
    const strategy = user?.metadata?.strategy || {};
    const industries = user?.metadata?.industries || (user?.industry ? [user.industry] : []);
    return {
      name: user.name,
      industries,
      tone: strategy.tone,
      niche: strategy.niche,
      target_audience: strategy.target_audience,
      core_belief: strategy.core_belief,
      positioning: strategy.positioning,
      offering: user.offering || strategy.offering,
      brand_words: strategy.brand_words,
      persona: user.persona,
    };
  };

  const submitMessage = async (text: string, currentMessages: any[]) => {
    if (!text.trim() || isStreaming) return;
    const userMessage = { role: 'user', content: text };
    const updatedMessages = [...currentMessages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsStreaming(true);
    let assistantContent = '';
    const conversationHistory = currentMessages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role, content: m.content }));
    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: text,
          userProfile: buildUserProfile(),
          conversationHistory,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No reader');

      // Add assistant placeholder with empty thinking steps
      setMessages((prev) => [...prev, { role: 'assistant', content: '', thinkingSteps: [] }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter((line) => line.trim());

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;

          // Parse the SSE line — skip silently if malformed
          let data: any;
          try {
            data = JSON.parse(line.slice(6));
          } catch {
            continue;
          }

          // Handle the parsed event — errors here must propagate to the outer catch
          if (data.type === 'text') {
            assistantContent += data.content;
            setMessages((prev) => {
              const newMessages = [...prev];
              newMessages[newMessages.length - 1] = {
                ...newMessages[newMessages.length - 1],
                content: assistantContent,
              };
              return newMessages;
            });
          } else if (data.type === 'status') {
            setMessages((prev) => {
              const newMessages = [...prev];
              const last = newMessages[newMessages.length - 1];
              newMessages[newMessages.length - 1] = {
                ...last,
                thinkingSteps: [...(last.thinkingSteps || []), data.content],
              };
              return newMessages;
            });
          } else if (data.type === 'error') {
            throw new Error(data.content);
          }
        }
      }

      // If we got no content at all, surface that as an error
      if (!assistantContent.trim()) {
        throw new Error('No response received from the AI. Please try again.');
      }

      // Try to parse as JSON for validation result.
      // Strip markdown code fences in case the model added them.
      try {
        const jsonText = assistantContent
          .replace(/^```json\s*\n?/i, '')
          .replace(/\n?```\s*$/, '')
          .trim();
        const validationResult = JSON.parse(jsonText);
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            ...newMessages[newMessages.length - 1],
            content: assistantContent,
            validationResult,
            thinkingSteps: [],
          };
          return newMessages;
        });
      } catch {
        // Not JSON — keep as plain text, just clear thinking steps
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            ...newMessages[newMessages.length - 1],
            thinkingSteps: [],
          };
          return newMessages;
        });
      }
    } catch (error: any) {
      console.error('Lab chat error:', error);
      // Replace the placeholder (if any) with an inline error, or push a new error message
      setMessages((prev) => {
        const newMessages = [...prev];
        const last = newMessages[newMessages.length - 1];
        if (last?.role === 'assistant' && !last?.content) {
          // Replace empty placeholder with the error
          newMessages[newMessages.length - 1] = {
            role: 'assistant',
            content: `Something went wrong: ${error.message}`,
            error: true,
            thinkingSteps: [],
          };
          return newMessages;
        }
        return [
          ...prev,
          {
            role: 'assistant',
            content: `Something went wrong: ${error.message}`,
            error: true,
          },
        ];
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMessage(input, messages);
  };

  // Auto-submit when coming from a trend card
  useEffect(() => {
    if (!initialTrend?.title || trendSubmitted.current) return;
    trendSubmitted.current = true;
    const msg = initialTrend.description
      ? `Analyse this trend for my content strategy:\n\n**${initialTrend.title}**\n${initialTrend.description}\n\nHow can I create content around this trend that fits my brand and audience?`
      : `Analyse this trend for my content strategy: "${initialTrend.title}". How can I create content around it that fits my brand and audience?`;
    // Small delay to let the component mount fully
    setTimeout(() => submitMessage(msg, []), 300);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddToCalendar = async () => {
    setCalState('loading');
    // Extract topic from first user message
    const firstUserMsg = messages.find((m) => m.role === 'user');
    const topic = firstUserMsg?.content?.split('\n')[0]?.slice(0, 120) || 'Lab idea';
    // Extract latest validation result
    const latestValidation = [...messages].reverse().find((m) => m.validationResult)?.validationResult;
    const bestHook = latestValidation?.refined_hooks?.[0] || topic;

    const labData = latestValidation ? {
      refined_hooks: latestValidation.refined_hooks ?? [],
      credibility_score: latestValidation.scientific_anchor?.credibility_score ?? null,
      key_findings: latestValidation.scientific_anchor?.key_findings ?? null,
      macro_trends: latestValidation.trend_alignment?.macro_trends ?? [],
      niche_trends: latestValidation.trend_alignment?.niche_trends ?? [],
      relevance_score: latestValidation.relevance_score ?? null,
    } : undefined;

    try {
      const res = await fetch('/api/ideas/schedule-from-lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, hook: bestHook, format: calFormat, pillar: calPillar, labData }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCalResult(data);
      setCalState('done');
    } catch {
      setCalState('error');
      setTimeout(() => setCalState('idle'), 2000);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-240px)] bg-white rounded-3xl shadow-soft-lg">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <h2 className="font-serif text-3xl text-sage mb-4">
              Welcome to OwnVoice AI Lab
            </h2>
            <p className="text-sage/70 max-w-md mx-auto mb-8">
              Describe your content idea and I'll validate it against current
              trends and scientific research.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {getSuggestions(user).map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(example)}
                  className="text-left p-4 bg-sage/5 hover:bg-sage/10 rounded-2xl text-sm text-sage transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, idx) => (
          <div
            key={idx}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'user' ? (
              <div className="bg-sage text-cream px-6 py-3 rounded-3xl max-w-2xl">
                {message.content}
              </div>
            ) : message.validationResult ? (
              <ValidationResult result={message.validationResult} />
            ) : message.error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-3 rounded-3xl max-w-3xl">
                {message.content}
              </div>
            ) : message.content ? (
              <div className="bg-cream border border-sage/10 text-sage px-6 py-3 rounded-3xl max-w-3xl whitespace-pre-wrap">
                {message.content}
              </div>
            ) : (
              /* Thinking / loading state */
              <div className="bg-cream border border-sage/10 px-5 py-4 rounded-3xl max-w-sm space-y-2">
                {message.thinkingSteps?.length > 0 ? (
                  <>
                    {message.thinkingSteps.map((step: string, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-sage/40 shrink-0" />
                        <span className="text-xs text-sage/60">{step}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-2 animate-pulse">
                      <Loader2 className="w-3.5 h-3.5 text-sage/40 animate-spin shrink-0" />
                      <span className="text-xs text-sage/40">Analyzing results…</span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2 animate-pulse">
                    <Loader2 className="w-4 h-4 text-sage/40 animate-spin" />
                    <span className="text-xs text-sage/50">Thinking…</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Add to Calendar panel */}
      {hasExchange && (
        <div className="border-t border-sage/10 px-6 py-4">
          {calState === 'done' && calResult ? (
            <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-2xl">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <p className="text-sm text-green-800 flex-1">
                Added to your calendar · <span className="font-semibold">{calResult.day_name} {new Date(calResult.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </p>
              <a href="/editorial" className="text-xs font-semibold text-dusty-rose hover:text-dusty-rose/80 underline transition-colors">
                View calendar →
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-sage/40 uppercase tracking-wider">Add to Calendar</p>
              {/* Format picker */}
              <div className="flex gap-2">
                {SCHEDULE_FORMATS.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setCalFormat(key)}
                    className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                      calFormat === key ? 'bg-sage text-cream' : 'bg-sage/5 text-sage/50 hover:text-sage border border-sage/10'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
              </div>
              {/* Pillar picker */}
              {pillars.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {pillars.map((p) => (
                    <button
                      key={p.title}
                      onClick={() => setCalPillar(p.title)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        calPillar === p.title ? 'bg-dusty-rose text-cream' : 'bg-sage/5 text-sage/50 border border-sage/15 hover:border-sage/30'
                      }`}
                    >
                      {p.title}
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={handleAddToCalendar}
                disabled={calState === 'loading'}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sage to-sage/80 hover:from-sage/90 hover:to-sage/70 text-cream rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
              >
                {calState === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarPlus className="w-4 h-4" />}
                {calState === 'loading' ? 'Adding…' : 'Add to Calendar'}
              </button>
              {calState === 'error' && <p className="text-xs text-red-500">Failed — try again</p>}
            </div>
          )}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-sage/10 p-6">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your content idea..."
            className="flex-1 resize-none rounded-2xl border-sage/20 focus:border-sage min-h-[60px]"
            rows={2}
            disabled={isStreaming}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="bg-sage hover:bg-sage/90 text-cream rounded-2xl px-8 h-auto"
          >
            {isStreaming ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </form>
        <p className="text-xs text-sage/50 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
