import QRCode from 'qrcode';

export default async function QRPage() {
  const appUrl = process.env.APP_URL ?? 'http://localhost:3000';
  const submissionUrl = appUrl.replace(/\/$/, '') + '/';

  const qrDataUrl = await QRCode.toDataURL(submissionUrl, {
    width: 400,
    margin: 2,
    color: { dark: '#1f2937', light: '#ffffff' },
  });

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
      <div className="text-center">
        <div className="text-5xl mb-6">🍼</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Baby Bets</h1>
        <p className="text-gray-500 mb-8 text-lg">Scan to make your guesses!</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrDataUrl} alt="QR code" className="mx-auto rounded-2xl shadow-lg" width={300} height={300} />
        <p className="text-gray-400 mt-6 text-sm font-mono break-all max-w-xs mx-auto">{submissionUrl}</p>
      </div>
    </main>
  );
}
