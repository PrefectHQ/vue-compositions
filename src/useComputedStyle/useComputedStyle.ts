/* eslint-disable no-redeclare */
import { reactive, ref, Ref, ToRefs, toRefs, watch } from 'vue'
import { useMutationObserver } from '../useMutationObserver/useMutationObserver'
import { useResizeObserver } from '../useResizeObserver/useResizeObserver'
import { DocumentDoesNotExist } from './documentDoesNotExist'
import { globalExists } from '@/utilities/global'
import { ComputedStyleRecord, getComputedStyleRecord } from '@/utilities/window'

export function useComputedStyle(element: Element | Ref<Element | undefined>): ToRefs<ComputedStyleRecord> {
  const elementRef = ref(element)
  const style = reactive(getComputedStyleRecord(elementRef.value ?? getDefaultElement())!)

  function handleChange([entry]: { target: Node }[]): void {
    if (nodeIsElement(entry.target)) {
      const computedStyleRecord = getComputedStyleRecord(entry.target)

      if (computedStyleRecord) {
        Object.assign(style, computedStyleRecord)
      }
    }
  }

  const mutationObserver = useMutationObserver(handleChange)
  const resizeObserver = useResizeObserver(handleChange)

  watch(elementRef, element => {
    if (element) {
      const computedStyleRecord = getComputedStyleRecord(element)
      if (computedStyleRecord) {
        Object.assign(style, computedStyleRecord)
      }

      mutationObserver.disconnect()
      mutationObserver.observe(elementRef, { attributes: true, childList: true })
      resizeObserver.disconnect()
      resizeObserver.observe(elementRef)
    }
  }, { immediate: true })

  return toRefs(style)
}

function getDefaultElement(): Element {
  if (!globalExists('document')) {
    throw new DocumentDoesNotExist()
  }

  return document.createElement('span')
}

function nodeIsElement(node: Node): node is Element {
  return !!(node as Element).attributes
}
