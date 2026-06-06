'use client';

import { useEffect, useState } from 'react';
import type { Guess } from '@/lib/types';
import { computeStats, weightOdds, lengthOdds, formatDate } from '@/lib/stats';
import type { OddsRow } from '@/lib/stats';

function OddsTable({ rows, label, header, footer }: { rows: OddsRow[]; label: string; header?: React.ReactNode; footer?: React.ReactNode }) {
  const max = rows[0]?.pct ?? 1;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3 shadow-sm">
      <div className="text-xs font-bold tracking-widest text-gray-400 uppercase">{label}</div>
      {header}
      {rows.length === 0 ? (
        <div className="text-gray-400 text-sm">No data yet</div>
      ) : (
        rows.map((row, i) => (
          <div key={row.label} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className={i === 0 ? 'text-violet-700 font-bold' : 'text-gray-600'}>{row.label}</span>
              <span className={`font-bold tabular-nums ${i === 0 ? 'text-violet-700' : 'text-gray-400'}`}>
                {row.pct}%
                <span className="text-gray-400 font-normal ml-1">({row.count})</span>
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${i === 0 ? 'bg-violet-500' : 'bg-gray-300'}`}
                style={{ width: `${(row.pct / max) * 100}%` }}
              />
            </div>
          </div>
        ))
      )}
      {footer}
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

// 5 rows × 7 = 35 squares: 2026-07-18 (Saturday) through 2026-08-21
const GRID_START = '2026-07-18';
const GRID_DAYS  = 35;

// July 18, 2026 is a Saturday — columns run Sat → Fri
const DAY_HEADERS = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

function BirthDateGrid({ guesses }: { guesses: Guess[] }) {
  const counts: Record<string, number> = {};
  for (const g of guesses) counts[g.birth_date] = (counts[g.birth_date] ?? 0) + 1;
  const total = guesses.length;

  const start = toLocalDate(GRID_START);
  const days: Date[] = Array.from({ length: GRID_DAYS }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });

  const rows: Date[][] = Array.from({ length: 5 }, (_, i) => days.slice(i * 7, i * 7 + 7));

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col shadow-sm">
      <div className="mb-3">
        <div className="text-xs font-bold tracking-widest text-gray-400 uppercase">Birth Date</div>
        <div className="text-[11px] text-gray-400 mt-0.5">Darker = more guesses</div>
      </div>
      {total === 0 && <p className="text-gray-400 text-xs mb-2">No guesses yet</p>}

      <div className="mb-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">July</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <div className="grid grid-cols-7 gap-1">
          {DAY_HEADERS.map(d => (
            <div key={d} className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">{d}</div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx}>
            {rowIdx === 2 && (
              <div className="flex items-center gap-2 mt-2 mb-1">
                <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">August</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
            )}
            <div className="grid grid-cols-7 gap-1">
              {row.map((day) => {
                const dateStr = toIso(day);
                const count = counts[dateStr] ?? 0;
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                const isDue = dateStr === DUE_DATE;
                const isPopulated = count > 0;

                return (
                  <div
                    key={dateStr}
                    title={`${formatDate(dateStr)}: ${count} guess${count !== 1 ? 'es' : ''} (${pct}%)`}
                    className={[
                      'flex flex-col items-center justify-center min-h-[50px] rounded text-center transition-colors duration-500',
                      isDue
                        ? 'bg-amber-400 ring-2 ring-amber-600 ring-offset-2 ring-offset-white shadow-[0_0_12px_3px_rgba(251,191,36,0.35)]'
                        : squareBg(count, total),
                    ].join(' ')}
                  >
                    {isDue ? (
                      <>
                        <span className="text-[10px] leading-none font-black text-amber-900 uppercase tracking-wider mb-0.5">DUE</span>
                        <span className="text-sm leading-none font-black text-white">{day.getDate()}</span>
                        {pct > 0 && (
                          <span className="text-[10px] leading-none font-bold text-amber-100 mt-0.5">{pct}%</span>
                        )}
                      </>
                    ) : (
                      <>
                        <span className={`text-xs leading-none font-bold ${isPopulated ? 'text-white' : 'text-gray-400'}`}>
                          {day.getDate()}
                        </span>
                        {pct > 0 && (
                          <span className="text-[11px] leading-none font-semibold text-white/90 mt-0.5">
                            {pct}%
                          </span>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200 flex items-center gap-4 text-[10px] text-gray-400">
        <div className="flex items-center gap-1.5 flex-1">
          <span className="shrink-0">None</span>
          <div className="flex gap-0.5 items-center mx-1">
            {['bg-gray-100', 'bg-violet-200', 'bg-violet-300', 'bg-violet-400', 'bg-violet-500', 'bg-violet-600'].map((bg, i) => (
              <div key={i} className={`w-4 h-3 rounded-sm ${bg}`} />
            ))}
          </div>
          <span className="shrink-0">Popular</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-4 h-4 rounded-sm bg-amber-400 ring-1 ring-amber-600" />
          <span>Due date (Aug 8)</span>
        </div>
      </div>
    </div>
  );
}

export default function GuessFeed({ initialGuesses }: { initialGuesses: Guess[] }) {
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
  const recent = guesses;
  const boyLeads = stats.boyPct >= stats.girlPct;

  const weightHeader = (
    <div className="border-b border-gray-100 pb-3 mb-1 space-y-1">
      <div className="flex justify-between text-[14px]">
        <span className="text-gray-400">Ben&apos;s birth weight</span>
        <span className="text-gray-700 tabular-nums font-medium">7 lbs 11 oz</span>
      </div>
      <div className="flex justify-between text-[14px]">
        <span className="text-gray-400">Tess&apos;s birth weight</span>
        <span className="text-gray-700 tabular-nums font-medium">8 lbs 4 oz</span>
      </div>
    </div>
  );

  const weightFooter = stats.total > 0 ? (
    <div className="border-t border-gray-100 pt-3 mt-1 flex justify-between text-xs">
      <span className="text-gray-400">Avg guess</span>
      <span className="text-gray-700 tabular-nums font-medium">{stats.avgWeightLbs} lbs {stats.avgWeightOz} oz</span>
    </div>
  ) : null;

  const lengthFooter = stats.total > 0 ? (
    <div className="border-t border-gray-100 pt-3 mt-1 flex justify-between text-xs">
      <span className="text-gray-400">Avg guess</span>
      <span className="text-gray-700 tabular-nums font-medium">{stats.avgLengthIn}&quot;</span>
    </div>
  ) : null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <div className="flex items-center gap-3">
          <span className="text-xl">🍼</span>
          <span className="text-lg font-bold tracking-wider text-gray-900">BABY BETS</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="tabular-nums font-medium">{stats.total} ENTRIES</span>
          <span className="flex items-center gap-1 text-violet-600 font-semibold">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
            LIVE
          </span>
        </div>
      </div>

      {/* Gender — hero panel */}
      <div className="bg-gradient-to-br from-white to-violet-50 border border-violet-100 rounded-xl p-5 shadow-sm">
        <div className="text-sm font-bold text-violet-700 mb-4">Who does everyone think it&apos;ll be?</div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className={`rounded-xl p-5 border-2 transition-all ${boyLeads ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white opacity-60'}`}>
            <div className="text-3xl mb-1">👦</div>
            <div className="text-blue-500 font-bold text-sm tracking-widest uppercase">Boy</div>
            <div className="text-5xl font-bold tabular-nums text-gray-900 mt-1">
              {stats.boyPct}<span className="text-2xl text-gray-400">%</span>
            </div>
            <div className="text-gray-400 text-sm mt-1 tabular-nums">{stats.boyCt} entries</div>
            {boyLeads && stats.total > 0 && <div className="mt-2 text-xs text-violet-600 font-bold tracking-wider">▲ FAVORITE</div>}
          </div>
          <div className={`rounded-xl p-5 border-2 transition-all ${!boyLeads ? 'border-pink-300 bg-pink-50' : 'border-gray-200 bg-white opacity-60'}`}>
            <div className="text-3xl mb-1">👧</div>
            <div className="text-pink-500 font-bold text-sm tracking-widest uppercase">Girl</div>
            <div className="text-5xl font-bold tabular-nums text-gray-900 mt-1">
              {stats.girlPct}<span className="text-2xl text-gray-400">%</span>
            </div>
            <div className="text-gray-400 text-sm mt-1 tabular-nums">{stats.girlCt} entries</div>
            {!boyLeads && stats.total > 0 && <div className="mt-2 text-xs text-violet-600 font-bold tracking-wider">▲ FAVORITE</div>}
          </div>
        </div>
        <div className="h-3 rounded-full overflow-hidden flex bg-pink-200">
          <div className="h-full bg-blue-400 transition-all duration-700" style={{ width: `${stats.boyPct}%` }} />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>BOY {stats.boyPct}%</span>
          <span>GIRL {stats.girlPct}%</span>
        </div>
      </div>

      {/* Odds tables — 3 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        <OddsTable rows={weightOdds(guesses)} label="Weight Odds" header={weightHeader} footer={weightFooter} />
        <BirthDateGrid guesses={guesses} />
        <OddsTable rows={lengthOdds(guesses)} label="Length Odds" footer={lengthFooter} />
      </div>

      {/* Recent activity */}
      {recent.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">Recent Activity</div>
          <div className="grid grid-cols-[1fr_60px_110px_90px] gap-x-4 gap-y-2 text-sm">
            <div className="text-xs text-gray-400 font-medium">Name</div>
            <div className="text-xs text-gray-400 font-medium">Gender</div>
            <div className="text-xs text-gray-400 font-medium">Weight</div>
            <div className="text-xs text-gray-400 font-medium">Date</div>
            {recent.map((g) => (
              <>
                <span key={`${g.id}-name`} className="text-gray-800 font-medium truncate">{g.name}</span>
                <span key={`${g.id}-gender`} className={`font-medium ${g.gender === 'boy' ? 'text-blue-500' : 'text-pink-500'}`}>
                  {g.gender === 'boy' ? '👦 Boy' : '👧 Girl'}
                </span>
                <span key={`${g.id}-weight`} className="text-gray-500 tabular-nums">{g.weight_lbs} lbs {g.weight_oz} oz</span>
                <span key={`${g.id}-date`} className="text-gray-500">{formatDate(g.birth_date)}</span>
              </>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
