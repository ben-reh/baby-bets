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

export function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-');
  const d = new Date(Number(year), Number(month) - 1, Number(day));
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}
