import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default function DashboardPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-500 text-white text-3xl mb-2">
          📊
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight">Staff Dashboard</h1>
        <p className="text-gray-400 text-lg">
          Operations · Insights · Management
        </p>
        <div className="mt-6 rounded-xl border border-green-900 bg-green-950 px-4 py-3 text-sm text-green-400">
          🚧 Gamma is building this. Foundation scaffold is live.
        </div>
      </div>
    </main>
  );
}
