import { Ref, computed, onMounted, ref, toValue } from 'vue'
import { MaybeRefOrGetter } from '@/types/maybe'
import { useIntersectionObserver } from '@/useIntersectionObserver'

export type UsePositionStickyObserverResponse = {
  stuck: Ref<boolean>,
}

export type UsePositionStickyObserverOptions = {
  rootMargin?: string,
  boundingElement?: MaybeRefOrGetter<HTMLElement | undefined>,
}

const usePositionStickyObserverDefaultOptions = {
  rootMargin: '-1px 0px 0px 0px',
  boundingElement: document.body,
}

export function usePositionStickyObserver(
  element: MaybeRefOrGetter<HTMLElement | undefined>,
  options?: MaybeRefOrGetter<UsePositionStickyObserverOptions>,
): UsePositionStickyObserverResponse {
  const elementRef = computed(() => toValue(element))
  const optionsRef = computed(() => {
    if (!options) {
      return usePositionStickyObserverDefaultOptions
    }

    const { rootMargin, boundingElement } = toValue(options)
    const boundingElementRef = toValue(boundingElement)

    return {
      rootMargin: rootMargin ?? usePositionStickyObserverDefaultOptions.rootMargin,
      boundingElement: boundingElementRef ?? usePositionStickyObserverDefaultOptions.boundingElement,
    }
  })

  const stuck = ref(false)

  function intersect(entries: IntersectionObserverEntry[]): void {
    entries.forEach(entry => {
      stuck.value = entry.intersectionRatio < 1
    })
  }

  const { observe } = useIntersectionObserver(intersect, computed(() => ({
    threshold: [1],
    rootMargin: optionsRef.value.rootMargin,
    root: optionsRef.value.boundingElement,
  })))

  onMounted(() => observe(elementRef))

  return {
    stuck,
  }
}