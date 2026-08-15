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

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({
    full_name: '',
    username: '',
    email: '',
    store_name: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      router.replace('/dashboard');
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
            <h1 className="text-2xl font-bold tracking-tight">Create your store</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Free to start. Takes less than a minute.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Full name"
                  required
                  value={form.full_name}
                  onChange={update('full_name')}
                  placeholder="Jane Doe"
                />
                <Input
                  label="Username"
                  required
                  value={form.username}
                  onChange={update('username')}
                  placeholder="janedoe"
                  helperText="Letters, numbers, dots and dashes"
                />
              </div>
              <Input
                label="Store name"
                required
                value={form.store_name}
                onChange={update('store_name')}
                placeholder="Jane's Boutique"
                helperText="Your public storefront name"
              />
              <Input
                label="Email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={update('email')}
                placeholder="you@example.com"
              />
              <Input
                label="Password"
                type="password"
                required
                autoComplete="new-password"
                value={form.password}
                onChange={update('password')}
                placeholder="At least 8 characters"
              />

              {error && (
                <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                  {error}
                </div>
              )}

              <Button type="submit" variant="gold" className="w-full" size="lg" isLoading={loading}>
                Create my store
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PublicOnlyRoute>
  );
}
