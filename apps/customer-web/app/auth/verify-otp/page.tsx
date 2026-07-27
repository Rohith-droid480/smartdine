'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') ?? '';

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !otp) {
      setErrorMsg('Please enter your email and 6-digit OTP code.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.auth.verifyOtp({ email, otp });
      setIsSubmitting(false);

      if (res.success && res.data?.tokens?.accessToken) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('smartdine_customer_token', res.data.tokens.accessToken);
          localStorage.setItem('smartdine_customer_refresh_token', res.data.tokens.refreshToken);
        }
        setSuccessMsg('Email verified successfully! Redirecting...');
        setTimeout(() => {
          router.push('/menu');
        }, 1500);
      } else {
        setErrorMsg(res.error ?? 'Invalid or expired OTP code.');
      }
    } catch (err: unknown) {
      setIsSubmitting(false);
      setErrorMsg((err as Error).message ?? 'Verification failed due to a network error.');
    }
  };

  return (
    <div className="mx-auto max-w-md w-full rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">
      <div className="text-center space-y-2 mb-6">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 text-2xl mb-1">
          📩
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Verify Email OTP</h1>
        <p className="text-xs text-gray-500">Enter the verification code sent to your email</p>
      </div>

      {errorMsg && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="font-bold text-red-500 ml-2">✕</button>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-xs text-green-700">
          ✓ {successMsg}
        </div>
      )}

      {/* Dev Hint */}
      <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-xs text-blue-800">
        <p className="font-semibold">Development OTP Mode</p>
        <p className="text-3xs text-blue-700">For seeded database testing, use code: <strong className="font-mono">123456</strong></p>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label className="block text-2xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs text-gray-900 focus:border-orange-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-2xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
            6-Digit OTP Code
          </label>
          <input
            type="text"
            required
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="123456"
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-center text-lg font-mono tracking-widest text-gray-900 focus:border-orange-500 focus:outline-none"
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
              <span>Verifying OTP...</span>
            </>
          ) : (
            <span>Verify & Continue &rarr;</span>
          )}
        </button>
      </form>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-br from-orange-50/50 via-white to-amber-50/50 p-4">
      <Suspense fallback={
        <div className="rounded-2xl bg-white p-8 shadow-xl max-w-md w-full text-center text-xs text-gray-400">
          Loading verification code handler...
        </div>
      }>
        <VerifyOtpContent />
      </Suspense>
    </main>
  );
}
