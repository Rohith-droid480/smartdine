'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name || !email || !password) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);
    const result = await signup({ name, email, password });
    setIsSubmitting(false);

    if (result.success) {
      router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}`);
    } else {
      setErrorMsg(result.error ?? 'Registration failed. Email may already be in use.');
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-br from-orange-50/50 via-white to-amber-50/50 p-4">
      <div className="mx-auto max-w-md w-full rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 text-2xl mb-1">
            ✨
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-xs text-gray-500">Join SmartDine for fast ordering & table reservations</p>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-2xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs text-gray-900 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-2xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. john@example.com"
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs text-gray-900 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-2xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Password (Min 8 chars, 1 uppercase, 1 lowercase, 1 number)
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
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Register & Send OTP &rarr;</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-semibold text-orange-600 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
