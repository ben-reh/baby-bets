import type { Stats } from '@/lib/types';
import { formatDate } from '@/lib/stats';

export default function StatsPanel({ stats }: { stats: Stats }) {
  if (stats.total === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 text-center text-gray-400">
        <div className="text-4xl mb-2">🍼</div>
        <p>No guesses yet — be the first!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {/* Total */}
      <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
        <div className="text-3xl font-bold text-purple-600">{stats.total}</div>
        <div className="text-sm text-gray-500 mt-1">Total Guesses</div>
      </div>

      {/* Gender split */}
      <div className="bg-white rounded-2xl p-5 shadow-sm col-span-2 lg:col-span-1">
        <div className="text-sm text-gray-500 mb-2">Gender Split</div>
        <div className="flex gap-2 items-center text-sm font-semibold mb-1">
          <span className="text-blue-600">👦 {stats.boyPct}%</span>
          <span className="text-gray-300">|</span>
          <span className="text-pink-500">👧 {stats.girlPct}%</span>
        </div>
        <div className="w-full h-3 rounded-full bg-pink-200 overflow-hidden">
          <div className="h-full bg-blue-400 rounded-full transition-all" style={{ width: `${stats.boyPct}%` }} />
        </div>
      </div>

      {/* Avg weight */}
      <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
        <div className="text-3xl font-bold text-green-600">{stats.avgWeightLbs}<span className="text-lg font-normal"> lbs </span>{stats.avgWeightOz}<span className="text-lg font-normal"> oz</span></div>
        <div className="text-sm text-gray-500 mt-1">Avg Weight</div>
      </div>

      {/* Avg length */}
      <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
        <div className="text-3xl font-bold text-orange-500">{stats.avgLengthIn}<span className="text-lg font-normal">&quot;</span></div>
        <div className="text-sm text-gray-500 mt-1">Avg Length</div>
      </div>

      {/* Most common date */}
      {stats.mostCommonDate && (
        <div className="bg-white rounded-2xl p-5 shadow-sm text-center col-span-2 lg:col-span-1">
          <div className="text-xl font-bold text-indigo-600">{formatDate(stats.mostCommonDate)}</div>
          <div className="text-sm text-gray-500 mt-1">Most Popular Date</div>
        </div>
      )}
    </div>
  );
}
