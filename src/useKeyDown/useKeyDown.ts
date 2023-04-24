import { ComputedRef, computed, onMounted, onUnmounted, ref, unref } from 'vue'
import { MaybeArray, MaybeRef } from '@/types/maybe'
import { asArray } from '@/utilities/arrays'

export type UseKeyDown = {
  down: ComputedRef<boolean>,
  up: ComputedRef<boolean>,
}

export type UseKeyDownCallback = (event: KeyboardEvent) => void

export function useKeyDown(key: MaybeRef<MaybeArray<string>>, callback?: UseKeyDownCallback): UseKeyDown {
  const keys = computed(() => asArray(unref(key)))
  const isPressed = ref(false)
  const down = computed(() => isPressed.value)
  const up = computed(() => !isPressed.value)

  function keyDownCallback(event: KeyboardEvent): void {
    if (keys.value.includes(event.key)) {
      isPressed.value = true
      callback?.(event)
    }
  }

  function keyUpCallback(event: KeyboardEvent): void {
    if (keys.value.includes(event.key)) {
      isPressed.value = false
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', keyDownCallback)
    document.addEventListener('keyup', keyUpCallback)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', keyDownCallback)
    document.removeEventListener('keyup', keyUpCallback)
  })

  return {
    down,
    up,
  }
}