'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api/client';
import { getErrorMessage } from '@/lib/utils';

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        await api.verifyEmail(token);
        setState('success');
      } catch (err) {
        setState('error');
        setMessage(getErrorMessage(err));
      }
    };
    verify();
  }, [token]);

  if (state === 'loading') {
    return (
      <div className="text-center py-8">
        <div className="mx-auto w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm text-muted-foreground">Verifying your email…</p>
      </div>
    );
  }

  return (
    <div className="text-center py-4">
      {state === 'success' ? (
        <>
          <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h1 className="mt-5 text-xl font-bold">Email verified</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account is now verified. You&apos;re all set to sell.
          </p>
          <Link href="/login" className="block mt-6">
            <Button variant="gold" className="w-full">
              Go to sign in
            </Button>
          </Link>
        </>
      ) : (
        <>
          <div className="mx-auto w-14 h-14 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center">
            <XCircle className="w-7 h-7" />
          </div>
          <h1 className="mt-5 text-xl font-bold">Verification failed</h1>
          <p className="mt-2 text-sm text-muted-foreground">{message || 'The link may be invalid or expired.'}</p>
          <Link href="/login" className="block mt-6">
            <Button variant="outline" className="w-full">
              Back to sign in
            </Button>
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-primary/10 blur-[140px] pointer-events-none"
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md">
        <div className="card-surface p-8">
          <Suspense fallback={null}>
            <VerifyContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
