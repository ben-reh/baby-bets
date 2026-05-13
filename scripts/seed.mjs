import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({ region: 'us-east-1' }));
const TABLE = 'baby-bets-guesses';

const records = [
  { name: 'Aunt Sarah',       gender: 'girl', weight_lbs: 7, weight_oz: 4,  birth_date: '2026-08-06', birth_time: '09:30', length_in: 20 },
  { name: 'Uncle Mike',       gender: 'boy',  weight_lbs: 8, weight_oz: 2,  birth_date: '2026-08-10', birth_time: '14:15', length_in: 21 },
  { name: 'Grandma Pat',      gender: 'girl', weight_lbs: 7, weight_oz: 8,  birth_date: '2026-08-08', birth_time: '07:00', length_in: 19 },
  { name: 'Grandpa Joe',      gender: 'boy',  weight_lbs: 8, weight_oz: 0,  birth_date: '2026-08-09', birth_time: '11:45', length_in: 21 },
  { name: 'Cousin Emma',      gender: 'girl', weight_lbs: 6, weight_oz: 12, birth_date: '2026-08-05', birth_time: '16:20', length_in: 19 },
  { name: 'Cousin Jake',      gender: 'boy',  weight_lbs: 7, weight_oz: 14, birth_date: '2026-08-11', birth_time: '08:00', length_in: 20 },
  { name: 'Friend Olivia',    gender: 'girl', weight_lbs: 7, weight_oz: 2,  birth_date: '2026-08-07', birth_time: '13:30', length_in: 20 },
  { name: 'Friend Noah',      gender: 'boy',  weight_lbs: 8, weight_oz: 6,  birth_date: '2026-08-12', birth_time: '10:00', length_in: 21 },
  { name: 'Neighbor Linda',   gender: 'girl', weight_lbs: 6, weight_oz: 8,  birth_date: '2026-08-04', birth_time: '22:00', length_in: 18 },
  { name: 'Neighbor Tom',     gender: 'boy',  weight_lbs: 9, weight_oz: 0,  birth_date: '2026-08-14', birth_time: '06:30', length_in: 22 },
  { name: 'Aunt Rachel',      gender: 'girl', weight_lbs: 7, weight_oz: 10, birth_date: '2026-08-08', birth_time: '15:00', length_in: 20 },
  { name: 'Uncle Dave',       gender: 'boy',  weight_lbs: 7, weight_oz: 15, birth_date: '2026-08-08', birth_time: '18:45', length_in: 21 },
  { name: 'Coworker Jess',    gender: 'girl', weight_lbs: 7, weight_oz: 0,  birth_date: '2026-08-03', birth_time: '11:00', length_in: 19 },
  { name: 'Coworker Sam',     gender: 'boy',  weight_lbs: 8, weight_oz: 8,  birth_date: '2026-08-13', birth_time: '09:15', length_in: 21 },
  { name: 'Friend Mia',       gender: 'girl', weight_lbs: 6, weight_oz: 15, birth_date: '2026-08-07', birth_time: '20:00', length_in: 19 },
  { name: 'Friend Liam',      gender: 'boy',  weight_lbs: 8, weight_oz: 4,  birth_date: '2026-08-09', birth_time: '07:30', length_in: 20 },
  { name: 'Sister Kate',      gender: 'girl', weight_lbs: 7, weight_oz: 6,  birth_date: '2026-08-08', birth_time: '12:00', length_in: 20 },
  { name: 'Brother Chris',    gender: 'boy',  weight_lbs: 7, weight_oz: 12, birth_date: '2026-08-11', birth_time: '17:30', length_in: 21 },
  { name: 'Friend Ava',       gender: 'girl', weight_lbs: 6, weight_oz: 4,  birth_date: '2026-07-31', birth_time: '08:45', length_in: 18 },
  { name: 'Friend Ethan',     gender: 'boy',  weight_lbs: 9, weight_oz: 2,  birth_date: '2026-08-15', birth_time: '14:00', length_in: 22 },
  { name: 'Grandma Rose',     gender: 'girl', weight_lbs: 7, weight_oz: 8,  birth_date: '2026-08-06', birth_time: '10:30', length_in: 20 },
  { name: 'Grandpa Bill',     gender: 'boy',  weight_lbs: 8, weight_oz: 10, birth_date: '2026-08-10', birth_time: '13:00', length_in: 21 },
  { name: 'Cousin Sophie',    gender: 'girl', weight_lbs: 7, weight_oz: 1,  birth_date: '2026-08-07', birth_time: '19:15', length_in: 19 },
  { name: 'Cousin Ryan',      gender: 'boy',  weight_lbs: 8, weight_oz: 0,  birth_date: '2026-08-12', birth_time: '06:00', length_in: 20 },
  { name: 'Friend Chloe',     gender: 'girl', weight_lbs: 6, weight_oz: 10, birth_date: '2026-08-05', birth_time: '21:30', length_in: 19 },
  { name: 'Friend Mason',     gender: 'boy',  weight_lbs: 7, weight_oz: 8,  birth_date: '2026-08-08', birth_time: '04:00', length_in: 20 },
  { name: 'Coworker Grace',   gender: 'girl', weight_lbs: 7, weight_oz: 3,  birth_date: '2026-08-09', birth_time: '11:30', length_in: 20 },
  { name: 'Coworker Ben',     gender: 'boy',  weight_lbs: 8, weight_oz: 14, birth_date: '2026-08-13', birth_time: '16:45', length_in: 21 },
  { name: 'Friend Lily',      gender: 'girl', weight_lbs: 6, weight_oz: 6,  birth_date: '2026-07-25', birth_time: '09:00', length_in: 18 },
  { name: 'Friend James',     gender: 'boy',  weight_lbs: 9, weight_oz: 4,  birth_date: '2026-08-16', birth_time: '15:30', length_in: 22 },
];

let i = 0;
for (const r of records) {
  const created_at = new Date(Date.now() - (30 - i) * 3600000).toISOString();
  await client.send(new PutCommand({
    TableName: TABLE,
    Item: { id: randomUUID(), ...r, created_at },
  }));
  console.log(`✓ ${r.name}`);
  i++;
}
console.log(`\nInserted ${records.length} records.`);
