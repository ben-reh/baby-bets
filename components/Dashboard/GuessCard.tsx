import type { Guess } from '@/lib/types';
import { formatDate, formatTime } from '@/lib/stats';

export default function GuessCard({ guess }: { guess: Guess }) {
  const isBoy = guess.gender === 'boy';
  return (
    <div className={`rounded-2xl p-4 border-l-4 bg-white shadow-sm ${isBoy ? 'border-blue-400' : 'border-pink-400'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-gray-800 text-lg">{guess.name}</span>
        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${isBoy ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
          {isBoy ? '👦 Boy' : '👧 Girl'}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
        <div>
          <span className="text-xs text-gray-400 block">Weight</span>
          {guess.weight_lbs} lbs {guess.weight_oz} oz
        </div>
        <div>
          <span className="text-xs text-gray-400 block">Date</span>
          {formatDate(guess.birth_date)}
        </div>
        <div>
          <span className="text-xs text-gray-400 block">Time</span>
          {formatTime(guess.birth_time)}
        </div>
        <div>
          <span className="text-xs text-gray-400 block">Length</span>
          {guess.length_in}&quot;
        </div>
      </div>
    </div>
  );
}
