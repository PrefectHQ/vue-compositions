import { onMounted, onUnmounted, ref, Ref, unref, watch, toValue, MaybeRef, MaybeRefOrGetter } from 'vue'

export type UseIntersectionObserverResponse = {
  observe: (element: MaybeRefOrGetter<HTMLElement | undefined>) => void,
  unobserve: (element: MaybeRefOrGetter<HTMLElement | undefined>) => void,
  disconnect: () => void,
  check: (element: MaybeRefOrGetter<HTMLElement | undefined>) => void,
}

export type UseIntersectionObserverOptions = {
  root?: Element | Document | null | Ref<Element | null>,
  rootMargin?: string,
  threshold?: number | number[],
}

export type UseIntersectionObserverCallback = (entries: IntersectionObserverEntry[]) => void

export function useIntersectionObserver(callback: UseIntersectionObserverCallback, options: MaybeRef<UseIntersectionObserverOptions> = {}): UseIntersectionObserverResponse {
  const optionsRef = ref(options)
  const elements = new Set<HTMLElement>()

  let intersectionObserver: IntersectionObserver | null = null

  function observe(element: MaybeRefOrGetter<HTMLElement | undefined>): void {
    const value = toValue(element)
    const observer = getObserver()

    if (value) {
      observer.observe(value)
      elements.add(value)
    }
  }

  function unobserve(element: MaybeRefOrGetter<HTMLElement | undefined>): void {
    const value = toValue(element)
    const observer = getObserver()

    if (value) {
      observer.unobserve(value)
      elements.delete(value)
    }
  }

  function disconnect(): void {
    const observer = getObserver()

    observer.disconnect()
    elements.clear()
  }

  function getOptions({ root, rootMargin, threshold }: UseIntersectionObserverOptions): IntersectionObserverInit {
    return {
      root: unref(root),
      rootMargin,
      threshold,
    }
  }

  function check(element: MaybeRefOrGetter<HTMLElement | undefined>): void {
    const value = toValue(element)

    if (!value) {
      return
    }

    const observer = new IntersectionObserver(callback, getOptions(optionsRef.value))

    observer.observe(value)

    setTimeout(() => observer.disconnect(), 100)
  }

  function getObserver(): IntersectionObserver {
    if (!intersectionObserver) {
      createObserver()
    }

    return intersectionObserver!
  }

  function createObserver(): void {
    if (intersectionObserver) {
      intersectionObserver.disconnect()
    }

    intersectionObserver = new IntersectionObserver(callback, getOptions(optionsRef.value))

    elements.forEach(element => intersectionObserver!.observe(element))
  }

  onMounted(() => {
    createObserver()
  })

  onUnmounted(() => {
    disconnect()
  })

  watch(optionsRef, () => {
    createObserver()
  })

  return {
    observe,
    disconnect,
    unobserve,
    check,
  }
}