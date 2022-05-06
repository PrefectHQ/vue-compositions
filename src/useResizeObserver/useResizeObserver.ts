import { onMounted, onUnmounted, Ref } from 'vue'

export type UseResizeObserverResponse = {
  observe: (element: Ref<HTMLElement | undefined>) => void,
  unobserve: (element: Ref<HTMLElement | undefined>) => void,
  disconnect: () => void,
  check: (element: Ref<HTMLElement | undefined>) => void,
}

export type UseResizeObserverCallback = (entries: ResizeObserverEntry[]) => void

export function useResizeObserver(callback: UseResizeObserverCallback): UseResizeObserverResponse {

  let intersectionObserver: ResizeObserver | null = null

  function observe(element: Ref<HTMLElement | undefined>): void {
    const observer = getObserver()

    if (element.value) {
      observer.observe(element.value)
    }
  }

  function unobserve(element: Ref<HTMLElement | undefined>): void {
    const observer = getObserver()

    if (element.value) {
      observer.unobserve(element.value)
    }
  }

  function disconnect(): void {
    const observer = getObserver()

    observer.disconnect()
  }

  function check(element: Ref<HTMLElement | undefined>): void {
    if (!element.value) {
      return
    }

    const observer = new ResizeObserver(callback)

    observer.observe(element.value)

    setTimeout(() => observer.disconnect(), 100)
  }

  function getObserver(): ResizeObserver {
    if (!intersectionObserver) {
      createObserver()
    }

    return intersectionObserver!
  }

  function createObserver(): void {
    intersectionObserver = new ResizeObserver(callback)
  }

  onMounted(() => {
    createObserver()
  })

  onUnmounted(() => {
    disconnect()
  })

  return {
    observe,
    disconnect,
    unobserve,
    check,
  }
}