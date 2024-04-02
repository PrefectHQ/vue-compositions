import { Ref, computed, ref, watch, toRef, toValue, MaybeRefOrGetter } from 'vue'
import { useIntersectionObserver } from '@/useIntersectionObserver'

export type UsePositionStickyObserverResponse = {
  stuck: Ref<boolean>,
}

export type UsePositionStickyObserverOptions = {
  rootMargin?: string,
  boundingElement?: HTMLElement,
}

const usePositionStickyObserverDefaultOptions = {
  rootMargin: '-1px 0px 0px 0px',
  boundingElement: document.body,
}

export function usePositionStickyObserver(
  element: MaybeRefOrGetter<HTMLElement | undefined>,
  options?: MaybeRefOrGetter<UsePositionStickyObserverOptions>,
): UsePositionStickyObserverResponse {
  const elementRef = toRef(element)
  const stuck = ref(false)

  const observerOptions = computed(() => {
    const { rootMargin: rootMarginOption, boundingElement: boundingElementOption } = toValue(options ?? {})
    const rootMargin = rootMarginOption ?? usePositionStickyObserverDefaultOptions.rootMargin
    const root = boundingElementOption ?? usePositionStickyObserverDefaultOptions.boundingElement

    return {
      threshold: [1],
      rootMargin,
      root,
    }
  })

  function intersect(entries: IntersectionObserverEntry[]): void {
    entries.forEach(entry => {
      stuck.value = entry.intersectionRatio < 1
    })
  }

  const { observe, unobserve } = useIntersectionObserver(intersect, observerOptions)

  watch(elementRef, (newVal, oldVal) => {
    unobserve(oldVal)
    observe(newVal)
  }, { immediate: true })

  return {
    stuck,
  }
}