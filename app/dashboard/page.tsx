import { getDb } from '@/db';
import type { Guess } from '@/lib/types';
import GuessFeed from '@/components/Dashboard/GuessFeed';
import QRCode from 'qrcode';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const guesses = getDb().prepare('SELECT * FROM guesses ORDER BY created_at DESC').all() as Guess[];

  const appUrl = (process.env.APP_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  const qrDataUrl = await QRCode.toDataURL(appUrl + '/', {
    width: 160,
    margin: 1,
    color: { dark: '#ffffff', light: '#111827' },
  });

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-4 font-mono">
      <div className="flex items-center gap-6 bg-gray-900 border border-gray-700 rounded-xl px-6 py-4 mb-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrDataUrl} alt="QR code" width={80} height={80} className="rounded-lg shrink-0" />
        <div>
          <div className="text-white font-bold text-lg">Scan to make your guess!</div>
          <div className="text-gray-400 text-sm mt-0.5">Pick the gender, weight, birth date, and length.</div>
          <div className="text-gray-500 text-xs mt-1 font-mono">{appUrl}</div>
        </div>
      </div>
      <GuessFeed initialGuesses={guesses} />
    </main>
  );
}
