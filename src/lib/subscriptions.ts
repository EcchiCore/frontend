export interface SubscriptionDto {
  id: number;
  planId: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  [key: string]: unknown;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:3000';

export async function fetchUserSubscriptions(token: string) {
  const res = await fetch(`${API_BASE}/api/subscriptions`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to load subscriptions');
  }

  return (await res.json()) as SubscriptionDto[];
}

export async function createSubscription(
  token: string,
  payload: { planId: string },
) {
  const res = await fetch(`${API_BASE}/api/subscriptions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Unable to start subscription');
  }

  return res.json();
}

export async function cancelSubscription(token: string, subscriptionId: number | string) {
  const res = await fetch(`${API_BASE}/api/subscriptions/${subscriptionId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error('Cancel failed');
  }

  return res.json();
}
