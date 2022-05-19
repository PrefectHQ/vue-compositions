import { onMounted, onUnmounted, Ref, unref } from 'vue'

export type UseIntersectionObserverResponse = {
  observe: (element: Ref<HTMLElement | undefined>) => void,
  unobserve: (element: Ref<HTMLElement | undefined>) => void,
  disconnect: () => void,
  check: (element: Ref<HTMLElement | undefined>) => void,
}

export type UseIntersectionObserverOptions = {
  root?: Element | Document | null | Ref<Element | null>,
  rootMargin?: string,
  threshold?: number | number[],
}

export type UseIntersectionObserverCallback = (entries: IntersectionObserverEntry[]) => void

export function useIntersectionObserver(callback: UseIntersectionObserverCallback, options: UseIntersectionObserverOptions = {}): UseIntersectionObserverResponse {

  let intersectionObserver: IntersectionObserver | null = null

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

  function getOptions({ root, rootMargin, threshold }: UseIntersectionObserverOptions): IntersectionObserverInit {
    return {
      root: unref(root),
      rootMargin,
      threshold,
    }
  }

  function check(element: Ref<HTMLElement | undefined>): void {
    if (!element.value) {
      return
    }

    const observer = new IntersectionObserver(callback, getOptions(options))

    observer.observe(element.value)

    setTimeout(() => observer.disconnect(), 100)
  }

  function getObserver(): IntersectionObserver {
    if (!intersectionObserver) {
      createObserver()
    }

    return intersectionObserver!
  }

  function createObserver(): void {
    intersectionObserver = new IntersectionObserver(callback, getOptions(options))
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