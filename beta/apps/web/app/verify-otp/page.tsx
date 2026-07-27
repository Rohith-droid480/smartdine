'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';

export const dynamic = 'force-dynamic';

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || 'alex.gourmet@example.com';

  const [otp, setOtp] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.verifyOtp(emailParam, otp);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/menu');
        }, 1200);
      } else {
        setError(res.error || 'Invalid OTP code.');
      }
    } catch (err) {
      setError('Failed to verify OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Badge variant="emerald" size="sm" className="mx-auto uppercase tracking-wider">
            Security Verification
          </Badge>
          <h1 className="font-serif text-3xl font-bold text-slate-100">Verify Your Email</h1>
          <p className="text-xs text-slate-400">
            We sent a 6-digit verification code to <span className="text-amber-400 font-medium">{emailParam}</span>.
          </p>
        </div>

        <Card className="glass-panel p-6 sm:p-8 space-y-6">
          {success ? (
            <div className="text-center space-y-3 py-4 animate-in zoom-in-95">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-emerald-400">Email Verified!</h3>
              <p className="text-xs text-slate-400">Redirecting to digital menu...</p>
            </div>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Input
                  label="6-Digit OTP Code"
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="text-center tracking-widest text-lg font-mono font-bold"
                  leftIcon={<ShieldCheck className="w-5 h-5 text-amber-400" />}
                  required
                />
                <p className="text-[11px] text-slate-500 text-center">
                  Demo Tip: Enter <strong className="text-amber-300">123456</strong> to pass verification.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={loading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Verify & Continue
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading verification...</div>}>
      <VerifyOtpContent />
    </Suspense>
  );
}
