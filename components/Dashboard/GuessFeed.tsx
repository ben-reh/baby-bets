'use client';

import { useEffect, useState } from 'react';
import type { Guess } from '@/lib/types';
import { computeStats, weightOdds, lengthOdds, formatDate } from '@/lib/stats';
import type { OddsRow } from '@/lib/stats';

function OddsTable({ rows, label, header, footer }: { rows: OddsRow[]; label: string; header?: React.ReactNode; footer?: React.ReactNode }) {
  const max = rows[0]?.pct ?? 1;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 flex flex-col gap-3">
      <div className="text-xs font-bold tracking-widest text-gray-400 uppercase">{label}</div>
      {header}
      {rows.length === 0 ? (
        <div className="text-gray-600 text-sm">No data yet</div>
      ) : (
        rows.map((row, i) => (
          <div key={row.label} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className={i === 0 ? 'text-green-400 font-bold' : 'text-gray-300'}>{row.label}</span>
              <span className={`font-bold tabular-nums ${i === 0 ? 'text-green-400' : 'text-gray-400'}`}>
                {row.pct}%
                <span className="text-gray-600 font-normal ml-1">({row.count})</span>
              </span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${i === 0 ? 'bg-green-500' : 'bg-gray-600'}`}
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

function barColor(count: number, max: number): string {
  if (count === 0) return 'bg-gray-800';
  const t = count / max;
  if (t <= 0.25) return 'bg-amber-800';
  if (t <= 0.5)  return 'bg-amber-600';
  if (t <= 0.75) return 'bg-amber-400';
  return 'bg-amber-300';
}

function BirthDateHistogram({ guesses }: { guesses: Guess[] }) {
  const counts: Record<string, number> = {};
  for (const g of guesses) counts[g.birth_date] = (counts[g.birth_date] ?? 0) + 1;
  const maxCount = Math.max(...Object.values(counts), 1);

  const due = toLocalDate(DUE_DATE);
  const defaultStart = new Date(due); defaultStart.setDate(due.getDate() - 14);
  const defaultEnd   = new Date(due); defaultEnd.setDate(due.getDate() + 14);

  let winStart = defaultStart;
  let winEnd   = defaultEnd;
  for (const g of guesses) {
    const d = toLocalDate(g.birth_date);
    if (d < winStart) winStart = d;
    if (d > winEnd)   winEnd   = d;
  }

  const days: Date[] = [];
  const cur = new Date(winStart);
  while (cur <= winEnd) { days.push(new Date(cur)); cur.setDate(cur.getDate() + 1); }

  const total = guesses.length;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-bold tracking-widest text-gray-400 uppercase">Birth Date</div>
        <div className="text-[14px] text-gray-500">Due Date: <span className="text-gray-300 font-medium">Aug 8</span></div>
      </div>
      {guesses.length === 0 ? (
        <div className="text-gray-600 text-sm">No data yet</div>
      ) : (
        <div className="flex flex-col flex-1 gap-1 min-h-0">
          {/* Bars */}
          <div className="flex gap-px flex-1 min-h-0">
            {days.map((day) => {
              const dateStr = toIso(day);
              const count = counts[dateStr] ?? 0;
              const pct = Math.round((count / total) * 100);
              const isDue = dateStr === DUE_DATE;
              return (
                <div
                  key={dateStr}
                  className="flex-1 flex flex-col relative min-w-0"
                  title={`${formatDate(dateStr)}: ${count} guess${count !== 1 ? 'es' : ''} (${pct}%)`}
                >
                  {isDue && <div className="absolute inset-x-0 top-0 bottom-0 border-x border-gray-500 border-dashed opacity-40 pointer-events-none" />}
                  {/* top spacer grows to push bar down proportionally */}
                  <div style={{ flexGrow: maxCount - count }} className="min-h-0" />
                  {count > 0 && (
                    <span className="text-[14px] leading-none text-amber-300 font-bold text-center block mb-0.5">{pct}%</span>
                  )}
                  {count > 0
                    ? <div style={{ flexGrow: count }} className={`w-full rounded-t-sm min-h-[4px] transition-all duration-500 ${barColor(count, maxCount)}`} />
                    : <div className="h-0.5 w-full bg-gray-800" />
                  }
                </div>
              );
            })}
          </div>
          {/* X-axis */}
          <div className="flex gap-px border-t border-gray-700 pt-1">
            {days.map((day, i) => {
              const dateStr = toIso(day);
              const isDue = dateStr === DUE_DATE;
              const isMonthStart = day.getDate() === 1;
              const diffFromDue = Math.round((day.getTime() - due.getTime()) / 86400000);
              const showEvery = i % 3 === 0 && Math.abs(diffFromDue) > 1;
              const label = isMonthStart
                ? day.toLocaleString('en-US', { month: 'short' })
                : (isDue || showEvery) ? String(day.getDate())
                : null;
              return (
                <div key={dateStr} className="flex-1 text-center overflow-hidden">
                  {label && (
                    <span className={`text-[12px] leading-none ${isDue ? 'text-white font-bold' : 'text-gray-500'}`}>
                      {label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function GuessFeed({ initialGuesses }: { initialGuesses: Guess[] }) {
  const [guesses, setGuesses] = useState<Guess[]>(initialGuesses);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const es = new EventSource('/api/stream');
    es.onmessage = async () => {
      try {
        const res = await fetch('/api/guesses');
        const data: Guess[] = await res.json();
        setGuesses(data);
        setLastUpdate(new Date());
      } catch { /* retry on next ping */ }
    };
    return () => es.close();
  }, []);

  const stats = computeStats(guesses);
  const recent = guesses.slice(0, 8);
  const boyLeads = stats.boyPct >= stats.girlPct;

  const weightHeader = (
    <div className="border-b border-gray-700 pb-3 mb-1 space-y-1">
      <div className="flex justify-between text-[14px]">
        <span className="text-gray-500">Ben&apos;s birth weight</span>
        <span className="text-gray-300 tabular-nums font-medium">7 lbs 11 oz</span>
      </div>
      <div className="flex justify-between text-[14px]">
        <span className="text-gray-500">Tess&apos;s birth weight</span>
        <span className="text-gray-300 tabular-nums font-medium">8 lbs 4 oz</span>
      </div>
    </div>
  );

  const weightFooter = stats.total > 0 ? (
    <div className="border-t border-gray-700 pt-3 mt-1 flex justify-between text-xs">
      <span className="text-gray-500">Avg guess</span>
      <span className="text-gray-300 tabular-nums font-medium">{stats.avgWeightLbs} lbs {stats.avgWeightOz} oz</span>
    </div>
  ) : null;

  const lengthFooter = stats.total > 0 ? (
    <div className="border-t border-gray-700 pt-3 mt-1 flex justify-between text-xs">
      <span className="text-gray-500">Avg guess</span>
      <span className="text-gray-300 tabular-nums font-medium">{stats.avgLengthIn}&quot;</span>
    </div>
  ) : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-700 pb-3">
        <div className="flex items-center gap-3">
          <span className="text-xl">🍼</span>
          <span className="text-lg font-bold tracking-wider text-white">BABY BETS MARKET</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="tabular-nums">{stats.total} ENTRIES</span>
          <span className="text-gray-600">|</span>
          <span>UPDATED {lastUpdate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          <span className="flex items-center gap-1 text-green-400">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            LIVE
          </span>
        </div>
      </div>

      {/* Gender market */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
        <div className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-4">Gender Market</div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className={`rounded-xl p-5 border-2 transition-all ${boyLeads ? 'border-blue-500 bg-blue-950' : 'border-gray-700 bg-gray-800'}`}>
            <div className="text-3xl mb-1">👦</div>
            <div className="text-blue-400 font-bold text-sm tracking-widest uppercase">Boy</div>
            <div className="text-5xl font-bold tabular-nums text-white mt-1">{stats.boyPct}<span className="text-2xl text-gray-400">%</span></div>
            <div className="text-gray-400 text-sm mt-1 tabular-nums">{stats.boyCt} entries</div>
            {boyLeads && stats.total > 0 && <div className="mt-2 text-xs text-green-400 font-bold tracking-wider">▲ FAVORITE</div>}
          </div>
          <div className={`rounded-xl p-5 border-2 transition-all ${!boyLeads ? 'border-pink-500 bg-pink-950' : 'border-gray-700 bg-gray-800'}`}>
            <div className="text-3xl mb-1">👧</div>
            <div className="text-pink-400 font-bold text-sm tracking-widest uppercase">Girl</div>
            <div className="text-5xl font-bold tabular-nums text-white mt-1">{stats.girlPct}<span className="text-2xl text-gray-400">%</span></div>
            <div className="text-gray-400 text-sm mt-1 tabular-nums">{stats.girlCt} entries</div>
            {!boyLeads && stats.total > 0 && <div className="mt-2 text-xs text-green-400 font-bold tracking-wider">▲ FAVORITE</div>}
          </div>
        </div>
        <div className="h-3 rounded-full overflow-hidden flex bg-pink-700">
          <div className="h-full bg-blue-500 transition-all duration-700" style={{ width: `${stats.boyPct}%` }} />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>BOY {stats.boyPct}%</span>
          <span>GIRL {stats.girlPct}%</span>
        </div>
      </div>

      {/* Odds tables — 3 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        <OddsTable rows={weightOdds(guesses)} label="Weight Odds" header={weightHeader} footer={weightFooter} />
        <BirthDateHistogram guesses={guesses} />
        <OddsTable rows={lengthOdds(guesses)} label="Length Odds" footer={lengthFooter} />
      </div>

      {/* Recent activity ticker */}
      {recent.length > 0 && (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
          <div className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">Recent Activity</div>
          <div className="space-y-1.5">
            {recent.map((g) => (
              <div key={g.id} className="flex items-center gap-3 text-sm">
                <span className={g.gender === 'boy' ? 'text-blue-400' : 'text-pink-400'}>
                  {g.gender === 'boy' ? '👦' : '👧'}
                </span>
                <span className="text-gray-200 font-medium w-32 truncate">{g.name}</span>
                <span className="text-gray-500">→</span>
                <span className="text-gray-300 tabular-nums">{g.gender === 'boy' ? 'Boy' : 'Girl'}</span>
                <span className="text-gray-600">·</span>
                <span className="text-gray-400 tabular-nums">{g.weight_lbs} lbs {g.weight_oz} oz</span>
                <span className="text-gray-600">·</span>
                <span className="text-gray-400">{formatDate(g.birth_date)}</span>
                <span className="text-gray-600">·</span>
                <span className="text-gray-400 tabular-nums">{g.length_in}&quot;</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
