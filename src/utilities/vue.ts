import { unref } from 'vue'
import { MaybeRefOrGetter } from '@/types/maybe'
import { isFunction } from '@/utilities/functions'

// temp shim for Vue 3.3^ function
export function toValue<T>(source: MaybeRefOrGetter<T>): T {
  return isFunction(source) ? source() : unref(source)
}