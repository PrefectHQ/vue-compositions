import debounce from 'lodash.debounce'
import { ref, Ref, watchEffect } from 'vue'

export function useDebouncedRef<T>(input: Ref<T>, wait: Ref<number> | number): Ref<T> {
  const waitRef = ref(wait)
  const copy = ref<T>(input.value) as Ref<T>
  const update = debounce((value: T) => copy.value = value, waitRef.value)

  watchEffect(() => update(input.value))

  return copy
}