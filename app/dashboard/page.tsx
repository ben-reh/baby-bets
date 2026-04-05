import { getDb } from '@/db';
import type { Guess } from '@/lib/types';
import GuessFeed from '@/components/Dashboard/GuessFeed';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const guesses = getDb().prepare('SELECT * FROM guesses ORDER BY created_at DESC').all() as Guess[];

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-4 font-mono">
      <GuessFeed initialGuesses={guesses} />
    </main>
  );
}
