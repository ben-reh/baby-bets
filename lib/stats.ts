import type { Guess, Stats } from './types';

export function computeStats(guesses: Guess[]): Stats {
  const total = guesses.length;
  if (total === 0) {
    return { total: 0, boyCt: 0, girlCt: 0, boyPct: 0, girlPct: 0, avgWeightLbs: 0, avgWeightOz: 0, avgLengthIn: 0, mostCommonDate: null };
  }

  const boyCt = guesses.filter((g) => g.gender === 'boy').length;
  const girlCt = total - boyCt;

  const totalOz = guesses.reduce((sum, g) => sum + g.weight_lbs * 16 + g.weight_oz, 0);
  const avgOz = Math.round(totalOz / total);
  const avgWeightLbs = Math.floor(avgOz / 16);
  const avgWeightOz = avgOz % 16;

  const avgLengthIn = Math.round((guesses.reduce((sum, g) => sum + g.length_in, 0) / total) * 10) / 10;

  const dateCounts: Record<string, number> = {};
  for (const g of guesses) {
    dateCounts[g.birth_date] = (dateCounts[g.birth_date] ?? 0) + 1;
  }
  const mostCommonDate = Object.entries(dateCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return {
    total,
    boyCt,
    girlCt,
    boyPct: Math.round((boyCt / total) * 100),
    girlPct: Math.round((girlCt / total) * 100),
    avgWeightLbs,
    avgWeightOz,
    avgLengthIn,
    mostCommonDate,
  };
}

export interface OddsRow {
  label: string;
  count: number;
  pct: number;
}

export function weightOdds(guesses: Guess[]): OddsRow[] {
  const counts: Record<string, number> = {};
  for (const g of guesses) {
    // bucket by half-pound: e.g. "7 lbs 0–7 oz" vs "7 lbs 8–15 oz"
    const half = g.weight_oz < 8 ? '0–7 oz' : '8–15 oz';
    const key = `${g.weight_lbs} lbs ${half}`;
    counts[key] = (counts[key] ?? 0) + 1;
  }
  const total = guesses.length || 1;
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({ label, count, pct: Math.round((count / total) * 100) }));
}

export function dateOdds(guesses: Guess[], limit = 7): OddsRow[] {
  const counts: Record<string, number> = {};
  for (const g of guesses) counts[g.birth_date] = (counts[g.birth_date] ?? 0) + 1;
  const total = guesses.length || 1;
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({ label, count, pct: Math.round((count / total) * 100) }));
}

export function lengthOdds(guesses: Guess[]): OddsRow[] {
  const counts: Record<string, number> = {};
  for (const g of guesses) {
    const key = `${g.length_in}"`;
    counts[key] = (counts[key] ?? 0) + 1;
  }
  const total = guesses.length || 1;
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({ label, count, pct: Math.round((count / total) * 100) }));
}

export function timeOdds(guesses: Guess[]): OddsRow[] {
  const slots: Record<string, number> = {
    'Midnight–6am': 0, '6am–Noon': 0, 'Noon–6pm': 0, '6pm–Midnight': 0,
  };
  for (const g of guesses) {
    const h = parseInt(g.birth_time.split(':')[0]);
    if (h < 6) slots['Midnight–6am']++;
    else if (h < 12) slots['6am–Noon']++;
    else if (h < 18) slots['Noon–6pm']++;
    else slots['6pm–Midnight']++;
  }
  const total = guesses.length || 1;
  return Object.entries(slots)
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({ label, count, pct: Math.round((count / total) * 100) }));
}

export function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-');
  const d = new Date(Number(year), Number(month) - 1, Number(day));
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}
