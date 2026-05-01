import { NextRequest, NextResponse } from 'next/server';
import { ScanCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { dynamo, TABLE } from '@/lib/dynamo';
import type { Guess } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  const result = await dynamo.send(new ScanCommand({ TableName: TABLE }));
  const guesses = (result.Items ?? []) as Guess[];
  guesses.sort((a, b) => b.created_at.localeCompare(a.created_at));
  return NextResponse.json(guesses);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, gender, weight_lbs, weight_oz, birth_date, length_in } = body;

  if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  if (gender !== 'boy' && gender !== 'girl') return NextResponse.json({ error: 'Invalid gender' }, { status: 400 });
  if (!Number.isInteger(weight_lbs) || weight_lbs < 1 || weight_lbs > 20) return NextResponse.json({ error: 'Invalid weight (lbs)' }, { status: 400 });
  if (!Number.isInteger(weight_oz) || weight_oz < 0 || weight_oz > 15) return NextResponse.json({ error: 'Invalid weight (oz)' }, { status: 400 });
  if (!birth_date || !/^\d{4}-\d{2}-\d{2}$/.test(birth_date)) return NextResponse.json({ error: 'Invalid birth date' }, { status: 400 });
  if (typeof length_in !== 'number' || length_in < 10 || length_in > 30) return NextResponse.json({ error: 'Invalid length' }, { status: 400 });

  const item: Guess = {
    id: uuidv4(),
    name: name.trim(),
    gender,
    weight_lbs,
    weight_oz,
    birth_date,
    birth_time: '00:00',
    length_in,
    created_at: new Date().toISOString(),
  };

  await dynamo.send(new PutCommand({ TableName: TABLE, Item: item }));

  return NextResponse.json({ ok: true, id: item.id });
}
