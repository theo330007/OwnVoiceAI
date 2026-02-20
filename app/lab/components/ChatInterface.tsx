'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Loader2, FolderPlus, ChevronRight, CheckCircle2 } from 'lucide-react';
import { ValidationResult } from './ValidationResult';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { createProjectFromConversation } from '@/app/actions/lab';

type ContentType = 'educational' | 'behind_the_scenes' | 'promotional' | 'interactive';

const CONTENT_TYPES: { type: ContentType; label: string; emoji: string }[] = [
  { type: 'educational', label: 'Educational', emoji: '📚' },
  { type: 'behind_the_scenes', label: 'Behind the Scenes', emoji: '🎬' },
  { type: 'promotional', label: 'Promotional', emoji: '✨' },
  { type: 'interactive', label: 'Interactive', emoji: '💬' },
];

export function ChatInterface({ user }: { user: any }) {
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsStreaming(true);

    let assistantContent = '';

    // Build conversation history from prior messages (exclude current)
    const conversationHistory = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: input,
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

  const handleCreateProject = async (contentType: ContentType) => {
    setCreatingProject(true);
    try {
      const workflowId = await createProjectFromConversation(
        messages.filter((m) => m.role === 'user' || m.role === 'assistant').map((m) => ({
          role: m.role,
          content: m.content,
        })),
        contentType
      );
      router.push(`/lab/workflow/${workflowId}`);
    } catch (error: any) {
      console.error('Error creating project:', error);
      setCreatingProject(false);
      setShowCreateProject(false);
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
              {[
                'Post idea: The connection between gut health and hormonal balance',
                'Instagram reel: 5 adaptogenic herbs for stress relief',
                'Blog post: How omega-3s support fertility',
                'TikTok: Morning routine for balanced cortisol',
              ].map((example, idx) => (
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

      {/* Create Project panel */}
      {hasExchange && (
        <div className="border-t border-sage/10 px-6 py-4">
          {showCreateProject ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-sage">
                What type of content do you want to create?
              </p>
              <div className="flex flex-wrap gap-2">
                {CONTENT_TYPES.map(({ type, label, emoji }) => (
                  <button
                    key={type}
                    onClick={() => handleCreateProject(type)}
                    disabled={creatingProject}
                    className="flex items-center gap-2 px-4 py-2 bg-sage/5 hover:bg-sage/10 border border-sage/15 rounded-full text-sm text-sage font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creatingProject ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>{emoji}</span>
                    )}
                    {label}
                    {!creatingProject && <ChevronRight className="w-3 h-3 text-sage/40" />}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowCreateProject(false)}
                className="text-xs text-sage/40 hover:text-sage/60 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowCreateProject(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-dusty-rose/10 hover:bg-dusty-rose/15 text-dusty-rose rounded-full text-sm font-medium transition-colors"
            >
              <FolderPlus className="w-4 h-4" />
              Create Project from this conversation
            </button>
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
