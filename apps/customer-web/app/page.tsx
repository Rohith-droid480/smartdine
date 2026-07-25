import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Welcome',
};

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-white p-8">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-500 text-white text-3xl mb-2">
          🍽️
        </div>
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">SmartDine</h1>
        <p className="text-gray-500 text-lg">
          Smart Restaurant Experience
        </p>
        <div className="mt-6 rounded-xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm text-orange-700">
          🚧 Beta is building this. Foundation scaffold is live.
        </div>
      </div>
    </main>
  );
}
