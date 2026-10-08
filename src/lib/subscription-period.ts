interface SubscriptionWithItems {
  items: { data: ReadonlyArray<{ current_period_end: number }> };
}

export function getPeriodEnd(subscription: SubscriptionWithItems): Date {
  const [item] = subscription.items.data;
  if (!item) {
    throw new Error("Subscription has no subscription items");
  }
  return new Date(item.current_period_end * 1000);
}
