'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { api } from '@/lib/api/client';
import { useTranslation } from '@/lib/i18n';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/utils';
import type { Plan } from '@/types';

export default function AdminPlansPage() {
  const { t } = useTranslation();
  const { success, error } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [edits, setEdits] = useState<Record<number, Partial<Plan>>>({});
  const [saving, setSaving] = useState<number | null>(null);

  useEffect(() => {
    api
      .adminPlans()
      .then(setPlans)
      .catch((err) => error(t.admin_failed_load_plans, getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [error, t.admin_failed_load_plans]);

  const savePlan = async (plan: Plan) => {
    const edit = edits[plan.id];
    if (!edit) return;
    setSaving(plan.id);
    try {
      await api.updateAdminPlan(plan.id, edit);
      setPlans((ps) =>
        ps.map((p) =>
          p.id === plan.id ? { ...p, ...edit } : p
        )
      );
      setEdits((e) => ({ ...e, [plan.id]: {} }));
      success(`${plan.name} ${t.admin_plan_updated}`);
    } catch (err) {
      error(t.admin_failed_update_plan, getErrorMessage(err));
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" /> {t.admin_plans}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t.admin_plans_desc}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {plans.map((plan) => {
          const edit = edits[plan.id] || {};
          const draft = { ...plan, ...edit };
          const set = (patch: Partial<Plan>) =>
            setEdits((e) => ({ ...e, [plan.id]: { ...edit, ...patch } }));
          return (
            <div key={plan.id} className="card-surface p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{plan.name}</h3>
                <Badge variant={plan.is_active ? 'success' : 'secondary'} dot>
                  {plan.is_active ? t.admin_header_active : t.admin_inactive}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label={t.admin_monthly_price}
                  type="number"
                  step="0.01"
                  min="0"
                  value={draft.price_monthly}
                  onChange={(e) => set({ price_monthly: parseFloat(e.target.value) || 0 })}
                />
                <Input
                  label={t.admin_product_limit}
                  type="number"
                  min="0"
                  value={draft.product_limit}
                  onChange={(e) => set({ product_limit: parseInt(e.target.value) || 0 })}
                />
              </div>
              <Input
                label={t.admin_order_limit}
                type="number"
                min="0"
                value={draft.order_limit ?? ''}
                onChange={(e) => set({ order_limit: e.target.value === '' ? null : parseInt(e.target.value) })}
                helperText={t.admin_leave_empty_unlimited}
              />

              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t.admin_custom_branding}</span>
                  <Switch checked={draft.custom_branding} onCheckedChange={(v) => set({ custom_branding: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t.admin_advanced_analytics}</span>
                  <Switch checked={draft.advanced_analytics} onCheckedChange={(v) => set({ advanced_analytics: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t.admin_priority_support}</span>
                  <Switch checked={draft.priority_support} onCheckedChange={(v) => set({ priority_support: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t.admin_header_active}</span>
                  <Switch checked={draft.is_active} onCheckedChange={(v) => set({ is_active: v })} />
                </div>
              </div>

              <Button
                variant="gold"
                className="w-full"
                disabled={Object.keys(edit).length === 0}
                onClick={() => savePlan(plan)}
                isLoading={saving === plan.id}
              >
                {Object.keys(edit).length > 0 ? t.admin_save_changes : t.admin_up_to_date}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
