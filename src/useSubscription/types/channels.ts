import { SubscriptionManager } from '@/useSubscription/models'

export type RefreshChannelOptions = {
  maxRefreshRate?: number,
  manager?: SubscriptionManager,
}

export type ManagerRefreshChannelOptions = Omit<RefreshChannelOptions, 'manager'>