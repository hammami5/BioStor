'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Shield } from 'lucide-react';
import { api } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { formatDate, getErrorMessage } from '@/lib/utils';

export default function SettingsPage() {
  const { user, refreshUser, logout } = useAuth();
  const router = useRouter();
  const { success, error } = useToast();

  const [profile, setProfile] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const [password, setPassword] = useState({ current: '', new: '', confirm: '' });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await refreshUser();
      success('Profile up to date');
    } catch (err) {
      error('Failed to load profile', getErrorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg('');
    if (password.new.length < 8) {
      setPasswordMsg('New password must be at least 8 characters.');
      return;
    }
    if (password.new !== password.confirm) {
      setPasswordMsg('Passwords do not match.');
      return;
    }
    setSavingPassword(true);
    try {
      // Demo environment has no password-change endpoint yet — keep local.
      setPasswordMsg('Password change is not available in the demo build.');
      setPassword({ current: '', new: '', confirm: '' });
    } finally {
      setSavingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            <CardTitle>Profile</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-14 h-14 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xl font-bold">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium">@{user.username}</p>
              <p className="text-sm text-muted-foreground">
                Member since {formatDate(user.created_at)}
              </p>
            </div>
            <Badge variant={user.is_verified ? 'success' : 'warning'} className="ml-auto">
              {user.is_verified ? 'Verified' : 'Unverified'}
            </Badge>
          </div>
          <form onSubmit={saveProfile} className="space-y-4">
            <Input
              label="Full name"
              value={profile.full_name}
              onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
            />
            <Input
              label="Email"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
            />
            <Button type="submit" variant="gold" isLoading={savingProfile}>
              Save profile
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <CardTitle>Security</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={changePassword} className="space-y-4">
            <Input
              label="Current password"
              type="password"
              value={password.current}
              onChange={(e) => setPassword((p) => ({ ...p, current: e.target.value }))}
              autoComplete="current-password"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="New password"
                type="password"
                value={password.new}
                onChange={(e) => setPassword((p) => ({ ...p, new: e.target.value }))}
                autoComplete="new-password"
              />
              <Input
                label="Confirm new password"
                type="password"
                value={password.confirm}
                onChange={(e) => setPassword((p) => ({ ...p, confirm: e.target.value }))}
                autoComplete="new-password"
              />
            </div>
            {passwordMsg && (
              <p className="text-sm text-muted-foreground">{passwordMsg}</p>
            )}
            <Button type="submit" variant="outline" isLoading={savingPassword}>
              Change password
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-start">
          <Button
            variant="ghost"
            className="text-red-400 hover:text-red-400 hover:bg-red-500/10"
            onClick={async () => {
              await logout();
              router.replace('/login');
            }}
          >
            Sign out of BioStor
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
