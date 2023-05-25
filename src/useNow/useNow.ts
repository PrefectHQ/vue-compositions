import { ref, Ref } from 'vue'
import { tryOnScopeDispose } from '@/utilities/tryOnScopeDispose'

export type UseNow = {
  now: Ref<Date>,
  pause: () => void,
  resume: () => void,
}

export type UseNowArgs = {
  immediate?: boolean,
  interval?: number,
}

export function useNow({
  immediate = true,
  interval = 0,
}: UseNowArgs = {}): UseNow {
  const response = ref(new Date())
  let id: null | number = null

  function update(): void {
    const now = new Date()

    if (now.getTime() - response.value.getTime() > interval) {
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