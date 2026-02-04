'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
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

interface Props {
  context: WorkflowContext;
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export function WorkflowChatInterface({ context }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: `I'm your AI assistant for this workflow. I have access to:
- Project: ${context.projectName}
- Trend: ${context.trendTitle}
- Current Phase: ${context.currentPhase}
- Your Products: ${context.products.length} available
- Case Studies: ${context.caseStudies.length} available

Ask me anything to help with your content creation!`,
    },
  ]);
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

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);

    let assistantContent = '';

    try {
      const response = await fetch('/api/workflow-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: input,
          context,
          conversationHistory: messages.filter(m => m.role !== 'system'),
        }),
      });

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
              }
            } catch (e) {
              // Skip invalid JSON
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

  return (
    <Card className="bg-white rounded-3xl shadow-soft flex flex-col h-[calc(100vh-280px)] sticky top-8">
      {/* Header */}
      <div className="p-4 border-b border-sage/10">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-sage" />
          <h3 className="font-semibold text-sage">AI Assistant</h3>
        </div>
        <p className="text-xs text-sage/60 mt-1">
          Phase {context.currentPhase} - Ask me anything
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-sage/10 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-sage" />
              </div>
            )}

            <div
              className={`rounded-2xl px-4 py-3 max-w-[85%] ${
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
              <div className="w-8 h-8 rounded-full bg-dusty-rose/10 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-dusty-rose" />
              </div>
            )}
          </div>
        ))}
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
