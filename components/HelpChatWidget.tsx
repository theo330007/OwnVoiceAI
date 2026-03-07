'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, HelpCircle, MessageCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content: "Hi! I'm your OwnVoice guide. Ask me anything — where to start, how a feature works, or what to do next on this page.",
};

const QUICK_PROMPTS = [
  'Where should I start?',
  'How do I generate a content plan?',
  'What is the Lab for?',
];

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
      : part
  );
}

function MessageContent({ content }: { content: string }) {
  const lines = content.split('\n');
  const nodes: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = (key: string) => {
    if (listItems.length === 0) return;
    nodes.push(
      <ul key={key} className="my-1 space-y-0.5 pl-3">
        {listItems.map((item, i) => (
          <li key={i} className="flex gap-1.5">
            <span className="mt-[3px] flex-shrink-0 w-1 h-1 rounded-full bg-sage/40" />
            <span>{renderInline(item)}</span>
          </li>
        ))}
      </ul>
    );
    listItems = [];
  };

  lines.forEach((line, i) => {
    const bullet = line.match(/^[-•*]\s+(.+)/);
    const numbered = line.match(/^\d+[.)]\s+(.+)/);
    if (bullet || numbered) {
      listItems.push((bullet || numbered)![1]);
    } else {
      flushList(`list-${i}`);
      if (line.trim()) {
        nodes.push(<p key={i} className="leading-relaxed">{renderInline(line)}</p>);
      }
    }
  });
  flushList('list-end');

  return <div className="space-y-1 text-xs">{nodes}</div>;
}

export function HelpChatWidget({ userContext }: { userContext?: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/help-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: newMessages.slice(0, -1),
          pathname,
          userContext,
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.response || 'Sorry, I could not respond.' },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Something went wrong. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat panel */}
      {open && (
        <div
          className="w-80 bg-cream border border-warm-border rounded-3xl shadow-soft-lg flex flex-col overflow-hidden"
          style={{ height: '440px' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-warm-border bg-white">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-sage to-dusty-rose rounded-xl flex items-center justify-center">
                <HelpCircle className="w-3.5 h-3.5 text-cream" />
              </div>
              <div>
                <p className="text-xs font-semibold text-sage">OwnVoice Guide</p>
                <p className="text-[10px] text-sage/40">Here to help</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-xl flex items-center justify-center text-sage/40 hover:bg-sage/10 hover:text-sage transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-sage text-cream rounded-br-sm'
                      : 'bg-white text-sage border border-warm-border rounded-bl-sm shadow-soft'
                  }`}
                >
                  {msg.role === 'assistant'
                    ? <MessageContent content={msg.content} />
                    : msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-warm-border rounded-2xl rounded-bl-sm px-3 py-2 shadow-soft">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-sage/40 rounded-full animate-bounce [animation-delay:0ms]" />
                    <div className="w-1.5 h-1.5 bg-sage/40 rounded-full animate-bounce [animation-delay:150ms]" />
                    <div className="w-1.5 h-1.5 bg-sage/40 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            {/* Quick prompts — only on first open */}
            {messages.length === 1 && !loading && (
              <div className="flex flex-col gap-1.5 mt-2">
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className="text-left text-xs text-sage/60 border border-sage/15 rounded-xl px-3 py-1.5 hover:bg-sage/5 hover:text-sage hover:border-sage/30 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-warm-border">
            <div className="flex items-center gap-2 bg-white rounded-2xl border border-warm-border px-3 py-2 focus-within:border-sage/40 transition-colors">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder="Ask anything…"
                className="flex-1 bg-transparent text-xs text-sage placeholder:text-sage/40 focus:outline-none"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                className="w-6 h-6 rounded-lg bg-sage flex items-center justify-center text-cream disabled:opacity-40 hover:bg-sage/90 transition-all"
              >
                {loading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Send className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bubble button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-12 h-12 bg-sage hover:bg-sage/90 text-cream rounded-full shadow-soft-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        title="Help & Guidance"
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </button>
    </div>
  );
}
