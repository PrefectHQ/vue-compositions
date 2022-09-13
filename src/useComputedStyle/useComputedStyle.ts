/* eslint-disable no-redeclare */
import { reactive, ref, Ref, ToRefs, toRefs, watch } from 'vue'
import { useMutationObserver } from '@/useMutationObserver/useMutationObserver'
import { useResizeObserver } from '@/useResizeObserver/useResizeObserver'
import { globalExists } from '@/utilities/global'

export function useComputedStyle(element: Element | Ref<Element | undefined>): ToRefs<Partial<CSSStyleDeclaration>> {
  const elementRef = ref(element)
  const style = reactive({})

  watch(elementRef, element => {
    if (element && globalExists('window')) {
      Object.assign(style, window.getComputedStyle(element, null))

      mutationObserver.disconnect()
      mutationObserver.observe(elementRef)
      resizeObserver.disconnect()
      resizeObserver.observe(elementRef)
    }
  }, { immediate: true })

  function handleMutation([entry]: MutationRecord[]): void {
    if (nodeIsElement(entry.target) && globalExists('window')) {
      Object.assign(style, window.getComputedStyle(entry.target, null))
    }
  }
  const mutationObserver = useMutationObserver(handleMutation)

  function handleResize([entry]: ResizeObserverEntry[]): void {
    if (globalExists('window')) {
      Object.assign(style, window.getComputedStyle(entry.target, null))
    }
  }
  const resizeObserver = useResizeObserver(handleResize)

  return toRefs(style)
}

function nodeIsElement(node: Node): node is Element {
  return !!(node as Element).attributes
}
