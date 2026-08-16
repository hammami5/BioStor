'use client';

import { useEffect, useState } from 'react';
import { Search, Users } from 'lucide-react';
import { api } from '@/lib/api/client';
import { useTranslation } from '@/lib/i18n';
import { Input } from '@/components/ui/Input';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { debounce, formatDate, getErrorMessage } from '@/lib/utils';
import type { AdminUser } from '@/types';

export default function AdminUsersPage() {
  const { t } = useTranslation();
  const { error } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setUsers(await api.adminUsers({ search: search || undefined }));
    } catch (err) {
      error(t.admin_failed_load_users, getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounced = debounce(load, 400);

  useEffect(() => {
    debounced();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.admin_users}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.admin_users_desc}</p>
      </div>

      <div className="max-w-sm">
        <Input
          placeholder={t.admin_search_users}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      <div className="card-surface overflow-hidden">
        <DataTable<AdminUser>
          loading={loading}
          data={users}
          rowKey={(u) => u.id}
          empty={
            <div className="py-12">
              <EmptyState compact icon={<Users className="w-6 h-6" />} title={t.admin_no_users} />
            </div>
          }
          columns={[
            {
              key: 'user',
              header: t.admin_header_user,
              cell: (u) => (
                <div className="flex items-center gap-3">
                  <Avatar size="sm" fallback={u.full_name.charAt(0).toUpperCase()} className="bg-primary/15 text-primary" />
                  <div>
                    <p className="font-medium">{u.full_name}</p>
                    <p className="text-xs text-muted-foreground">@{u.username}</p>
                  </div>
                </div>
              ),
            },
            { key: 'email', header: t.admin_header_email, cell: (u) => <span>{u.email}</span>, hideBelow: 'sm' },
            {
              key: 'role',
              header: t.admin_header_role,
              cell: (u) => (
                <Badge variant={u.role === 'super_admin' ? 'destructive' : 'secondary'}>{u.role}</Badge>
              ),
            },
            {
              key: 'verified',
              header: t.admin_header_verified,
              cell: (u) => (
                <Badge variant={u.is_verified ? 'success' : 'warning'} dot>
                  {u.is_verified ? t.common_yes : t.common_no}
                </Badge>
              ),
              hideBelow: 'md',
            },
            {
              key: 'store',
              header: t.admin_header_store,
              cell: (u) => <span className="text-muted-foreground">{u.store_name || '—'}</span>,
              hideBelow: 'lg',
            },
            {
              key: 'created',
              header: t.admin_header_joined,
              cell: (u) => <span className="text-muted-foreground">{formatDate(u.created_at)}</span>,
              hideBelow: 'xl',
            },
            {
              key: 'active',
              header: t.admin_header_active,
              cell: (u) => (
                <Badge variant={u.is_active ? 'success' : 'destructive'} dot>
                  {u.is_active ? t.common_yes : t.common_no}
                </Badge>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
