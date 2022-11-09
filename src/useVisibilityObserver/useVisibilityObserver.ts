import { onMounted, ref, Ref } from 'vue'
import { useIntersectionObserver, UseIntersectionObserverOptions } from '@/useIntersectionObserver'

export type UseVisibilityObserverResponse = {
  visible: Ref<boolean>,
  disconnect: () => void,
}

export type UseVisibilityObserverOptions = UseIntersectionObserverOptions & { disconnectWhenVisible: boolean }

export function useVisibilityObserver(element: Ref<HTMLElement | undefined>, options: UseVisibilityObserverOptions = { disconnectWhenVisible: false }): UseVisibilityObserverResponse {
  const visible = ref(false)

  function intersect(entries: IntersectionObserverEntry[]): void {
    entries.forEach(entry => {
      visible.value = entry.isIntersecting

      if (options.disconnectWhenVisible && entry.isIntersecting) {
        disconnect()
      }
    })
  }

  const { root, rootMargin, threshold } = options

  const { observe, disconnect } = useIntersectionObserver(intersect, { root, rootMargin, threshold })

  onMounted(() => {
    observe(element)
  })

  return { visible, disconnect }
}
