import { computed, ComputedRef, ref, Ref } from 'vue'
import { useElementRect } from '@/useElementRect/useElementRect'
import { getComputedStyleValue } from '@/utilities/getComputedStyleValue'
import { getNumberFromPx } from '@/utilities/getNumberFromPx'

export function useChildrenAreWrapped(children: HTMLElement[] | Ref<HTMLElement[]>, container: HTMLElement | Ref<HTMLElement | undefined>): ComputedRef<boolean> {
  const childrenRef = ref(children)
  const containerRef = ref(container)

  const { width } = useElementRect(containerRef)

  function getContainerGap(): number {
    if (!containerRef.value) {
      return 0
    }

    const gapInPx = getComputedStyleValue(containerRef.value, 'gap')

    return getNumberFromPx(gapInPx)
  }

  const childrenWidthSum = computed(() => {
    const rects = childrenRef.value.map(useElementRect)
    const gap = getContainerGap()

    return rects.reduce((sum, { width }) => sum += width.value + gap, 0)
  })

  return computed(() => childrenWidthSum.value > width.value)
}