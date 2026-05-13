'use client';

import { useEffect, useState } from 'react';
import type { Guess } from '@/lib/types';
import { computeStats, formatDate, avgBirthDate } from '@/lib/stats';
import type { OddsRow } from '@/lib/stats';

function OddsTable({ rows, label, header, footer }: { rows: OddsRow[]; label: string; header?: React.ReactNode; footer?: React.ReactNode }) {
  const max = rows[0]?.pct ?? 1;
  return (
    <div className="h-full bg-white border border-gray-200 rounded-xl p-3 flex flex-col gap-2">
      <div className="text-sm font-bold tracking-widest text-gray-400 uppercase shrink-0">{label}</div>
      {header}
      {rows.length === 0 ? (
        <div className="text-gray-400 text-base">No data yet</div>
      ) : (
        rows.map((row, i) => (
          <div key={row.label} className="space-y-1">
            <div className="flex justify-between text-base">
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

function barColor(count: number, maxCount: number): string {
  if (count === 0 || maxCount === 0) return 'bg-gray-100';
  const r = count / maxCount;
  if (r <= 0.2) return 'bg-violet-200';
  if (r <= 0.4) return 'bg-violet-300';
  if (r <= 0.6) return 'bg-violet-400';
  if (r <= 0.8) return 'bg-violet-500';
  return 'bg-violet-600';
}

// Quarter-pound (4 oz) buckets from 5 lbs 0 oz to 10 lbs 8 oz
const WEIGHT_BUCKETS = (() => {
  const out: { label: string; lbs: number; ozMin: number; ozMax: number }[] = [];
  for (let lbs = 5; lbs <= 10; lbs++) {
    const maxOz = lbs === 10 ? 8 : 15;
    for (let oz = 0; oz <= maxOz; oz += 4) {
      out.push({ label: oz === 0 ? String(lbs) : '', lbs, ozMin: oz, ozMax: Math.min(oz + 3, maxOz) });
    }
  }
  return out;
})();

function WeightHistogram({ guesses, avgWeightLbs, avgWeightOz }: { guesses: Guess[]; avgWeightLbs: number; avgWeightOz: number }) {
  const buckets = WEIGHT_BUCKETS.map(b => ({
    ...b,
    count: guesses.filter(g => g.weight_lbs === b.lbs && g.weight_oz >= b.ozMin && g.weight_oz <= b.ozMax).length,
  }));

  const maxCount = Math.max(...buckets.map(b => b.count), 1);
  const total = guesses.length;

  return (
    <div className="h-full bg-white border border-gray-200 rounded-xl p-3 flex flex-col">
      <div className="text-sm font-bold tracking-widest text-gray-400 uppercase shrink-0 mb-2">Weight Distribution</div>

      <div className="shrink-0 border-b border-gray-100 pb-2 mb-2 space-y-0.5">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Ben&apos;s birth weight</span>
          <span className="text-gray-700 tabular-nums font-medium">7 lbs 11 oz</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Tess&apos;s birth weight</span>
          <span className="text-gray-700 tabular-nums font-medium">8 lbs 4 oz</span>
        </div>
      </div>

      {total === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col gap-1">
          {/* Bars */}
          <div className="flex-1 min-h-0 flex items-end gap-px">
{buckets.map((b, i) => {
              const pct = total > 0 ? Math.round((b.count / total) * 100) : 0;
              const heightPct = (b.count / maxCount) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-0.5">
                  {b.count > 0 && (
                    <span className="text-[9px] leading-none text-gray-500 tabular-nums">{pct}%</span>
                  )}
                  <div
                    className={`w-full rounded-t-sm transition-all duration-500 ${barColor(b.count, maxCount)}`}
                    style={{ height: `${heightPct}%`, minHeight: b.count > 0 ? '3px' : '0px' }}
                  />
                </div>
              );
            })}
          </div>
          {/* X-axis labels — only show at full-pound boundaries */}
          <div className="shrink-0 flex gap-px">
            {buckets.map((b, i) => (
              <div key={i} className="flex-1 text-center text-[10px] text-gray-400 leading-tight">{b.label}</div>
            ))}
          </div>
          <div className="shrink-0 text-center text-[10px] text-gray-400">lbs</div>
        </div>
      )}

      {total > 0 && (
        <div className="shrink-0 border-t border-gray-100 pt-2 mt-2 flex justify-between text-sm">
          <span className="text-gray-400">Avg guess</span>
          <span className="text-gray-700 tabular-nums font-medium">{avgWeightLbs} lbs {avgWeightOz} oz</span>
        </div>
      )}
    </div>
  );
}

// Half-inch buckets from 17" to 22"
const LENGTH_BUCKETS = (() => {
  const out: { label: string; value: number }[] = [];
  for (let v = 17; v <= 22; v += 0.5) {
    out.push({ label: v % 1 === 0 ? String(v) : '', value: v });
  }
  return out;
})();

function LengthHistogram({ guesses, avgLengthIn }: { guesses: Guess[]; avgLengthIn: number }) {
  const buckets = LENGTH_BUCKETS.map(b => ({
    ...b,
    count: guesses.filter(g => Math.abs(g.length_in - b.value) < 0.01).length,
  }));

  const maxCount = Math.max(...buckets.map(b => b.count), 1);
  const total = guesses.length;

  return (
    <div className="h-full bg-white border border-gray-200 rounded-xl p-3 flex flex-col">
      <div className="text-sm font-bold tracking-widest text-gray-400 uppercase shrink-0 mb-3">Length Distribution</div>

      {total === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col gap-1">
          <div className="flex-1 min-h-0 flex items-end gap-px">
            {buckets.map((b, i) => {
              const pct = total > 0 ? Math.round((b.count / total) * 100) : 0;
              const heightPct = (b.count / maxCount) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-0.5">
                  {b.count > 0 && (
                    <span className="text-[9px] leading-none text-gray-500 tabular-nums">{pct}%</span>
                  )}
                  <div
                    className={`w-full rounded-t-sm transition-all duration-500 ${barColor(b.count, maxCount)}`}
                    style={{ height: `${heightPct}%`, minHeight: b.count > 0 ? '3px' : '0px' }}
                  />
                </div>
              );
            })}
          </div>
          <div className="shrink-0 flex gap-px">
            {buckets.map((b, i) => (
              <div key={i} className="flex-1 text-center text-[10px] text-gray-400 leading-tight">{b.label}</div>
            ))}
          </div>
          <div className="shrink-0 text-center text-[10px] text-gray-400">inches</div>
        </div>
      )}

      {total > 0 && (
        <div className="shrink-0 border-t border-gray-100 pt-2 mt-2 flex justify-between text-sm">
          <span className="text-gray-400">Avg guess</span>
          <span className="text-gray-700 tabular-nums font-medium">{avgLengthIn}&quot;</span>
        </div>
      )}
    </div>
  );
}

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

// Light shades need dark text for contrast; dark shades use white
function pctTextColor(count: number, total: number): string {
  if (count === 0 || total === 0) return 'text-gray-400';
  const pct = count / total;
  if (pct < 0.12) return 'text-violet-800';
  return 'text-white';
}

const GRID_START = '2026-07-18';
const GRID_DAYS  = 35;
const DAY_HEADERS = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

function DateCell({ day, count, total }: { day: Date; count: number; total: number }) {
  const dateStr = toIso(day);
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const isDue = dateStr === DUE_DATE;
  return (
    <div
      title={`${formatDate(dateStr)}: ${count} guess${count !== 1 ? 'es' : ''} (${pct}%)`}
      className={[
        'flex flex-col items-center justify-center rounded text-center transition-colors duration-500',
        isDue
          ? `ring-4 ring-amber-400 ring-offset-1 ring-offset-white ${squareBg(count, total)}`
          : squareBg(count, total),
      ].join(' ')}
    >
      <>
        <span className={`text-sm leading-none font-bold ${count > 0 ? pctTextColor(count, total) : 'text-gray-400'}`}>{day.getDate()}</span>
        {pct > 0 && <span className={`text-xs leading-none font-bold mt-0.5 ${pctTextColor(count, total)}`}>{pct}%</span>}
      </>
    </div>
  );
}


function BirthDateGrid({ guesses }: { guesses: Guess[] }) {
  const counts: Record<string, number> = {};
  for (const g of guesses) counts[g.birth_date] = (counts[g.birth_date] ?? 0) + 1;
  const total = guesses.length;

  const start = toLocalDate(GRID_START);
  const days = Array.from({ length: GRID_DAYS }, (_, i) => {
    const d = new Date(start); d.setDate(start.getDate() + i); return d;
  });

  // Split into named rows so they can each be flex-1 siblings — guarantees equal height
  const [julRow1, julRow2, augRow1, augRow2, augRow3] = [
    days.slice(0, 7), days.slice(7, 14), days.slice(14, 21), days.slice(21, 28), days.slice(28, 35),
  ];

  const Row = ({ ds }: { ds: Date[] }) => (
    <div className="flex-1 min-h-0 grid grid-cols-7 gap-1">
      {ds.map(day => <DateCell key={toIso(day)} day={day} count={counts[toIso(day)] ?? 0} total={total} />)}
    </div>
  );

  return (
    <div className="h-full bg-white border border-gray-200 rounded-xl p-3 flex flex-col">
      <div className="shrink-0 text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Birth Date</div>

      {/* Day-of-week headers + July label */}
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

      {/* All 5 date rows as flex-1 siblings → guaranteed equal height */}
      <div className="flex-1 min-h-0 flex flex-col gap-1">
        <Row ds={julRow1} />
        <Row ds={julRow2} />
        {/* August divider sits between rows, not inside one */}
        <div className="shrink-0 flex items-center gap-2">
          <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">August</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <Row ds={augRow1} />
        <Row ds={augRow2} />
        <Row ds={augRow3} />
      </div>

      <div className="shrink-0 mt-2 pt-2 border-t border-gray-200 flex items-center gap-3 text-[10px] text-gray-400">
        <div className="flex items-center gap-1.5 shrink-0 text-[12px]">
          <div className="w-3.5 h-3.5 rounded-sm ring-2 ring-amber-400 bg-gray-100" />
          <span>Due Date (Aug 8)</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5 shrink-0">
          <span className="shrink-0">None</span>
          <div className="flex gap-0.5">
            {['bg-gray-100','bg-violet-200','bg-violet-300','bg-violet-400','bg-violet-500','bg-violet-600'].map((bg, i) => (
              <div key={i} className={`w-3 h-2.5 rounded-sm ${bg}`} />
            ))}
          </div>
          <span className="shrink-0">Popular</span>
        </div>
      </div>
      {total > 0 && (
        <div className="shrink-0 border-t border-gray-100 pt-2 mt-2 flex justify-between text-sm">
          <span className="text-gray-400">Avg guess</span>
          <span className="text-gray-700 tabular-nums font-medium">{avgBirthDate(guesses)}</span>
        </div>
      )}
    </div>
  );
}

export default function GuessFeedDev({ initialGuesses }: { initialGuesses: Guess[] }) {
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

  return (
    <div className="h-full flex flex-col gap-2">

      {/* Header */}
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

      {/* Row 1: Gender + Calendar — equal 50/50, fills available height */}
      <div className="flex-1 min-h-0 flex gap-2">

        {/* Gender panel */}
        <div className="flex-1 min-w-0 bg-gradient-to-br from-white to-violet-50 border border-violet-100 rounded-xl p-4 flex flex-col">
          <div className="flex-1 min-h-0 grid grid-cols-2 gap-3">

            {/* Boy card */}
            <div className={`rounded-xl p-4 border-2 flex flex-col items-center justify-center text-center transition-all ${boyLeads ? 'border-blue-300 bg-blue-50' : 'border-gray-100 bg-white'}`}>
              <div className="text-4xl mb-2">👦</div>
              <div className="text-xs font-bold tracking-widest uppercase mb-1 text-blue-500">Boy</div>
              <div className={`text-5xl font-black tabular-nums leading-none ${boyLeads ? 'text-gray-900' : 'text-gray-500'}`}>
                {stats.boyPct}<span className="text-2xl font-bold">%</span>
              </div>
              <div className={`text-sm mt-2 tabular-nums ${boyLeads ? 'text-gray-400' : 'text-gray-500'}`}>{stats.boyCt} entries</div>
              {boyLeads && stats.total > 0 && <div className="mt-2 text-xs text-violet-600 font-bold tracking-wider">▲ FAVORITE</div>}
            </div>

            {/* Girl card */}
            <div className={`rounded-xl p-4 border-2 flex flex-col items-center justify-center text-center transition-all ${!boyLeads ? 'border-pink-300 bg-pink-50' : 'border-gray-100 bg-white'}`}>
              <div className="text-4xl mb-2">👧</div>
              <div className="text-xs font-bold tracking-widest uppercase mb-1 text-pink-500">Girl</div>
              <div className={`text-5xl font-black tabular-nums leading-none ${!boyLeads ? 'text-gray-900' : 'text-gray-500'}`}>
                {stats.girlPct}<span className="text-2xl font-bold">%</span>
              </div>
              <div className={`text-sm mt-2 tabular-nums ${!boyLeads ? 'text-gray-400' : 'text-gray-500'}`}>{stats.girlCt} entries</div>
              {!boyLeads && stats.total > 0 && <div className="mt-2 text-xs text-violet-600 font-bold tracking-wider">▲ FAVORITE</div>}
            </div>
          </div>

          {/* Bar */}
          <div className="shrink-0 mt-3">
            <div className="h-3 rounded-full overflow-hidden flex bg-pink-300">
              <div className="h-full bg-blue-400 transition-all duration-700" style={{ width: `${stats.boyPct}%` }} />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>BOY {stats.boyPct}%</span>
              <span>GIRL {stats.girlPct}%</span>
            </div>
          </div>
        </div>

        {/* Birth Date Grid */}
        <div className="flex-1 min-w-0 min-h-0">
          <BirthDateGrid guesses={guesses} />
        </div>
      </div>

      {/* Row 2: Recent + Weight + Length — equal height to row 1 */}
      <div className="flex-1 min-h-0 grid grid-cols-3 gap-2">

        <WeightHistogram guesses={guesses} avgWeightLbs={stats.avgWeightLbs} avgWeightOz={stats.avgWeightOz} />
        <LengthHistogram guesses={guesses} avgLengthIn={stats.avgLengthIn} />

        {/* Recent Activity */}
        <div className="h-full bg-white border border-gray-200 rounded-xl p-3 flex flex-col">
          <div className="shrink-0 text-sm font-bold tracking-widest text-gray-400 uppercase mb-2">Recent Activity</div>
          {recent.length === 0 ? (
            <div className="text-gray-400 text-base">No entries yet</div>
          ) : (
            <div className="flex flex-col gap-2">
              {recent.map((g) => (
                <div key={g.id} className="flex items-center gap-2 text-sm">
                  <span className="text-gray-800 font-medium truncate flex-1">{g.name}</span>
                  <span className="flex items-center gap-1 shrink-0">
                    <span>{g.gender === 'boy' ? '👦' : '👧'}</span>
                    <span className="text-gray-200">|</span>
                    <span className="text-gray-400">{formatDate(g.birth_date)}</span>
                  </span>
                  <span className="text-gray-200 shrink-0">|</span>
                  <span className="text-gray-400 tabular-nums shrink-0">{g.weight_lbs} lbs {g.weight_oz} oz</span>
                  <span className="text-gray-200 shrink-0">|</span>
                  <span className="text-gray-400 tabular-nums shrink-0">{g.length_in}&quot;</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
