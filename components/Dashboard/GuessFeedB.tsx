'use client';

// Option B: Three-Column Horizontal — date grid dominates the center, gender+recent
// on the left, weight+length odds on the right. Fills the full viewport height.
// Requires page.tsx to use h-screen flex flex-col (see comment there).

import { useEffect, useState } from 'react';
import type { Guess } from '@/lib/types';
import { computeStats, weightOdds, lengthOdds, formatDate } from '@/lib/stats';
import type { OddsRow } from '@/lib/stats';

function OddsPanel({ rows, label, header, footer }: { rows: OddsRow[]; label: string; header?: React.ReactNode; footer?: React.ReactNode }) {
  const max = rows[0]?.pct ?? 1;
  return (
    <div className="flex-1 min-h-0 bg-white border border-gray-200 rounded-xl p-3 flex flex-col gap-2 overflow-hidden">
      <div className="text-xs font-bold tracking-widest text-gray-400 uppercase shrink-0">{label}</div>
      {header}
      {rows.length === 0 ? (
        <div className="text-gray-400 text-sm">No data yet</div>
      ) : (
        <div className="flex flex-col gap-2 overflow-y-auto min-h-0">
          {rows.map((row, i) => (
            <div key={row.label} className="space-y-0.5 shrink-0">
              <div className="flex justify-between text-sm">
                <span className={i === 0 ? 'text-violet-700 font-bold' : 'text-gray-600'}>{row.label}</span>
                <span className={`font-bold tabular-nums ${i === 0 ? 'text-violet-700' : 'text-gray-400'}`}>
                  {row.pct}%
                  <span className="text-gray-400 font-normal ml-1">({row.count})</span>
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${i === 0 ? 'bg-violet-500' : 'bg-gray-300'}`}
                  style={{ width: `${(row.pct / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
      {footer && <div className="shrink-0">{footer}</div>}
    </div>
  );
}

const DUE_DATE = '2026-08-08';

function toLocalDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function toIso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function squareBg(count: number, total: number): string {
  if (count === 0 || total === 0) return 'bg-gray-100';
  const pct = count / total;
  if (pct < 0.05) return 'bg-violet-200';
  if (pct < 0.12) return 'bg-violet-300';
  if (pct < 0.22) return 'bg-violet-400';
  if (pct < 0.35) return 'bg-violet-500';
  return 'bg-violet-600';
}

const GRID_START = '2026-07-18';
const GRID_DAYS  = 35;
const DAY_HEADERS = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

function BirthDateGrid({ guesses }: { guesses: Guess[] }) {
  const counts: Record<string, number> = {};
  for (const g of guesses) counts[g.birth_date] = (counts[g.birth_date] ?? 0) + 1;
  const total = guesses.length;

  const start = toLocalDate(GRID_START);
  const days = Array.from({ length: GRID_DAYS }, (_, i) => {
    const d = new Date(start); d.setDate(start.getDate() + i); return d;
  });
  const rows: Date[][] = Array.from({ length: 5 }, (_, i) => days.slice(i * 7, i * 7 + 7));

  return (
    <div className="flex-1 min-h-0 bg-white border border-gray-200 rounded-xl p-3 flex flex-col overflow-hidden">
      <div className="shrink-0 mb-2">
        <div className="text-xs font-bold tracking-widest text-gray-400 uppercase">Birth Date</div>
        {total === 0 && <p className="text-gray-400 text-xs mt-1">No guesses yet</p>}
      </div>

      {/* Day headers + July label */}
      <div className="shrink-0 mb-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">July</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <div className="grid grid-cols-7 gap-1">
          {DAY_HEADERS.map(d => (
            <div key={d} className="text-center text-[10px] font-semibold text-gray-400 uppercase">{d}</div>
          ))}
        </div>
      </div>

      {/* Rows — flex-1 so they fill remaining height equally */}
      <div className="flex-1 min-h-0 flex flex-col gap-1">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className={rowIdx === 2 ? 'flex flex-col flex-1 min-h-0' : 'flex-1 min-h-0'}>
            {rowIdx === 2 && (
              <div className="flex items-center gap-2 mb-1 shrink-0">
                <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">August</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
            )}
            <div className="flex-1 min-h-0 grid grid-cols-7 gap-1">
              {row.map((day) => {
                const dateStr = toIso(day);
                const count = counts[dateStr] ?? 0;
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                const isDue = dateStr === DUE_DATE;
                return (
                  <div
                    key={dateStr}
                    title={`${formatDate(dateStr)}: ${count} guess${count !== 1 ? 'es' : ''} (${pct}%)`}
                    className={[
                      'flex flex-col items-center justify-center rounded text-center transition-colors duration-500',
                      isDue
                        ? 'bg-amber-400 ring-2 ring-amber-600 ring-offset-1 ring-offset-white shadow-[0_0_12px_3px_rgba(251,191,36,0.35)]'
                        : squareBg(count, total),
                    ].join(' ')}
                  >
                    {isDue ? (
                      <>
                        <span className="text-[9px] leading-none font-black text-amber-900 uppercase tracking-wider mb-0.5">DUE</span>
                        <span className="text-sm leading-none font-black text-white">{day.getDate()}</span>
                        {pct > 0 && <span className="text-[10px] leading-none font-bold text-amber-100 mt-0.5">{pct}%</span>}
                      </>
                    ) : (
                      <>
                        <span className={`text-sm leading-none font-bold ${count > 0 ? 'text-white' : 'text-gray-400'}`}>{day.getDate()}</span>
                        {pct > 0 && <span className="text-[11px] leading-none font-semibold text-white/90 mt-0.5">{pct}%</span>}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="shrink-0 mt-2 pt-2 border-t border-gray-200 flex items-center gap-3 text-[10px] text-gray-400">
        <div className="flex items-center gap-1 flex-1">
          <span className="shrink-0">None</span>
          <div className="flex gap-0.5 mx-1">
            {['bg-gray-100','bg-violet-200','bg-violet-300','bg-violet-400','bg-violet-500','bg-violet-600'].map((bg, i) => (
              <div key={i} className={`w-4 h-3 rounded-sm ${bg}`} />
            ))}
          </div>
          <span className="shrink-0">Popular</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <div className="w-4 h-4 rounded-sm bg-amber-400 ring-1 ring-amber-600" />
          <span>Due date (Aug 8)</span>
        </div>
      </div>
    </div>
  );
}

export default function GuessFeedB({ initialGuesses }: { initialGuesses: Guess[] }) {
  const [guesses, setGuesses] = useState<Guess[]>(initialGuesses);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch('/api/guesses');
        const data: Guess[] = await res.json();
        setGuesses(data);
        setLastUpdate(new Date());
      } catch { /* retry on next interval */ }
    };
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, []);

  const stats = computeStats(guesses);
  const recent = guesses.slice(0, 8);
  const boyLeads = stats.boyPct >= stats.girlPct;

  const weightHeader = (
    <div className="border-b border-gray-100 pb-2 mb-0.5 space-y-0.5 shrink-0">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">Ben&apos;s birth weight</span>
        <span className="text-gray-700 tabular-nums font-medium">7 lbs 11 oz</span>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">Tess&apos;s birth weight</span>
        <span className="text-gray-700 tabular-nums font-medium">8 lbs 4 oz</span>
      </div>
    </div>
  );

  const weightFooter = stats.total > 0 ? (
    <div className="border-t border-gray-100 pt-2 flex justify-between text-xs">
      <span className="text-gray-400">Avg guess</span>
      <span className="text-gray-700 tabular-nums font-medium">{stats.avgWeightLbs} lbs {stats.avgWeightOz} oz</span>
    </div>
  ) : null;

  const lengthFooter = stats.total > 0 ? (
    <div className="border-t border-gray-100 pt-2 flex justify-between text-xs">
      <span className="text-gray-400">Avg guess</span>
      <span className="text-gray-700 tabular-nums font-medium">{stats.avgLengthIn}&quot;</span>
    </div>
  ) : null;

  return (
    <div className="h-full flex flex-col gap-2">
      {/* Header bar */}
      <div className="shrink-0 flex items-center justify-between border-b border-gray-200 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">🍼</span>
          <span className="text-base font-bold tracking-wider text-gray-900">BABY BETS</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="tabular-nums font-medium">{stats.total} ENTRIES</span>
          <span className="flex items-center gap-1 text-violet-600 font-semibold">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
            LIVE
          </span>
        </div>
      </div>

      {/* Three-column body */}
      <div className="flex-1 min-h-0 flex gap-3">

        {/* Left: Gender + Recent Activity */}
        <div className="w-64 shrink-0 flex flex-col gap-2">

          {/* Gender — compact two-card */}
          <div className="shrink-0 bg-gradient-to-br from-white to-violet-50 border border-violet-100 rounded-xl p-3">
            <div className="text-xs font-bold text-violet-700 mb-2">Gender split</div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className={`rounded-lg p-2 border text-center transition-all ${boyLeads ? 'border-blue-300 bg-blue-50' : 'border-gray-100 bg-white opacity-75'}`}>
                <div className="text-xl leading-none mb-0.5">👦</div>
                <div className="text-3xl font-black tabular-nums text-gray-900 leading-none">
                  {stats.boyPct}<span className="text-base text-gray-400">%</span>
                </div>
                <div className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mt-0.5">Boy</div>
                <div className="text-[10px] text-gray-400 tabular-nums">{stats.boyCt} votes</div>
                {boyLeads && stats.total > 0 && <div className="text-[9px] text-violet-600 font-bold tracking-wider mt-0.5">▲ FAVORITE</div>}
              </div>
              <div className={`rounded-lg p-2 border text-center transition-all ${!boyLeads ? 'border-pink-300 bg-pink-50' : 'border-gray-100 bg-white opacity-75'}`}>
                <div className="text-xl leading-none mb-0.5">👧</div>
                <div className="text-3xl font-black tabular-nums text-gray-900 leading-none">
                  {stats.girlPct}<span className="text-base text-gray-400">%</span>
                </div>
                <div className="text-[10px] text-pink-500 font-bold uppercase tracking-widest mt-0.5">Girl</div>
                <div className="text-[10px] text-gray-400 tabular-nums">{stats.girlCt} votes</div>
                {!boyLeads && stats.total > 0 && <div className="text-[9px] text-violet-600 font-bold tracking-wider mt-0.5">▲ FAVORITE</div>}
              </div>
            </div>
            <div className="h-2 rounded-full overflow-hidden flex bg-pink-200">
              <div className="h-full bg-blue-400 transition-all duration-700" style={{ width: `${stats.boyPct}%` }} />
            </div>
          </div>

          {/* Recent Activity — flex-1 to fill remaining left column */}
          <div className="flex-1 min-h-0 bg-white border border-gray-200 rounded-xl p-3 flex flex-col overflow-hidden">
            <div className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-2 shrink-0">Recent Activity</div>
            {recent.length === 0 ? (
              <div className="text-gray-400 text-sm">No entries yet</div>
            ) : (
              <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="flex flex-col gap-1.5">
                  {recent.map((g) => (
                    <div key={g.id} className="flex items-center gap-2 text-xs">
                      <span className={g.gender === 'boy' ? 'text-blue-500' : 'text-pink-500'}>
                        {g.gender === 'boy' ? '👦' : '👧'}
                      </span>
                      <span className="text-gray-800 font-medium truncate flex-1">{g.name}</span>
                      <span className="text-gray-400 tabular-nums shrink-0">{formatDate(g.birth_date)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Birth Date Grid */}
        <BirthDateGrid guesses={guesses} />

        {/* Right: Weight + Length odds */}
        <div className="w-64 shrink-0 flex flex-col gap-2">
          <OddsPanel rows={weightOdds(guesses)} label="Weight Odds" header={weightHeader} footer={weightFooter} />
          <OddsPanel rows={lengthOdds(guesses)} label="Length Odds" footer={lengthFooter} />
        </div>
      </div>
    </div>
  );
}
