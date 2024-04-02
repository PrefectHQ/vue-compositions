import { computed, onMounted, ref, Ref, MaybeRef } from 'vue'
import { useIntersectionObserver, UseIntersectionObserverOptions } from '@/useIntersectionObserver'

export type UseVisibilityObserverResponse = {
  elementRef: Ref<HTMLElement | undefined>,
  visible: Ref<boolean>,
  disconnect: () => void,
}

export type UseVisibilityObserverOptions = UseIntersectionObserverOptions & { disconnectWhenVisible?: boolean }

export function useVisibilityObserver(element?: MaybeRef<HTMLElement | undefined>, options: MaybeRef<UseVisibilityObserverOptions> = {}): UseVisibilityObserverResponse {
  const visible = ref(false)
  const optionsRef = ref(options)
  const elementRef = ref(element)
  const disconnectWhenVisible = computed(() => optionsRef.value.disconnectWhenVisible ?? false)

  function intersect(entries: IntersectionObserverEntry[]): void {
    entries.forEach(entry => {
      visible.value = entry.isIntersecting

      if (disconnectWhenVisible.value && entry.isIntersecting) {
        disconnect()
      }
    })
  }

  const { observe, disconnect } = useIntersectionObserver(intersect, optionsRef)

  onMounted(() => {
    observe(elementRef)
  })

  return { elementRef, visible, disconnect }
}
