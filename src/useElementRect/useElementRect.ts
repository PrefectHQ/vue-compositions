/* eslint-disable id-length */
import { reactive, ref, Ref, watchEffect } from 'vue'
import { useResizeObserver, UseResizeObserverCallback } from '../useResizeObserver/useResizeObserver'

type Rect = {
  width: number,
  height: number,
  x: number,
  y: number,
}

export function useElementRect(element: HTMLElement | undefined | Ref<HTMLElement | undefined>): Rect {
  const elementRef = ref(element)
  const clientRect = reactive<Rect>({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  })

  const callback: UseResizeObserverCallback = function([entry]: ResizeObserverEntry[]) {
    const { width, height, x, y } = entry.target.getBoundingClientRect()

    clientRect.width = width
    clientRect.height = height
    clientRect.x = x
    clientRect.y = y
  }

  const observer = useResizeObserver(callback)

  watchEffect(() => {
    if (elementRef.value) {
      const { width, height, x, y } = elementRef.value.getBoundingClientRect()

      clientRect.width = width
      clientRect.height = height
      clientRect.x = x
      clientRect.y = y

      observer.disconnect()
      observer.observe(elementRef)
    }
  })

  return clientRect
}