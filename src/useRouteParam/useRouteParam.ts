import { computed, Ref } from 'vue'
import { useRoute } from 'vue-router'

export function useRouteParam(param: string): Ref<string> {
  const route = useRoute()

  return computed(() => {
    let paramValue = route.params[param]

    if (Array.isArray(paramValue) && paramValue.length) {
      [paramValue] = paramValue
    }

    if (!paramValue || paramValue.length === 0) {
      paramValue = ''
    }

    return paramValue
  })
}