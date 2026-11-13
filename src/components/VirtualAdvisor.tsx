import React, { useEffect, useRef, useState } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import { getCopy } from '../data/i18n.ts';
import { MONOGRAM_LOGO_SRC } from '../data/media.ts';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const VirtualAdvisor: React.FC = () => {
  const { language, assistantOpen, setAssistantOpen } = useStore();
  const copy = getCopy(language);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: copy.assistant.greeting },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync initial greeting if only the greeting is present and user switches language
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].role === 'assistant') {
        return [{ role: 'assistant', content: copy.assistant.greeting }];
      }
      return prev;
    });
  }, [copy.assistant.greeting]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, assistantOpen]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages, language }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok || !data.reply) {
        setError(
          data.error ||
            (language === 'fr'
              ? 'Impossible de joindre la conseillère pour le moment.'
              : 'Unable to reach our advisor at the moment.')
        );
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply! }]);
      }
    } catch {
      setError(
        language === 'fr'
          ? 'Erreur réseau. Veuillez réessayer.'
          : 'Network error. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {!assistantOpen ? (
        <button
          type="button"
          onClick={() => setAssistantOpen(true)}
          className="flex items-center gap-2.5 px-5 py-3 bg-[#1C1917] text-[#FAF8F5] border border-[#1C1917] shadow-lg hover:bg-[#332E2A] transition-colors text-xs uppercase tracking-[0.16em] whitespace-nowrap"
        >
          <MessageSquare className="w-4 h-4 stroke-[1.5]" />
          <span>{copy.assistant.trigger}</span>
        </button>
      ) : (
        <div className="w-[340px] sm:w-[390px] h-[520px] max-h-[80vh] bg-[#FAF8F5] border border-[#D8CFC2] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-5 py-4 border-b border-[#E3DBD0] bg-[#F2EDE6] flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={MONOGRAM_LOGO_SRC}
                alt="MF"
                referrerPolicy="no-referrer"
                className="w-7 h-7 object-contain mix-blend-multiply shrink-0"
              />
              <div className="min-w-0">
                <h3 className="font-editorial text-lg leading-tight text-[#1C1917] truncate">
                  {copy.assistant.title}
                </h3>
                <p className="text-[11px] text-[#6E6257] truncate">{copy.assistant.subtitle}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAssistantOpen(false)}
              aria-label={copy.sizeGuide.close}
              className="p-2 text-[#1C1917] hover:text-[#6E6257]"
            >
              <X className="w-4 h-4 stroke-[1.5]" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 text-[13.5px] leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-[#1C1917] text-[#FAF8F5]'
                      : 'bg-[#F2EDE6] text-[#1C1917] border border-[#E3DBD0]'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {messages.length === 1 && !loading && (
              <div className="pt-2 flex flex-col gap-2">
                {copy.assistant.suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => sendMessage(suggestion)}
                    className="text-left text-xs text-[#1C1917] border border-[#D8CFC2] px-3 py-2 hover:bg-[#F2EDE6] transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="px-4 py-3 bg-[#F2EDE6] border border-[#E3DBD0] text-xs text-[#6E6257]">
                  {language === 'fr' ? 'Rédaction en cours...' : 'Composing reply...'}
                </div>
              </div>
            )}

            {error && (
              <div className="px-3.5 py-2.5 border border-[#9B3B2E]/30 bg-[#9B3B2E]/5 text-xs text-[#7D2C22]">
                {error}
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="p-3 border-t border-[#E3DBD0] bg-[#FAF8F5] flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={copy.assistant.placeholder}
              className="flex-1 bg-transparent px-3 py-2 text-sm text-[#1C1917] placeholder:text-[#8E8276] focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="Send"
              className="w-10 h-10 flex items-center justify-center bg-[#1C1917] text-[#FAF8F5] disabled:opacity-40 hover:bg-[#332E2A] transition-colors shrink-0"
            >
              <Send className="w-4 h-4 stroke-[1.5]" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
