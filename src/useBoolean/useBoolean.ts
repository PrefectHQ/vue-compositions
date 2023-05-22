import { ref } from 'vue'
import { MaybeRef } from '@/types/maybe'

type UseBoolean = {
  value: MaybeRef<boolean>,
  toggle: () => void,
  setTrue: () => void,
  setFalse: () => void,
}

export function useBoolean(valueRef?: MaybeRef<boolean>): UseBoolean {
  const value = ref(valueRef ?? false)

  const toggle = (): void => {
    value.value = !value.value
  }

  const setTrue = (): void => {
    value.value = true
  }

  const setFalse = (): void => {
    value.value = false
  }

  return { value, toggle, setTrue, setFalse }
}

