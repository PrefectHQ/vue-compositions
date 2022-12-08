import { Ref, computed } from 'vue'

export function usePatchRef<T extends Record<string, unknown>, P extends keyof T>(source: Ref<T>, key: P): Ref<T[P]> {
  return computed({
    get() {
      return source.value[key]
    },
    set(value: T[P]) {
      source.value = {
        ...source.value,
        [key]: value,
      }
    },
  })
}