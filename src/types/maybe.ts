/* eslint-disable @typescript-eslint/no-explicit-any */
import { Ref, UnwrapRef } from 'vue'

export type MaybePromise<T = any> = T | Promise<T>
export type MaybeRef<T = any> = T | Ref<T>
export type MaybeUnwrapRef<T = any> = T | UnwrapRef<T>
export type MaybeArray<T = any> = T | T[]