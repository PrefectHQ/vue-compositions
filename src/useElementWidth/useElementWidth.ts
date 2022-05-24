import { ref, Ref, watchEffect } from 'vue'
import { useResizeObserver, UseResizeObserverCallback } from '../useResizeObserver/useResizeObserver'

export function useElementWidth(element: HTMLElement | undefined | Ref<HTMLElement | undefined>): Ref<number> {
  const elementRef = ref(element)
  const widthInPixels = ref<number>(0)

  const callback: UseResizeObserverCallback = function([entry]: ResizeObserverEntry[]) {
    console.log({ callback: entry })
    const { width } = entry.target.getBoundingClientRect()

    widthInPixels.value = width
  }

  const observer = useResizeObserver(callback)

  watchEffect(() => {
    if (elementRef.value) {
      console.log({ watch: elementRef.value })
      const { width } = elementRef.value.getBoundingClientRect()

      widthInPixels.value = width
      observer.disconnect()
      observer.observe(elementRef)
    }
  })

  return widthInPixels
}