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

export default function GuessForm() {
  const [form, setForm] = useState<FormState>(empty);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  const set = (field: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.gender) { setError('Please pick boy or girl!'); return; }
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
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Something went wrong'); setStatus('error'); return; }
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
  const labelClass = 'block text-sm font-semibold text-gray-600 mb-1';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label className={labelClass}>Your name</label>
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
        <label className={labelClass}>Boy or girl?</label>
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

      {/* Weight */}
      <div>
        <label className={labelClass}>Birth weight</label>
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <input
              type="number"
              required
              min={1}
              max={20}
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

      {/* Birth date */}
      <div>
        <label className={labelClass}>Birth date</label>
        <input
          type="date"
          required
          value={form.birth_date}
          onChange={(e) => set('birth_date', e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Length */}
      <div>
        <label className={labelClass}>Length</label>
        <div className="relative">
          <input
            type="number"
            required
            min={10}
            max={30}
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
  );
}
