import { onMounted, onUnmounted, ref, Ref } from 'vue'

export type UseResizeObserverResponse = {
  observe: (element: HTMLElement | Ref<HTMLElement | undefined>) => void,
  unobserve: (element: HTMLElement | Ref<HTMLElement | undefined>) => void,
  disconnect: () => void,
  check: (element: HTMLElement | Ref<HTMLElement | undefined>) => void,
}

export type UseResizeObserverCallback = (entries: ResizeObserverEntry[]) => void

export function useResizeObserver(callback: UseResizeObserverCallback): UseResizeObserverResponse {

  let intersectionObserver: ResizeObserver | null = null

  const observe: UseResizeObserverResponse['observe'] = (element) => {
    const elementRef = ref(element)
    const observer = getObserver()

    if (elementRef.value) {
      observer.observe(elementRef.value)
    }
  }

  const unobserve: UseResizeObserverResponse['unobserve'] = (element) => {
    const elementRef = ref(element)
    const observer = getObserver()

    if (elementRef.value) {
      observer.unobserve(elementRef.value)
    }
  }

  const disconnect: UseResizeObserverResponse['disconnect'] = () => {
    const observer = getObserver()

    observer.disconnect()
  }

  const check: UseResizeObserverResponse['check'] = (element) => {
    const elementRef = ref(element)
    if (!elementRef.value) {
      return
    }

    const observer = new ResizeObserver(callback)

    observer.observe(elementRef.value)

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