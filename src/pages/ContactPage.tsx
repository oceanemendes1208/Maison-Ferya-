import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import { getCopy } from '../data/i18n.ts';

export const ContactPage: React.FC = () => {
  const { language } = useStore();
  const copy = getCopy(language);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState<string>(copy.contact.subjects[0]);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message, language }),
      });
      const data = (await res.json()) as { inquiry?: { reference: string }; error?: string };
      if (!res.ok || !data.inquiry) {
        setError(data.error || 'Error submitting form.');
      } else {
        setReference(data.inquiry.reference);
        setName('');
        setEmail('');
        setMessage('');
      }
    } catch {
      setError('Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 sm:px-10 py-16 sm:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        <div className="lg:col-span-5 space-y-8">
          <div>
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#6E6257]">
              Maison Ferya
            </span>
            <h1 className="font-editorial text-4xl sm:text-5xl text-[#1C1917] mt-2">
              {copy.contact.title}
            </h1>
            <p className="text-sm text-[#6E6257] mt-4 leading-relaxed">
              {copy.contact.subtitle}
            </p>
          </div>

          <div className="border-t border-[#E3DBD0] pt-6 space-y-4 text-sm">
            <h2 className="text-xs uppercase tracking-[0.16em] text-[#6E6257] font-sans">
              {copy.contact.atelierInfoTitle}
            </h2>
            <p className="text-[#1C1917]">{copy.contact.atelierAddress}</p>
            <p className="text-[#6E6257]">{copy.contact.atelierHours}</p>
            <p className="text-[#1C1917] underline underline-offset-4">
              {copy.contact.atelierEmail}
            </p>
          </div>
        </div>

        <div className="lg:col-span-7 bg-[#F2EDE6] border border-[#E3DBD0] p-6 sm:p-10">
          {reference ? (
            <div className="py-12 space-y-4">
              <div className="flex items-center gap-3 text-[#1C1917]">
                <CheckCircle2 className="w-6 h-6 stroke-[1.5]" />
                <h2 className="font-editorial text-3xl">{copy.contact.successTitle}</h2>
              </div>
              <p className="text-sm text-[#4C433B] leading-relaxed">
                {copy.contact.successBody(reference)}
              </p>
              <button
                type="button"
                onClick={() => setReference(null)}
                className="mt-4 px-6 py-3 border border-[#1C1917] text-xs uppercase tracking-[0.16em] hover:bg-[#1C1917] hover:text-[#FAF8F5] transition-colors"
              >
                {language === 'fr' ? 'Nouveau message' : 'Send another message'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs uppercase tracking-[0.14em] text-[#6E6257] mb-2">
                  {copy.contact.name}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#D8CFC2] px-4 py-3 text-sm text-[#1C1917]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-[0.14em] text-[#6E6257] mb-2">
                  {copy.contact.email}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#D8CFC2] px-4 py-3 text-sm text-[#1C1917]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-[0.14em] text-[#6E6257] mb-2">
                  {copy.contact.subject}
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#D8CFC2] px-4 py-3 text-sm text-[#1C1917]"
                >
                  {copy.contact.subjects.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-[0.14em] text-[#6E6257] mb-2">
                  {copy.contact.message}
                </label>
                <textarea
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#D8CFC2] px-4 py-3 text-sm text-[#1C1917] resize-y"
                />
              </div>

              {error && <p className="text-xs text-[#7D2C22]">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-[#1C1917] text-[#FAF8F5] text-xs uppercase tracking-[0.18em] hover:bg-[#332E2A] disabled:opacity-50 transition-colors"
              >
                {submitting ? copy.contact.sending : copy.contact.send}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
