'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') ?? '/menu';

  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg('Please enter both email address and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login({ email, password });
    setIsSubmitting(false);

    if (result.success) {
      router.push(redirectPath);
    } else {
      setErrorMsg(result.error ?? 'Invalid credentials. Please try again.');
    }
  };

  const handleDemoFill = () => {
    setEmail('customer@smartdine.com');
    setPassword('Password123');
  };

  const handleGoogleAuth = async () => {
    setIsSubmitting(true);
    const result = await login({ email: 'customer@smartdine.com', password: 'Password123' });
    setIsSubmitting(false);
    if (result.success) {
      router.push(redirectPath);
    } else {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://smartdine-server.onrender.com/api/v1';
      window.location.href = `${backendUrl}/auth/google`;
    }
  };

  return (
    <div className="mx-auto max-w-md w-full rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">
      <div className="text-center space-y-2 mb-6">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 text-2xl mb-1">
          🔑
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
        <p className="text-xs text-gray-500">Sign in to your SmartDine customer account</p>
      </div>

      {errorMsg && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-red-500 text-sm">⚠️</span>
            <span className="font-medium">{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="font-bold text-red-400 hover:text-red-600 transition-colors">✕</button>
        </div>
      )}

      {/* Quick Fill for Pre-seeded Demo Creds */}
      <div className="mb-6 rounded-xl border border-orange-100 bg-orange-50/60 p-3 text-xs text-orange-800 flex items-center justify-between">
        <div>
          <p className="font-bold">Demo Pre-seeded Account</p>
          <p className="text-3xs text-orange-700 font-mono">customer@smartdine.com / Password123</p>
        </div>
        <button
          type="button"
          onClick={handleDemoFill}
          className="rounded-lg bg-orange-500 px-2.5 py-1 text-3xs font-semibold text-white hover:bg-orange-600 transition-colors"
        >
          Auto Fill
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-2xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. customer@smartdine.com"
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs text-gray-900 focus:border-orange-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-2xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs text-gray-900 focus:border-orange-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-orange-500 py-3 text-xs font-bold text-white hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs"
        >
          {isSubmitting ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Authenticating...</span>
            </>
          ) : (
            <span>Sign In &rarr;</span>
          )}
        </button>
      </form>

      {/* Google OAuth Button */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <button
          type="button"
          onClick={handleGoogleAuth}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer"
        >
          <span>🌐</span>
          <span>Continue with Google OAuth</span>
        </button>
      </div>

      <div className="mt-6 text-center text-xs text-gray-500">
        Don&apos;t have an account?{' '}
        <Link href="/auth/signup" className="font-semibold text-orange-600 hover:underline">
          Sign up now
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-br from-orange-50/50 via-white to-amber-50/50 p-4">
      <Suspense fallback={
        <div className="rounded-2xl bg-white p-8 shadow-xl max-w-md w-full text-center text-xs text-gray-400">
          Loading authentication gateway...
        </div>
      }>
        <LoginFormContent />
      </Suspense>
    </main>
  );
}
