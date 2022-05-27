import debounce from 'lodash.debounce'
import { ref, Ref, watchEffect } from 'vue'

export function useDebouncedRef<T>(source: Ref<T>, wait: Ref<number> | number): Ref<T> {
  const waitRef = ref(wait)
  const debounced = ref<T>(source.value) as Ref<T>
  const update = debounce((value: T) => debounced.value = value, waitRef.value)

  watchEffect(() => update(source.value))

  return debounced
}