import { ref, Ref } from 'vue'
import { MaybeRef } from '@/types/maybe'
import { tryOnScopeDispose } from '@/utilities/tryOnScopeDispose'

export type UseNow = {
  now: Ref<Date>,
  pause: () => void,
  resume: () => void,
}

export type UseNowArgs = {
  immediate?: boolean,
  interval?: MaybeRef<number>,
}

export function useNow({
  immediate = true,
  interval = 0,
}: UseNowArgs = {}): UseNow {
  const response = ref(new Date())
  const intervalRef = ref(interval)
  let id: null | number = null

  function update(): void {
    const now = new Date()

    if (now.getTime() - response.value.getTime() > intervalRef.value) {
      response.value = now
    }

    id = window.requestAnimationFrame(update)
  }

  function pause(): void {
    if (id) {
      window.cancelAnimationFrame(id)
    }

    id = null
  }

  function resume(): void {
    id = window.requestAnimationFrame(update)
  }

  if (immediate) {
    resume()
  }

  tryOnScopeDispose(pause)

  return {
    now: response,
    resume,
    pause,
  }
}