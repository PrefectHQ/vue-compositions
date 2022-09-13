import { computed, ComputedRef, ref, Ref } from 'vue'
import { useComputedStyle } from '../useComputedStyle/useComputedStyle'
import { useElementRect } from '../useElementRect/useElementRect'
import { getComputedStyleRecord } from '@/utilities/window'

export function useChildrenAreWrapped(children: Element[] | Ref<Element[]>, container: Element | Ref<Element | undefined>): ComputedRef<boolean> {
  const childrenRef = ref(children)
  const containerRef = ref(container)

  const { width } = useElementRect(containerRef)
  const { columnGap, paddingLeft, paddingRight } = useComputedStyle(container)

  function getChildrenWidth(elements: Element[]): number {
    const styles = elements.map(getComputedStyleRecord)

    return styles.reduce((sum, style) => {
      if (style) {
        sum += parseInt(style.width)
        sum += parseInt(style.marginLeft) + parseInt(style.marginRight)
        sum += parseInt(columnGap.value)

        if (style.boxSizing === 'border-box') {
          sum += parseInt(style.borderLeftWidth) + parseInt(style.borderRightWidth)
        }
      }

      return sum
    }, 0)
  }

  return computed(() => {
    const containerWidth = width.value - parseInt(paddingLeft.value) - parseInt(paddingRight.value)
    const childrenWidth = getChildrenWidth(childrenRef.value)

    return childrenWidth > containerWidth
  })
}