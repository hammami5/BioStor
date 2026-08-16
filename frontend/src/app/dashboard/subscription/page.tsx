'use client';

import { useEffect, useState } from 'react';
import { Sparkles, Check, Zap, Building2, X } from 'lucide-react';
import { api } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { useTranslation } from '@/lib/i18n';
import { cn, formatDate, getErrorMessage } from '@/lib/utils';
import type { Plan, Subscription } from '@/types';

export default function SubscriptionPage() {
  const { success, error } = useToast();
  const { t } = useTranslation();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [ps, sub] = await Promise.all([api.listPlans(), api.getSubscription()]);
        setPlans(ps);
        setSubscription(sub);
      } catch (err) {
        error(t.common_error, getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [error, t]);

  const selectPlan = async (code: string) => {
    setSelecting(code);
    try {
      const updated = await api.selectPlan(code);
      setSubscription(updated);
      const name = plans.find((p) => p.code === code)?.name || code;
      success(code === 'free' ? t.subscription_downgrade : `${t.subscription_upgrade} ${name}`, t.subscription_active);
    } catch (err) {
      error(t.common_error, getErrorMessage(err));
    } finally {
      setSelecting(null);
    }
  };

  const cancelSub = async () => {
    setCancelling(true);
    try {
      const updated = await api.cancelSubscription();
      setSubscription(updated);
      success(t.subscription_cancel, t.subscription_inactive);
      setCancelOpen(false);
    } catch (err) {
      error(t.common_error, getErrorMessage(err));
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid lg:grid-cols-3 gap-5">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  const currentCode = subscription?.plan_code;
  const currentPlan = plans.find((p) => p.code === currentCode);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" /> {t.subscription_title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t.subscription_manage}
        </p>
      </div>

      {subscription && (
        <div className="card-surface p-5 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{t.subscription_current_plan}</p>
            <p className="text-xl font-bold mt-0.5 flex items-center gap-2">
              {currentPlan?.name || subscription.plan_code}
              <Badge variant={subscription.cancel_at_period_end ? 'warning' : 'gold'}>
                {subscription.cancel_at_period_end ? t.subscription_cancel : subscription.status}
              </Badge>
            </p>
          </div>
          {subscription.current_period_end && (
            <p className="text-sm text-muted-foreground">
              {t.subscription_active} {formatDate(subscription.current_period_end)}
            </p>
          )}
          {!subscription.cancel_at_period_end && subscription.status !== 'cancelled' && (
            <Button variant="outline" size="sm" onClick={() => setCancelOpen(true)}>
              <X className="w-4 h-4" /> {t.subscription_cancel}
            </Button>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-5 items-stretch">
        {plans.map((plan) => {
          const isCurrent = plan.code === currentCode;
          const isFree = plan.code === 'free';
          return (
            <div
              key={plan.id}
              className={cn(
                'card-surface p-6 flex flex-col transition-all',
                isCurrent && 'border-primary/50 shadow-glow-gold'
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                {isCurrent && <Badge variant="gold">{t.subscription_active}</Badge>}
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-bold">${plan.price_monthly}</span>
                <span className="text-sm text-muted-foreground">{t.pricing_per_month}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
              <ul className="mt-5 space-y-2.5 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" strokeWidth={3} />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-5">
                {isCurrent ? (
                  <Button variant="outline" className="w-full" disabled>
                    {t.subscription_active}
                  </Button>
                ) : (
                  <Button
                    variant={isFree ? 'outline' : 'gold'}
                    className="w-full"
                    onClick={() => selectPlan(plan.code)}
                    isLoading={selecting === plan.code}
                  >
                    {isFree ? (
                      <>
                        <Zap className="w-4 h-4" /> {t.subscription_downgrade}
                      </>
                    ) : (
                      <>
                        <Building2 className="w-4 h-4" /> {t.subscription_upgrade} {plan.name}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground max-w-2xl">
        {t.subscription_manage}
      </p>

      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={cancelSub}
        title={t.subscription_cancel}
        description={t.subscription_inactive}
        confirmLabel={t.subscription_cancel}
        destructive
        loading={cancelling}
      />
    </div>
  );
}
