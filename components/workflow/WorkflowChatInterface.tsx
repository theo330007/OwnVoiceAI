'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

interface WorkflowContext {
  workflowId: string;
  projectName: string;
  contentType: string;
  trendTitle: string;
  contentIdea: any;
  currentPhase: number;
  phaseData: any;
  products: any[];
  caseStudies: any[];
  brandStyle?: string;
  brandVoice?: string;
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

type ContentUpdate = {
  scene_update?: { index: number; visual: string; audio: string; assets?: any[] };
  script?: { scenes: any[] };
  hookVariations?: { type: string; hook: string }[];
  bRollShotList?: { title: string; description: string; camera_angle: string; vibe_tag: string; duration: string }[];
};

interface Props {
  context: WorkflowContext;
  messages?: Message[];
  onMessagesChange?: (messages: Message[]) => void;
  onContentUpdate?: (updates: ContentUpdate) => void;
  currentContent?: { script?: any; hookVariations?: any[]; bRollShotList?: any[] };
  onExternalMessage?: (send: (msg: string) => void) => void;
}

// Dynamic prompt suggestions based on phase and state
function getSuggestedPrompts(phase: number, phaseData: any): string[] {
  const hasPhase2Data = phaseData?.phase2?.script;

  if (phase === 1) {
    return [
      'Which format works best for this trend?',
      'Help me pick the right tone',
      'Should I link this to a product?',
    ];
  }

  if (phase === 2 && !hasPhase2Data) {
    return [
      'What should I focus on for this content?',
      'How can I make the hook stronger?',
      'Any tips before I generate?',
    ];
  }

  if (phase === 2 && hasPhase2Data) {
    return [
      'Make the hooks more provocative',
      'The script feels too long, shorten it',
      'Add more storytelling to the script',
      'Make the tone more casual',
    ];
  }

  if (phase === 3) {
    return [
      'Check if my claims are accurate',
      'Does this match my brand voice?',
      'Any compliance concerns?',
    ];
  }

  return [
    'Help me with this phase',
    'What should I do next?',
  ];
}

export function WorkflowChatInterface({ context, messages: externalMessages, onMessagesChange, onContentUpdate, currentContent, onExternalMessage }: Props) {
  // Use external state if provided, otherwise use internal
  const [internalMessages, setInternalMessages] = useState<Message[]>([]);
  const messages = externalMessages || internalMessages;
  const setMessages = (updater: Message[] | ((prev: Message[]) => Message[])) => {
    if (onMessagesChange) {
      if (typeof updater === 'function') {
        onMessagesChange(updater(messages));
      } else {
        onMessagesChange(updater);
      }
    } else {
      if (typeof updater === 'function') {
        setInternalMessages(updater);
      } else {
        setInternalMessages(updater);
      }
    }
  };

  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = getSuggestedPrompts(context.currentPhase, context.phaseData);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Hide suggestions after first user message
  useEffect(() => {
    if (messages.some((m) => m.role === 'user')) {
      setShowSuggestions(false);
    }
  }, [messages]);

  // Ref-backed sender so parent always calls the latest handleSubmit
  const handleSubmitRef = useRef<(msg: string) => void>(() => {});

  const handleSubmit = async (e?: React.FormEvent, overrideInput?: string) => {
    e?.preventDefault();
    const query = overrideInput || input.trim();
    if (!query || isStreaming) return;

    const userMessage: Message = { role: 'user', content: query };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);

    let assistantContent = '';

    try {
      const response = await fetch('/api/workflow-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          context,
          conversationHistory: messages.filter(m => m.role !== 'system'),
          currentContent: currentContent || null,
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No reader');

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter((line) => line.trim());

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;

          let data: any;
          try {
            data = JSON.parse(line.slice(6));
          } catch {
            continue;
          }

          if (data.type === 'text') {
            assistantContent += data.content;
            setMessages((prev) => {
              const newMessages = [...prev];
              newMessages[newMessages.length - 1] = {
                role: 'assistant',
                content: assistantContent,
              };
              return newMessages;
            });
          } else if (data.type === 'content_update') {
            if (onContentUpdate) {
              onContentUpdate(data.content);
              const updates: ContentUpdate = data.content;
              const changes: string[] = [];
              if (updates.scene_update) {
                changes.push(`Scene ${updates.scene_update.index + 1} updated`);
              }
              if (updates.script) {
                changes.push(`Full script rewritten (${updates.script.scenes.length} scenes)`);
              }
              if (updates.hookVariations) {
                changes.push(`Hook variations updated (${updates.hookVariations.length} hooks)`);
              }
              if (updates.bRollShotList) {
                changes.push(`B-roll shot list updated (${updates.bRollShotList.length} shots)`);
              }
              const summary = changes.length > 0 ? changes.join(' · ') : 'Content updated';
              setMessages((prev) => [
                ...prev,
                { role: 'system', content: `✓ ${summary}` },
              ]);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, there was an error processing your request.',
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  // Keep ref fresh so parent's sender always calls the latest handleSubmit
  handleSubmitRef.current = (msg: string) => handleSubmit(undefined, msg);

  // Expose sender to parent once on mount
  useEffect(() => {
    if (onExternalMessage) {
      onExternalMessage((msg: string) => handleSubmitRef.current(msg));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSuggestionClick = (prompt: string) => {
    setShowSuggestions(false);
    handleSubmit(undefined, prompt);
  };

  return (
    <Card className="bg-white rounded-3xl shadow-soft flex flex-col h-[500px]">
      {/* Header */}
      <div className="p-4 border-b border-sage/10">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-sage" />
          <h3 className="font-semibold text-sage">AI Assistant</h3>
        </div>
        <p className="text-xs text-sage/60 mt-1">
          Phase {context.currentPhase} — Ask me anything
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Empty state with suggestions */}
        {messages.length === 0 && showSuggestions && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-sage/50 mb-3">
              <Sparkles className="w-4 h-4" />
              <p className="text-xs font-medium">Try asking</p>
            </div>
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(prompt)}
                className="w-full text-left px-4 py-3 rounded-2xl border border-sage/10 text-sm text-sage/70 hover:border-sage/30 hover:bg-sage/[0.02] transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {messages.map((message, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-sage/10 flex items-center justify-center flex-shrink-0">
                <Bot className="w-3.5 h-3.5 text-sage" />
              </div>
            )}

            <div
              className={`rounded-2xl px-4 py-2.5 max-w-[85%] ${
                message.role === 'user'
                  ? 'bg-sage text-cream'
                  : message.role === 'system'
                  ? 'bg-dusty-rose/10 text-sage/70 text-sm border border-dusty-rose/20'
                  : 'bg-cream border border-sage/10 text-sage'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
            </div>

            {message.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-dusty-rose/10 flex items-center justify-center flex-shrink-0">
                <User className="w-3.5 h-3.5 text-dusty-rose" />
              </div>
            )}
          </div>
        ))}

        {/* Post-conversation suggestions (after assets generated) */}
        {!isStreaming && messages.length > 0 && messages.length < 6 && context.phaseData?.phase2?.script && (
          <div className="pt-2">
            <div className="flex flex-wrap gap-2">
              {getSuggestedPrompts(context.currentPhase, context.phaseData)
                .slice(0, 2)
                .map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(prompt)}
                    className="px-3 py-1.5 rounded-full border border-sage/15 text-xs text-sage/60 hover:border-sage/30 hover:text-sage/80 transition-all"
                  >
                    {prompt}
                  </button>
                ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-sage/10 p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for help..."
            className="flex-1 resize-none rounded-xl border-sage/20 focus:border-sage text-sm min-h-[60px]"
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
            className="bg-sage hover:bg-sage/90 text-cream rounded-xl h-[60px] px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
