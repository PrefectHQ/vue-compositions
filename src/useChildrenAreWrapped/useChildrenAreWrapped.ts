import { computed, ComputedRef, ref, Ref } from 'vue'
import { useComputedStyle } from '@/useComputedStyle/useComputedStyle'
import { useElementRect } from '@/useElementRect/useElementRect'

export function useChildrenAreWrapped(children: Element[] | Ref<Element[]>, container: Element | Ref<Element | undefined>): ComputedRef<boolean> {
  const childrenRef = ref(children)
  const containerRef = ref(container)

  const { width } = useElementRect(containerRef)
  const { gap, paddingLeft, paddingRight } = useComputedStyle(container)

  const childrenWidthSum = computed(() => {
    const childrenSize = childrenRef.value.map(element => ({
      rect: useElementRect(element),
      style: useComputedStyle(element),
    }))

    return childrenSize.reduce((sum, { rect, style }) => {
      const margin = getPxValue(style.marginLeft) + getPxValue(style.marginRight)
      const border = getPxValue(style.borderTopWidth) + getPxValue(style.borderBottomWidth)
      const containerGap = getPxValue(gap)

      return sum += rect.width.value + margin + border + containerGap
    }, 0)
  })

  const containerWidthWithoutPadding = computed(() => {
    return width.value - getPxValue(paddingLeft) - getPxValue(paddingRight)
  })

  return computed(() => childrenWidthSum.value > containerWidthWithoutPadding.value)
}

function getPxValue(property: Ref<string | undefined> | undefined): number {
  return parseInt(property?.value ?? '0')
}