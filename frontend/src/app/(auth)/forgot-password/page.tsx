'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MailCheck } from 'lucide-react';
import { PublicOnlyRoute } from '@/components/layout/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api/client';
import { getErrorMessage } from '@/lib/utils';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicOnlyRoute>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-primary/10 blur-[140px] pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative w-full max-w-md">
          <div className="card-surface p-8">
            {sent ? (
              <div className="text-center py-4">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <MailCheck className="w-7 h-7" />
                </div>
                <h1 className="mt-5 text-xl font-bold">Check your inbox</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  If an account exists for <span className="text-foreground">{email}</span>, we&apos;ve
                  sent you a password reset link. It expires in 30 minutes.
                </p>
                <Link href="/login" className="block mt-6">
                  <Button variant="outline" className="w-full">
                    Back to sign in
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold tracking-tight">Reset your password</h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Enter your email and we&apos;ll send you a reset link.
                </p>
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <Input
                    label="Email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                  {error && (
                    <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                      {error}
                    </div>
                  )}
                  <Button type="submit" variant="gold" className="w-full" size="lg" isLoading={loading}>
                    Send reset link
                  </Button>
                </form>
                <p className="mt-6 text-center text-sm text-muted-foreground">
                  Remembered it?{' '}
                  <Link href="/login" className="font-medium text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </PublicOnlyRoute>
  );
}
