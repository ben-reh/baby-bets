import { NextRequest, NextResponse } from 'next/server';
import { getDb, eventBus } from '@/db';
import type { Guess } from '@/lib/types';

export function GET() {
  const guesses = getDb().prepare('SELECT * FROM guesses ORDER BY created_at DESC').all() as Guess[];
  return NextResponse.json(guesses);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, gender, weight_lbs, weight_oz, birth_date, length_in } = body;
  const birth_time = '00:00';

  if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  if (gender !== 'boy' && gender !== 'girl') return NextResponse.json({ error: 'Invalid gender' }, { status: 400 });
  if (!Number.isInteger(weight_lbs) || weight_lbs < 1 || weight_lbs > 20) return NextResponse.json({ error: 'Invalid weight (lbs)' }, { status: 400 });
  if (!Number.isInteger(weight_oz) || weight_oz < 0 || weight_oz > 15) return NextResponse.json({ error: 'Invalid weight (oz)' }, { status: 400 });
  if (!birth_date || !/^\d{4}-\d{2}-\d{2}$/.test(birth_date)) return NextResponse.json({ error: 'Invalid birth date' }, { status: 400 });
  if (typeof length_in !== 'number' || length_in < 10 || length_in > 30) return NextResponse.json({ error: 'Invalid length' }, { status: 400 });

  const result = getDb()
    .prepare('INSERT INTO guesses (name, gender, weight_lbs, weight_oz, birth_date, birth_time, length_in) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(name.trim(), gender, weight_lbs, weight_oz, birth_date, birth_time, length_in);

  eventBus.emit('new_guess');

  return NextResponse.json({ ok: true, id: result.lastInsertRowid });
}
