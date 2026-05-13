import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { dynamo, TABLE } from '@/lib/dynamo';
import type { Guess } from '@/lib/types';
import GuessFeedB from '@/components/Dashboard/GuessFeedB';
import QRCode from 'qrcode';

export const dynamic = 'force-dynamic';

export default async function DashboardBPage() {
  const result = await dynamo.send(new ScanCommand({ TableName: TABLE }));
  const guesses = ((result.Items ?? []) as Guess[])
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  const appUrl = (process.env.APP_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  const qrDataUrl = await QRCode.toDataURL(appUrl + '/', {
    width: 160,
    margin: 1,
    color: { dark: '#4338CA', light: '#ffffff' },
  });

  return (
    <main className="h-screen overflow-hidden bg-stone-50 text-gray-900 p-3 flex flex-col gap-3">
      <div className="shrink-0 flex items-center gap-6 bg-white border border-gray-200 rounded-xl px-5 py-3 shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrDataUrl} alt="QR code" width={72} height={72} className="rounded-lg shrink-0" />
        <div>
          <div className="text-gray-900 font-bold text-lg">Scan to make your guess!</div>
          <div className="text-gray-500 text-sm mt-0.5">Pick the gender, weight, birth date, and length.</div>
          <div className="text-gray-400 text-xs mt-1 font-mono">{appUrl}</div>
        </div>
        <div className="ml-auto text-xs font-bold tracking-widest text-violet-400 uppercase">Option B</div>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <GuessFeedB initialGuesses={guesses} />
      </div>
    </main>
  );
}
