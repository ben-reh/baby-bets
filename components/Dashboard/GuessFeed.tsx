'use client';

import { useEffect, useState } from 'react';
import type { Guess } from '@/lib/types';
import { computeStats } from '@/lib/stats';
import GuessCard from './GuessCard';
import StatsPanel from './StatsPanel';

export default function GuessFeed({ initialGuesses }: { initialGuesses: Guess[] }) {
  const [guesses, setGuesses] = useState<Guess[]>(initialGuesses);

  useEffect(() => {
    const es = new EventSource('/api/stream');

    es.onmessage = async () => {
      try {
        const res = await fetch('/api/guesses');
        const data: Guess[] = await res.json();
        setGuesses(data);
      } catch {
        // silently ignore fetch errors — will retry on next ping
      }
    };

    return () => es.close();
  }, []);

  const stats = computeStats(guesses);

  return (
    <div className="space-y-6">
      <StatsPanel stats={stats} />

      <div className="space-y-3">
        {guesses.length === 0 ? (
          <p className="text-center text-gray-400 py-8">Waiting for guesses…</p>
        ) : (
          guesses.map((g) => <GuessCard key={g.id} guess={g} />)
        )}
      </div>
    </div>
  );
}
