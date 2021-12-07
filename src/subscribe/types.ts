import { Ref, UnwrapRef } from 'vue'

type ToPossibleRefs<T> = {
  [K in keyof T]: T[K] | Ref<UnwrapRef<T[K]>>
}

type MaybeRefs<T> = T | Ref<T> | ToPossibleRefs<T> | Ref<ToPossibleRefs<T>>

export type Action = (...args: any[]) => any
export type ActionArguments<T extends Action> = MaybeRefs<Parameters<T>>
export type ActionResponse<T extends Action> = Awaited<ReturnType<T>>

export type ChannelSignature = `${number}-${string}`

export type SubscriptionOptions = {
  interval?: number
  updateResultOnSubscribe?: boolean
}
