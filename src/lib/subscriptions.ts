import { getSdk } from './sdk';
import { type Subscription } from '@chanomhub/sdk';

export type { Subscription };

export async function fetchUserSubscriptions() {
  const sdk = await getSdk();
  return sdk.subscriptions.getAll();
}

export async function createSubscription(planId: string) {
  const sdk = await getSdk();
  return sdk.subscriptions.create({ planId });
}

export async function cancelSubscription(subscriptionId: number | string) {
  const sdk = await getSdk();
  // Ensure subscriptionId is a number as per SDK definition
  const id = typeof subscriptionId === 'string' ? parseInt(subscriptionId, 10) : subscriptionId;
  return sdk.subscriptions.cancel(id);
}

export async function listSubscriptionPlans() {
  const sdk = await getSdk();
  return sdk.subscriptions.getPlans();
}

export async function createSubscriptionPlan(data: any) {
  const sdk = await getSdk();
  return sdk.subscriptions.createPlan(data);
}
