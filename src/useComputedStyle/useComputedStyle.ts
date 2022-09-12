/* eslint-disable no-redeclare */
import { reactive, ref, Ref, ToRefs, toRefs, watchEffect } from 'vue'
import { globalExists } from '@/utilities/global'

export function useComputedStyle(element: Element | Ref<Element | undefined>): ToRefs<Partial<CSSStyleDeclaration>> {
  const elementRef = ref(element)
  const style = reactive({})

  watchEffect(() => {
    if (elementRef.value && globalExists('window')) {
      Object.assign(style, window.getComputedStyle(elementRef.value, null))
    }
  })

  return toRefs(style)
}
