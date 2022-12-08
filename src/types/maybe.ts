import { Ref, UnwrapRef } from 'vue'

export type MaybePromise<T> = T | Promise<T>
export type MaybeRef<T> = T | Ref<T>
export type MaybeUnwrapRef<T> = T | UnwrapRef<T>
export type MaybeArray<T> = T | T[]