import { getDb } from '@/db';
import type { Guess } from '@/lib/types';
import GuessFeed from '@/components/Dashboard/GuessFeed';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const guesses = getDb().prepare('SELECT * FROM guesses ORDER BY created_at DESC').all() as Guess[];

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">🍼 Baby Bets Dashboard</h1>
          <p className="text-gray-500 mt-2">Live guesses as they come in</p>
        </div>
        <GuessFeed initialGuesses={guesses} />
      </div>
    </main>
  );
}
