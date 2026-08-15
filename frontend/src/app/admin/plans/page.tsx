'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { api } from '@/lib/api/client';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/utils';
import type { Plan } from '@/types';

export default function AdminPlansPage() {
  const { success, error } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [edits, setEdits] = useState<Record<number, Partial<Plan>>>({});
  const [saving, setSaving] = useState<number | null>(null);

  useEffect(() => {
    api
      .adminPlans()
      .then(setPlans)
      .catch((err) => error('Failed to load plans', getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [error]);

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
      success(`${plan.name} plan updated`);
    } catch (err) {
      error('Failed to update plan', getErrorMessage(err));
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
          <Sparkles className="w-6 h-6 text-primary" /> Plans
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Adjust pricing, limits, and features for each subscription tier.
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
                  {plan.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Monthly price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={draft.price_monthly}
                  onChange={(e) => set({ price_monthly: parseFloat(e.target.value) || 0 })}
                />
                <Input
                  label="Product limit"
                  type="number"
                  min="0"
                  value={draft.product_limit}
                  onChange={(e) => set({ product_limit: parseInt(e.target.value) || 0 })}
                />
              </div>
              <Input
                label="Order limit"
                type="number"
                min="0"
                value={draft.order_limit ?? ''}
                onChange={(e) => set({ order_limit: e.target.value === '' ? null : parseInt(e.target.value) })}
                helperText="Leave empty for unlimited"
              />

              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Custom branding</span>
                  <Switch checked={draft.custom_branding} onCheckedChange={(v) => set({ custom_branding: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Advanced analytics</span>
                  <Switch checked={draft.advanced_analytics} onCheckedChange={(v) => set({ advanced_analytics: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Priority support</span>
                  <Switch checked={draft.priority_support} onCheckedChange={(v) => set({ priority_support: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active</span>
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
                {Object.keys(edit).length > 0 ? 'Save changes' : 'Up to date'}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
