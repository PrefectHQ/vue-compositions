import { UnwrapRef } from 'vue'

export type MaybePromise<T = unknown> = T | Promise<T>
export type MaybeUnwrapRef<T = unknown> = T | UnwrapRef<T>
export type MaybeArray<T = unknown> = T | T[]