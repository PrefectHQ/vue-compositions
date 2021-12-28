import { Ref, UnwrapRef } from 'vue'

type ToPossibleRefs<T> = {
  [K in keyof T]: T[K] | Ref<UnwrapRef<T[K]>>
}

type MaybeRefs<T> = T | Ref<T> | ToPossibleRefs<T> | Ref<ToPossibleRefs<T>>

// any is necessary in order to infer the action's args and return type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Action = (...args: any[]) => any
export type ActionArguments<T extends Action> = MaybeRefs<Parameters<T>>
export type ActionResponse<T extends Action> = Awaited<ReturnType<T>>

export type ChannelSignature = `${number}-${string}`

export type SubscriptionOptions = {
  interval?: number,
}
