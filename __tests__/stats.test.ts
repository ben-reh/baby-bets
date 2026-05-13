import { computeStats, weightOdds, lengthOdds, formatDate, formatTime, avgBirthDate } from '@/lib/stats';
import type { Guess } from '@/lib/types';

const makeGuess = (overrides: Partial<Guess> = {}): Guess => ({
  id: '1',
  name: 'Alice',
  gender: 'girl',
  weight_lbs: 7,
  weight_oz: 8,
  birth_date: '2026-08-08',
  birth_time: '10:00',
  length_in: 20,
  created_at: new Date().toISOString(),
  ...overrides,
});

describe('computeStats', () => {
  it('returns zero stats for empty array', () => {
    const s = computeStats([]);
    expect(s.total).toBe(0);
    expect(s.boyPct).toBe(0);
    expect(s.girlPct).toBe(0);
    expect(s.mostCommonDate).toBeNull();
  });

  it('calculates boy/girl percentages', () => {
    const guesses = [
      makeGuess({ gender: 'boy' }),
      makeGuess({ gender: 'boy' }),
      makeGuess({ gender: 'girl' }),
    ];
    const s = computeStats(guesses);
    expect(s.total).toBe(3);
    expect(s.boyCt).toBe(2);
    expect(s.girlCt).toBe(1);
    expect(s.boyPct).toBe(67);
    expect(s.girlPct).toBe(33);
  });

  it('calculates average weight correctly', () => {
    const guesses = [
      makeGuess({ weight_lbs: 7, weight_oz: 0 }),
      makeGuess({ weight_lbs: 8, weight_oz: 0 }),
    ];
    const s = computeStats(guesses);
    // avg = (7*16 + 8*16) / 2 = 120 oz = 7 lbs 8 oz
    expect(s.avgWeightLbs).toBe(7);
    expect(s.avgWeightOz).toBe(8);
  });

  it('calculates average length correctly', () => {
    const guesses = [
      makeGuess({ length_in: 19 }),
      makeGuess({ length_in: 21 }),
    ];
    const s = computeStats(guesses);
    expect(s.avgLengthIn).toBe(20);
  });

  it('finds most common birth date', () => {
    const guesses = [
      makeGuess({ birth_date: '2026-08-01' }),
      makeGuess({ birth_date: '2026-08-08' }),
      makeGuess({ birth_date: '2026-08-08' }),
    ];
    const s = computeStats(guesses);
    expect(s.mostCommonDate).toBe('2026-08-08');
  });
});

describe('weightOdds', () => {
  it('returns empty array for no guesses', () => {
    expect(weightOdds([])).toEqual([]);
  });

  it('buckets by half-pound', () => {
    const guesses = [
      makeGuess({ weight_lbs: 7, weight_oz: 0 }),
      makeGuess({ weight_lbs: 7, weight_oz: 4 }),
      makeGuess({ weight_lbs: 7, weight_oz: 8 }),
    ];
    const rows = weightOdds(guesses);
    const low = rows.find((r) => r.label === '7 lbs 0–7 oz');
    const high = rows.find((r) => r.label === '7 lbs 8–15 oz');
    expect(low?.count).toBe(2);
    expect(high?.count).toBe(1);
  });

  it('sorts by count descending', () => {
    const guesses = [
      makeGuess({ weight_lbs: 7, weight_oz: 8 }),
      makeGuess({ weight_lbs: 7, weight_oz: 0 }),
      makeGuess({ weight_lbs: 7, weight_oz: 4 }),
    ];
    const rows = weightOdds(guesses);
    expect(rows[0].count).toBeGreaterThanOrEqual(rows[1]?.count ?? 0);
  });
});

describe('lengthOdds', () => {
  it('groups by exact length and sorts by count', () => {
    const guesses = [
      makeGuess({ length_in: 20 }),
      makeGuess({ length_in: 20 }),
      makeGuess({ length_in: 19 }),
    ];
    const rows = lengthOdds(guesses);
    expect(rows[0].label).toBe('20"');
    expect(rows[0].count).toBe(2);
    expect(rows[0].pct).toBe(67);
  });
});

describe('formatDate', () => {
  it('formats ISO date as "Mon D"', () => {
    expect(formatDate('2026-08-08')).toBe('Aug 8');
    expect(formatDate('2026-01-15')).toBe('Jan 15');
  });
});

describe('formatTime', () => {
  it('converts 24h to 12h AM/PM', () => {
    expect(formatTime('00:00')).toBe('12:00 AM');
    expect(formatTime('13:30')).toBe('1:30 PM');
    expect(formatTime('12:00')).toBe('12:00 PM');
    expect(formatTime('09:05')).toBe('9:05 AM');
  });
});

describe('avgBirthDate', () => {
  it('returns null for empty array', () => {
    expect(avgBirthDate([])).toBeNull();
  });

  it('returns the formatted date for a single guess', () => {
    expect(avgBirthDate([makeGuess({ birth_date: '2026-08-08' })])).toBe('Aug 8');
  });

  it('averages two dates correctly', () => {
    const guesses = [
      makeGuess({ birth_date: '2026-08-06' }),
      makeGuess({ birth_date: '2026-08-08' }),
    ];
    // midpoint of Aug 6 and Aug 8 = Aug 7
    expect(avgBirthDate(guesses)).toBe('Aug 7');
  });

  it('averages dates spanning July and August', () => {
    const guesses = [
      makeGuess({ birth_date: '2026-07-25' }),
      makeGuess({ birth_date: '2026-08-08' }),
    ];
    // midpoint of Jul 25 and Aug 8 = Aug 1
    expect(avgBirthDate(guesses)).toBe('Aug 1');
  });

  it('handles multiple guesses on the same date', () => {
    const guesses = [
      makeGuess({ birth_date: '2026-08-08' }),
      makeGuess({ birth_date: '2026-08-08' }),
      makeGuess({ birth_date: '2026-08-08' }),
    ];
    expect(avgBirthDate(guesses)).toBe('Aug 8');
  });
});
