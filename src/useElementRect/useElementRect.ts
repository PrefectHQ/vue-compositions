/* eslint-disable id-length */
import { reactive, ref, Ref, toRefs, watchEffect } from 'vue'
import { useResizeObserver, UseResizeObserverCallback } from '../useResizeObserver/useResizeObserver'

type ElementRect = {
  height: Ref<number>,
  width: Ref<number>,
  x: Ref<number>,
  y: Ref<number>,
  left: Ref<number>,
  top: Ref<number>,
  right: Ref<number>,
  bottom: Ref<number>,
}

export function useElementRect(element: HTMLElement | undefined | Ref<HTMLElement | undefined>): ElementRect {
  const elementRef = ref(element)
  const clientRect = {
    height: ref(0),
    width: ref(0),
    x: ref(0),
    y: ref(0),
    left: ref(0),
    top: ref(0),
    right: ref(0),
    bottom: ref(0),
  }

  function assignClientRect(rect: DOMRect): void {
    clientRect.height.value = rect.height
    clientRect.width.value = rect.width
    clientRect.x.value = rect.x
    clientRect.y.value = rect.y
    clientRect.left.value = rect.left
    clientRect.top.value = rect.top
    clientRect.right.value = rect.right
    clientRect.bottom.value = rect.bottom
  }

  const callback: UseResizeObserverCallback = function([entry]: ResizeObserverEntry[]) {
    assignClientRect(entry.target.getBoundingClientRect())
  }

  const observer = useResizeObserver(callback)

  watchEffect(() => {
    if (elementRef.value) {
      assignClientRect(elementRef.value.getBoundingClientRect())

      observer.disconnect()
      observer.observe(elementRef)
    }
  })

  return toRefs(clientRect)
}