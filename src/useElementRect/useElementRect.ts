/* eslint-disable id-length */
import { reactive, ref, Ref, watchEffect } from 'vue'
import { useResizeObserver, UseResizeObserverCallback } from '../useResizeObserver/useResizeObserver'

export function useElementRect(element: HTMLElement | undefined | Ref<HTMLElement | undefined>): DOMRect {
  const elementRef = ref(element)
  const clientRect = reactive(new DOMRect())

  const callback: UseResizeObserverCallback = function([entry]: ResizeObserverEntry[]) {
    const targetRect = entry.target.getBoundingClientRect()

    Object.assign(clientRect, targetRect)
  }

  const observer = useResizeObserver(callback)

  watchEffect(() => {
    if (elementRef.value) {
      const targetRect = elementRef.value.getBoundingClientRect()

      Object.assign(clientRect, targetRect)

      observer.disconnect()
      observer.observe(elementRef)
    }
  })

  return clientRect
}