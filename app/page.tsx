import GuessForm from '@/components/GuessForm';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🍼</div>
          <h1 className="text-3xl font-bold text-gray-800">Baby Bets</h1>
          <p className="text-gray-500 mt-2">Make your guesses for the big arrival!</p>
        </div>
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <GuessForm />
        </div>
      </div>
    </main>
  );
}
