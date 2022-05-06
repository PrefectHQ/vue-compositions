/* eslint-disable @typescript-eslint/no-explicit-any */
import { Ref, UnwrapRef } from 'vue'
import Manager from './manager'
import Subscription from './subscription'

type ToPossibleRefs<T> = {
  [K in keyof T]: T[K] | Ref<UnwrapRef<T[K]>>
}

type MaybeRefs<T extends any[]> = ToPossibleRefs<T> | Ref<ToPossibleRefs<T>>

export type Action = (...args: any[]) => any
export type ActionArguments<T extends Action> = MaybeRefs<Parameters<T>>
export type ActionResponse<T extends Action> = Awaited<ReturnType<T>>

export type ChannelSignature = `${number}-${string}`

export type SubscriptionOptions = {
  interval?: number,
  manager?: Manager,
}

type OnlyRequired<T extends any[], U extends any[] = []> = Partial<T> extends T ? U : T extends [infer F, ...infer R] ? OnlyRequired<R, [...U, F]> : U
type ActionParamsRequired<T extends Action> = OnlyRequired<Parameters<T>>

export type SubscribeArguments<T extends Action> = ActionParamsRequired<T> extends never[]
  ? [action: T, args?: ActionArguments<T>, options?: SubscriptionOptions]
  : [action: T, args: ActionArguments<T>, options?: SubscriptionOptions]


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