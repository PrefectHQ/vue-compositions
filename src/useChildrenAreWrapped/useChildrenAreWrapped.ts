import { computed, ComputedRef, ref, Ref } from 'vue'
import { useComputedStyle } from '@/useComputedStyle/useComputedStyle'
import { useElementRect } from '@/useElementRect/useElementRect'

export function useChildrenAreWrapped(children: HTMLElement[] | Ref<HTMLElement[]>, container: HTMLElement | Ref<HTMLElement | undefined>): ComputedRef<boolean> {
  const childrenRef = ref(children)
  const containerRef = ref(container)

  const { width } = useElementRect(containerRef)
  const { gap, paddingLeft, paddingRight } = useComputedStyle(container)

  const childrenWidthSum = computed(() => {
    const rects = childrenRef.value.map(useElementRect)

    return rects.reduce((sum, { width }) => sum += width.value + getPxValue(gap), 0)
  })

  const containerWidthWithoutPadding = computed(() => {
    return width.value - getPxValue(paddingLeft) - getPxValue(paddingRight)
  })

  return computed(() => childrenWidthSum.value > containerWidthWithoutPadding.value)
}

function getPxValue(property: Ref<string | undefined> | undefined): number {
  return parseInt(property?.value ?? '0')
}