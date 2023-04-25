import { ComputedRef, computed, onUnmounted, reactive, unref } from 'vue'
import { MaybeArray, MaybeRef } from '@/types/maybe'
import { asArray } from '@/utilities/arrays'

export type UseKeyDown = {
  down: ComputedRef<boolean>,
  up: ComputedRef<boolean>,
}

export type UseKeyDownCallback = (event: KeyboardEvent) => void

export type UseKeyDownArgs = [key: MaybeRef<MaybeArray<string>>, callback?: UseKeyDownCallback]

function useKeyDownFactory(): (...args: UseKeyDownArgs) => UseKeyDown {
  const downKeys = reactive<Set<string>>(new Set())
  const callbacks = new Set<UseKeyDownCallback>()

  function keyDownCallback(event: KeyboardEvent): void {
    downKeys.add(event.key)

    callbacks.forEach(callback => callback(event))
  }

  function keyUpCallback(event: KeyboardEvent): void {
    downKeys.delete(event.key)
  }

  document.addEventListener('keydown', keyDownCallback)
  document.addEventListener('keyup', keyUpCallback)

  return (...[key, callback]: UseKeyDownArgs): UseKeyDown => {
    const keys = computed(() => asArray(unref(key)))
    const down = computed(() => keys.value.some(key => downKeys.has(key)))
    const up = computed(() => !down.value)

    const filteredCallback: UseKeyDownCallback = (event) => {
      if (keys.value.includes(event.key)) {
        callback?.(event)
      }
    }

    callbacks.add(filteredCallback)

    onUnmounted(() => {
      callbacks.delete(filteredCallback)
    })

    return {
      up,
      down,
    }
  }
}

export const useKeyDown = useKeyDownFactory()