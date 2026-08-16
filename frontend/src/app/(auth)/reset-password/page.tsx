'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api/client';
import { getErrorMessage } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

function ResetPasswordContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError(t.reset_password_min_error);
      return;
    }
    if (password !== confirm) {
      setError(t.reset_passwords_no_match);
      return;
    }
    setLoading(true);
    try {
      await api.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="text-center py-4">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h1 className="mt-5 text-xl font-bold">{t.reset_success_title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t.reset_success_desc}
        </p>
        <Link href="/login" className="block mt-6">
          <Button variant="gold" className="w-full">
            {t.reset_success_cta}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">{t.reset_choose_new}</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {t.reset_choose_new_desc}
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input
          label={t.reset_password}
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
        <Input
          label={t.reset_confirm_password}
          type="password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="••••••••"
        />
        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            {error}
          </div>
        )}
        <Button type="submit" variant="gold" className="w-full" size="lg" isLoading={loading}>
          {t.reset_button}
        </Button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-primary/10 blur-[140px] pointer-events-none"
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md">
        <div className="card-surface p-8">
          <Suspense fallback={null}>
            <ResetPasswordContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
