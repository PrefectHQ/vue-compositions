import { MaybeRef } from 'vue'
import { SubscriptionManager } from '@/useSubscription/models/manager'
import { Subscription } from '@/useSubscription/models/subscription'
import { Action, ActionArguments, ActionParamsRequired, ActionResponse } from '@/useSubscription/types/action'

export type SubscribeArguments<T extends Action> = ActionParamsRequired<T> extends never[]
  ? [action: T, args?: ActionArguments<T>, options?: MaybeRef<SubscriptionOptions>]
  : [action: T, args: ActionArguments<T>, options?: MaybeRef<SubscriptionOptions>]

export type SubscriptionOptions = {
  /** The maximum time in milliseconds before the subscription is considered stale and refreshes. Defaults to `Infinity` */
  interval?: number,
  manager?: SubscriptionManager,
  lifecycle?: 'component' | 'app',
  onError?: (error: unknown) => void,
}

export type SubscriptionPromise<T extends Action> = Promise<Omit<UseSubscription<T>, 'promise'> & { response: ActionResponse<T> }>

export type MappedSubscription<T extends Action> = {
  loading: Subscription<T>['loading'],
  response: Subscription<T>['response'],
  errored: Subscription<T>['errored'],
  error: Subscription<T>['error'],
  executed: Subscription<T>['executed'],
  paused: Subscription<T>['paused'],
  late: Subscription<T>['late'],
  refresh: Subscription<T>['refresh'],
  unsubscribe: Subscription<T>['unsubscribe'],
  isSubscribed: Subscription<T>['isSubscribed'],
  promise: () => SubscriptionPromise<T>,
}

export type UseSubscription<T extends Action> = {
  /** Set to `true` while the action is being executed. Initially `false`. */
  loading: boolean,
  /** Return value from the `action` after execution. Initially `undefined`. */
  response: ActionResponse<T> | undefined,
  /** Set to `true` if there is an error when executing the action. Initially `false`. */
  errored: boolean,
  /** Stores any error thrown while executing the action. Initially `null`. */
  error: unknown,
  executed: boolean,
  /** Set to `true` if the channel is paused an is not executing */
  paused: boolean,
  /** Set to `true` if an execution was requested while the channel was paused */
  late: boolean,
  /** Executes the `action` again. */
  refresh: Subscription<T>['refresh'],
  /** Remove the subscription from the channel. */
  unsubscribe: Subscription<T>['unsubscribe'],
  isSubscribed: Subscription<T>['isSubscribed'],
  /** Returns a promise that resolves when the `response` is returned. */
  promise: () => SubscriptionPromise<T>,
}