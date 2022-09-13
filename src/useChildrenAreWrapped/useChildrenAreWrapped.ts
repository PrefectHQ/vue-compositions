import { computed, ComputedRef, ref, Ref } from 'vue'
import { useComputedStyle } from '../useComputedStyle/useComputedStyle'
import { useElementRect } from '../useElementRect/useElementRect'
import { getComputedStyleRecord } from '@/utilities/window'

export function useChildrenAreWrapped(children: Element[] | Ref<Element[]>, container: Element | Ref<Element | undefined>): ComputedRef<boolean> {
  const childrenRef = ref(children)
  const containerRef = ref(container)

  const { width } = useElementRect(containerRef)
  const { columnGap, paddingLeft, paddingRight } = useComputedStyle(container)

  function getChildrenWidth(): number {
    const styles = childrenRef.value.map(getComputedStyleRecord)

    return styles.reduce((sum, style) => {
      if (style) {
        sum += style.width
        sum += style.marginLeft + style.marginRight
        sum += style.borderTopWidth + style.borderBottomWidth
      }

      return sum + columnGap.value
    }, 0)
  }

  return computed(() => {
    const containerWidth = width.value - paddingLeft.value - paddingRight.value
    const childrenWidth = getChildrenWidth()

    return childrenWidth > containerWidth
  })
}