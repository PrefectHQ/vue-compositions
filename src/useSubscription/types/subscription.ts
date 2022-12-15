import Manager from '@/useSubscription/models/manager'
import Subscription from '@/useSubscription/models/subscription'
import { Action, ActionArguments, ActionParamsRequired, ActionResponse } from '@/useSubscription/types/action'

export type SubscribeArguments<T extends Action> = ActionParamsRequired<T> extends never[]
  ? [action: T, args?: ActionArguments<T>, options?: SubscriptionOptions]
  : [action: T, args: ActionArguments<T>, options?: SubscriptionOptions]

export type SubscriptionOptions = {
  interval?: number,
  manager?: Manager,
}

export type MappedSubscription<T extends Action> = {
  loading: Subscription<T>['loading'],
  response: Subscription<T>['response'],
  errored: Subscription<T>['errored'],
  error: Subscription<T>['error'],
  executed: Subscription<T>['executed'],
  refresh: Subscription<T>['refresh'],
  unsubscribe: Subscription<T>['unsubscribe'],
  isSubscribed: Subscription<T>['isSubscribed'],
  promise: () => Promise<UseSubscription<T>>,
}

export type UseSubscription<T extends Action> = {
  loading: boolean,
  response: ActionResponse<T> | undefined,
  errored: boolean,
  error: unknown,
  executed: boolean,
  refresh: Subscription<T>['refresh'],
  unsubscribe: Subscription<T>['unsubscribe'],
  isSubscribed: Subscription<T>['isSubscribed'],
  promise: () => Promise<UseSubscription<T>>,
}