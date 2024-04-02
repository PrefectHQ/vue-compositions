import { computed, ComputedRef, ref, MaybeRef } from 'vue'
import { isSame } from '@/utilities/isSame'

export function useIsSame(valueA: MaybeRef, valueB: MaybeRef): ComputedRef<boolean> {
  const valueARef = ref(valueA)
  const valueBRef = ref(valueB)

  return computed(() => isSame(valueARef.value, valueBRef.value))
}