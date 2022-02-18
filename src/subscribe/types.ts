/* eslint-disable @typescript-eslint/no-explicit-any */
import { Ref, UnwrapRef } from 'vue'
import Manager from './manager'

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
}

type OnlyRequired<T extends any[], U extends any[] = []> = Partial<T> extends T ? U : T extends [infer F, ...infer R] ? OnlyRequired<R, [...U, F]> : U
type ActionParamsRequired<T extends Action> = OnlyRequired<Parameters<T>>

export type SubscribeArguments<T extends Action> = ActionParamsRequired<T> extends never[]
  ? [action: T, args?: ActionArguments<T>, options?: SubscriptionOptions, manager?: Manager ]
  : [action: T, args: ActionArguments<T>, options?: SubscriptionOptions, manager?: Manager ]