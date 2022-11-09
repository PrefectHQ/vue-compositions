import { onMounted, ref, Ref } from 'vue'
import { useIntersectionObserver, UseIntersectionObserverOptions } from '@/useIntersectionObserver'

export type UseVisibilityObserverResponse = {
  visible: Ref<boolean>,
  disconnect: () => void,
}

export function useVisibilityObserver(element: Ref<HTMLElement | undefined>, disconnectWhenVisible: boolean = false, options: UseIntersectionObserverOptions = {}): UseVisibilityObserverResponse {
  const visible = ref(false)

  function intersect(entries: IntersectionObserverEntry[]): void {
    entries.forEach(entry => {
        visible.value = entry.isIntersecting

        if (disconnectWhenVisible) {
          disconnect()
        }
    })
  }

  const { observe, disconnect } = useIntersectionObserver(intersect, options)

  onMounted(() => {
    observe(element)
  })

  return { visible, disconnect }
}
