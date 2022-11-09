import { onMounted, ref, Ref } from 'vue'
import { useIntersectionObserver } from '@/useIntersectionObserver'

export function useVisibilityObserver(element: Ref<HTMLElement | undefined>): Ref<boolean> {
  const visible = ref(false)

  function intersect(entries: IntersectionObserverEntry[]): void {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        visible.value = true
        disconnect()
      }
    })
  }

  const { observe, disconnect } = useIntersectionObserver(intersect)

  onMounted(() => {
    observe(element)
  })

  return visible
}

