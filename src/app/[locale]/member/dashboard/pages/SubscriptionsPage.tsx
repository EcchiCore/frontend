'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { subscriptionApi, ApiError } from '../utils/api';
import { Subscription, SubscriptionPlan } from '../utils/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { useAuthContext } from '../providers/AuthProvider';

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  ACTIVE: 'default',
  CANCELED: 'secondary',
  SUSPENDED: 'destructive',
  PAST_DUE: 'destructive',
  UNPAID: 'destructive',
};

const formatDate = (value: string) => {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(value));
  } catch {
    return value;
  }
};

const formatDuration = (days: number) => {
  if (days % 30 === 0) {
    const months = days / 30;
    return `${months} month${months > 1 ? 's' : ''}`;
  }
  if (days % 7 === 0) {
    const weeks = days / 7;
    return `${weeks} week${weeks > 1 ? 's' : ''}`;
  }
  return `${days} day${days > 1 ? 's' : ''}`;
};

export const SubscriptionsPage: React.FC = () => {
  const { user, refreshUser } = useAuthContext();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionTarget, setActionTarget] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [fetchedPlans, fetchedSubscriptions] = await Promise.all([
        subscriptionApi.listPlans(),
        subscriptionApi.getUserSubscriptions(),
      ]);
      setPlans(fetchedPlans);
      setSubscriptions(fetchedSubscriptions);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load subscriptions';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubscribe = async (planId: string) => {
    setActionTarget(planId);
    setError(null);
    setMessage(null);
    try {
      await subscriptionApi.createSubscription(planId);
      setMessage('Subscription activated successfully.');
      await fetchData();
      await refreshUser();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Unable to activate subscription';
      setError(message);
    } finally {
      setActionTarget(null);
    }
  };

  const handleCancel = async (subscriptionId: number) => {
    const key = `cancel-${subscriptionId}`;
    setActionTarget(key);
    setError(null);
    setMessage(null);
    try {
      await subscriptionApi.cancelSubscription(subscriptionId);
      setMessage('Subscription canceled.');
      await fetchData();
      await refreshUser();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Unable to cancel subscription';
      setError(message);
    } finally {
      setActionTarget(null);
    }
  };

  const planById = useMemo(() => {
    return plans.reduce<Record<string, SubscriptionPlan>>((acc, plan) => {
      acc[plan.planId] = plan;
      return acc;
    }, {});
  }, [plans]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center py-24">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Subscriptions</h1>
        <p className="text-sm text-muted-foreground">
          Manage your membership plans and renewals. Current balance: {user?.points ?? 0} points.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {message && (
        <Alert>
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {plans.map((plan) => {
          const active = subscriptions.find((subscription) => subscription.planId === plan.planId && subscription.status === 'ACTIVE');
          const isProcessing = actionTarget === plan.planId || actionTarget === `cancel-${active?.id}`;
          const planDescription =
            typeof plan.description === 'string' && plan.description.trim().length > 0
              ? plan.description
              : 'No description provided.';

          return (
            <Card key={plan.planId} className="flex flex-col justify-between">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-foreground">
                  <span>{plan.name}</span>
                  <Badge variant="outline" className="text-sm">
                    {plan.pointsCost} points
                  </Badge>
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {planDescription}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Duration</span>
                  <span className="font-medium text-foreground">{formatDuration(plan.durationDays)}</span>
                </div>

                {active ? (
                  <div className="space-y-2 rounded-md border border-border p-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant={statusVariant[active.status] ?? 'outline'} className="uppercase">
                        {active.status.toLowerCase()}
                      </Badge>
                      <span className="text-muted-foreground">Renews on {formatDate(active.currentPeriodEnd)}</span>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleCancel(active.id)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Cancel subscription
                    </Button>
                  </div>
                ) : (
                  <Button className="w-full" onClick={() => handleSubscribe(plan.planId)} disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Subscribe now
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Active subscriptions</CardTitle>
          <CardDescription className="text-muted-foreground">
            Overview of your current and previous subscriptions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscriptions.length === 0 ? (
            <p className="text-sm text-muted-foreground">You have no subscriptions yet.</p>
          ) : (
            <div className="space-y-4">
              {subscriptions.map((subscription) => {
                const plan = planById[subscription.planId];
                const isCancelling = actionTarget === `cancel-${subscription.id}`;
                return (
                  <div
                    key={subscription.id}
                    className="rounded-lg border border-border p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{plan?.name ?? subscription.planId}</span>
                          <Badge variant={statusVariant[subscription.status] ?? 'outline'} className="uppercase">
                            {subscription.status.toLowerCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Current period: {formatDate(subscription.currentPeriodStart)} – {formatDate(subscription.currentPeriodEnd)}
                        </p>
                      </div>
                      {subscription.status === 'ACTIVE' && (
                        <Button variant="outline" onClick={() => handleCancel(subscription.id)} disabled={isCancelling}>
                          {isCancelling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
