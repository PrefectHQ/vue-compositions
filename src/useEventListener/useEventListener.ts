import { ref, watch, toValue, MaybeRefOrGetter } from 'vue'
import { tryOnScopeDispose } from '@/utilities/tryOnScopeDispose'

export type UseEventListener = {
  add: () => void,
  remove: () => void,
}

export type UseEventListenerOptions = AddEventListenerOptions & {
  immediate?: boolean,
}

const defaultOptions: UseEventListenerOptions = {
  immediate: true,
}

export function useEventListener<K extends keyof DocumentEventMap>(target: MaybeRefOrGetter<Document | undefined | null>, key: K, callback: (this: Document, event: DocumentEventMap[K]) => unknown, options?: UseEventListenerOptions): UseEventListener
export function useEventListener<K extends keyof HTMLElementEventMap>(target: MaybeRefOrGetter<HTMLElement | undefined | null>, key: K, callback: (this: HTMLElement, event: HTMLElementEventMap[K]) => unknown, options?: UseEventListenerOptions): UseEventListener
export function useEventListener<K extends keyof WindowEventMap>(target: MaybeRefOrGetter<Window | undefined | null>, key: K, callback: (this: Window, event: WindowEventMap[K]) => unknown, options?: UseEventListenerOptions): UseEventListener
// eslint-disable-next-line max-params
export function useEventListener<K extends string>(target: MaybeRefOrGetter<Window | Node | undefined | null>, key: K, callback: (this: Node | Window, event: Event) => unknown, options: UseEventListenerOptions = {}): UseEventListener {
  const { immediate, ...listenerOptions } = { ...defaultOptions, ...options }
  const manualMode = ref(!immediate)

  function addEventListener(): void {
    toValue(target)?.addEventListener(key, callback, listenerOptions)
  }

  function removeEventListener(): void {
    toValue(target)?.removeEventListener(key, callback, listenerOptions)
  }

  tryOnScopeDispose(removeEventListener)

  watch(() => toValue(target), () => {
    if (!manualMode.value) {
      removeEventListener()
      addEventListener()
    }
  }, { immediate: true })

  return {
    add: () => {
      addEventListener()
    },
    remove: () => {
      manualMode.value = true
      removeEventListener()
    },
  }
}