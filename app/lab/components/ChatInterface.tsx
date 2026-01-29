'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { ValidationResult } from './ValidationResult';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export function ChatInterface() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);

    let assistantContent = '';

    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No reader');

      // Add assistant message placeholder
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter((line) => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
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
              } else if (data.type === 'error') {
                throw new Error(data.content);
              }
            } catch (parseError) {
              console.error('Error parsing chunk:', parseError);
            }
          }
        }
      }

      // Try to parse as JSON for validation result
      try {
        const validationResult = JSON.parse(assistantContent);
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            role: 'assistant',
            content: assistantContent,
            validationResult,
          };
          return newMessages;
        });
      } catch {
        // Not JSON, keep as plain text
      }
    } catch (error: any) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Sorry, there was an error: ${error.message}`,
          error: true,
        },
      ]);
    } finally {
      setIsStreaming(false);
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
            ) : (
              <div className="bg-cream border border-sage/10 text-sage px-6 py-3 rounded-3xl max-w-3xl whitespace-pre-wrap">
                {message.content || (
                  <Loader2 className="w-5 h-5 animate-spin text-sage/50" />
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

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
