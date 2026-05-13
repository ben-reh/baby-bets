'use client';

import { useState } from 'react';

type Status = 'idle' | 'submitting' | 'success' | 'error';

interface FormState {
  name: string;
  gender: 'boy' | 'girl' | '';
  weight_lbs: string;
  weight_oz: string;
  birth_date: string;
  length_in: string;
}

const empty: FormState = {
  name: '',
  gender: '',
  weight_lbs: '',
  weight_oz: '',
  birth_date: '2026-08-08',
  length_in: '',
};

import { MIN_DATE, MAX_DATE, validateGuess } from '@/lib/validation';

function InfoIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
    </svg>
  );
}

export default function GuessForm() {
  const [form, setForm] = useState<FormState>(empty);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [modalErrors, setModalErrors] = useState<string[] | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const set = (field: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.gender) { setError('Please pick boy or girl!'); return; }

    const errors = validateGuess(form);
    if (errors.length > 0) {
      setModalErrors(errors);
      return;
    }

    setStatus('submitting');
    setError('');

    try {
      const res = await fetch('/api/guesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          gender: form.gender,
          weight_lbs: parseInt(form.weight_lbs),
          weight_oz: parseInt(form.weight_oz),
          birth_date: form.birth_date,
          length_in: parseFloat(form.length_in),
        }),
      });
      let data: { error?: string; ok?: boolean; id?: string } = {};
      try { data = await res.json(); } catch { /* non-JSON response */ }
      if (!res.ok) { setError(data.error ?? `Server error (${res.status})`); setStatus('error'); return; }
      setStatus('success');
    } catch {
      setError('Network error — please try again');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-16 px-6">
        <div className="text-7xl mb-6">🎉</div>
        <h2 className="text-3xl font-bold text-gray-800 mb-3">You&apos;re entered!</h2>
        <p className="text-gray-500 mb-8 text-lg">Good luck — may your guess be right!</p>
        <a
          href="/dashboard"
          className="inline-block bg-purple-500 text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-purple-600 transition"
        >
          See the leaderboard 📊
        </a>
      </div>
    );
  }

  const inputClass = 'w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 text-base';

  return (
    <>
      {/* Info modal */}
      {showInfo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowInfo(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">About these ranges</h3>
            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <div className="font-semibold text-gray-800 mb-1">📅 Birth date</div>
                <p>
                  The due date is <strong>August 8</strong>. Full-term babies can arrive up to
                  3 weeks early or 2 weeks late — about 70% arrive within 10 days of their due
                  date. Guesses are open from <strong>Jul 18 to Aug 21</strong>.
                </p>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <div className="font-semibold text-gray-800 mb-1">⚖️ Weight</div>
                <p>
                  The average newborn weighs about <strong>7 lbs 8 oz</strong>. Healthy babies
                  typically land between <strong>5 lbs 8 oz and 9 lbs 15 oz</strong>. Babies
                  born a bit early tend to weigh less; babies born late a bit more.
                </p>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <div className="font-semibold text-gray-800 mb-1">📏 Length</div>
                <p>
                  Most newborns measure between <strong>18 and 21 inches</strong>, with an
                  average of about <strong>19.5 inches</strong>. Length scales with gestational
                  age — earlier arrivals are usually shorter.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowInfo(false)}
              className="mt-5 w-full bg-purple-500 text-white py-2.5 rounded-xl font-semibold hover:bg-purple-600 transition"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Validation error modal */}
      {modalErrors && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-1">Invalid guess</h3>
            <p className="text-sm text-gray-500 mb-4">Please fix the following before submitting:</p>
            <ul className="space-y-2 mb-6">
              {modalErrors.map((err, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-700">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  {err}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setModalErrors(null)}
              className="w-full bg-purple-500 text-white py-2.5 rounded-xl font-semibold hover:bg-purple-600 transition"
            >
              Fix my guess
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Your name</label>
          <input
            type="text"
            required
            placeholder="e.g. Aunt Sarah"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Boy or girl?</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => set('gender', 'boy')}
              className={`py-4 rounded-2xl text-xl font-bold border-2 transition ${
                form.gender === 'boy'
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-blue-500 border-blue-200 hover:border-blue-400'
              }`}
            >
              👦 Boy
            </button>
            <button
              type="button"
              onClick={() => set('gender', 'girl')}
              className={`py-4 rounded-2xl text-xl font-bold border-2 transition ${
                form.gender === 'girl'
                  ? 'bg-pink-500 text-white border-pink-500'
                  : 'bg-white text-pink-500 border-pink-200 hover:border-pink-400'
              }`}
            >
              👧 Girl
            </button>
          </div>
        </div>

        {/* Birth date */}
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-sm font-semibold text-gray-600">Birth date</span>
            <button
              type="button"
              onClick={() => setShowInfo(true)}
              className="text-gray-400 hover:text-purple-500 transition"
              aria-label="About birth date ranges"
            >
              <InfoIcon />
            </button>
          </div>
          <input
            type="date"
            required
            min={MIN_DATE}
            max={MAX_DATE}
            value={form.birth_date}
            onChange={(e) => set('birth_date', e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Weight */}
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-sm font-semibold text-gray-600">Birth weight</span>
            <button
              type="button"
              onClick={() => setShowInfo(true)}
              className="text-gray-400 hover:text-purple-500 transition"
              aria-label="About weight ranges"
            >
              <InfoIcon />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <input
                type="number"
                required
                min={5}
                max={10}
                placeholder="7"
                value={form.weight_lbs}
                onChange={(e) => set('weight_lbs', e.target.value)}
                className={inputClass + ' pr-12'}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">lbs</span>
            </div>
            <div className="relative">
              <input
                type="number"
                required
                min={0}
                max={15}
                placeholder="4"
                value={form.weight_oz}
                onChange={(e) => set('weight_oz', e.target.value)}
                className={inputClass + ' pr-12'}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">oz</span>
            </div>
          </div>
        </div>

        {/* Length */}
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-sm font-semibold text-gray-600">Length</span>
            <button
              type="button"
              onClick={() => setShowInfo(true)}
              className="text-gray-400 hover:text-purple-500 transition"
              aria-label="About length ranges"
            >
              <InfoIcon />
            </button>
          </div>
          <div className="relative">
            <input
              type="number"
              required
              min={17}
              max={22}
              step={0.5}
              placeholder="20"
              value={form.length_in}
              onChange={(e) => set('length_in', e.target.value)}
              className={inputClass + ' pr-16'}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">inches</span>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full bg-purple-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-purple-600 disabled:opacity-50 transition"
        >
          {status === 'submitting' ? 'Submitting…' : 'Submit my guess! 🍼'}
        </button>
      </form>
    </>
  );
}
