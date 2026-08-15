'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store } from 'lucide-react';
import { PublicOnlyRoute } from '@/components/layout/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/lib/auth/context';
import { getErrorMessage } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const { login, isSuperAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.replace(isSuperAdmin ? '/admin' : '/dashboard');
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
          <div className="flex flex-col items-center mb-8">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-xl gold-gradient flex items-center justify-center shadow-glow-gold">
                <Store className="w-6 h-6 text-black" strokeWidth={2.2} />
              </div>
              <span className="text-2xl font-bold tracking-tight">
                Bio<span className="gradient-text">Stor</span>
              </span>
            </Link>
          </div>

          <div className="card-surface p-8">
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Sign in to manage your store.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <Input
                label="Email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
              <div>
                <Input
                  label="Password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <div className="mt-1.5 text-right">
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              {error && (
                <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                  {error}
                </div>
              )}

              <Button type="submit" variant="gold" className="w-full" size="lg" isLoading={loading}>
                Sign in
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              New to BioStor?{' '}
              <Link href="/register" className="font-medium text-primary hover:underline">
                Create a store
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Link href="/" className="hover:text-primary">Back to home</Link>
          </p>
        </div>
      </div>
    </PublicOnlyRoute>
  );
}
