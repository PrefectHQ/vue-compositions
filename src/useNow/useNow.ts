import { ref, Ref, MaybeRef } from 'vue'
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
  const intervalRef = ref(interval)
  const response = ref(getNow())
  let id: null | number = null

  function getNow(): Date {
    if (intervalRef.value === 0) {
      return new Date()
    }

    const time = new Date().getTime()
    const nearest = Math.round(time / intervalRef.value) * intervalRef.value

    return new Date(nearest)
  }

  function update(): void {
    const now = getNow()

    if (response.value.getTime() !== now.getTime()) {
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