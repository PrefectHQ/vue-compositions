/* eslint-disable id-length */
import { reactive, ref, Ref, watchEffect } from 'vue'
import { useResizeObserver, UseResizeObserverCallback } from '../useResizeObserver/useResizeObserver'

type ElementRect = Omit<DOMRect, 'toJSON'>

export function useElementRect(element: HTMLElement | undefined | Ref<HTMLElement | undefined>): ElementRect {
  const elementRef = ref(element)
  const clientRect = reactive({
    height: 0,
    width: 0,
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  })

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