/* eslint-disable no-redeclare */
import { computed, Ref } from 'vue'
import { useRoute } from 'vue-router'

export function useRouteParam(param: string): Ref<string | string[]>
export function useRouteParam(param: string, defaultValue: string): Ref<string>
export function useRouteParam(param: string, defaultValue: string[]): Ref<string[]>
export function useRouteParam(param: string, defaultValue?: string | string[]): Ref<string | string[]> {
  const route = useRoute()

  return computed(() => {
    let paramValue = route.params[param]

    if (defaultValue !== undefined && Array.isArray(defaultValue) || Array.isArray(paramValue)) {
      if (!paramValue.length) {
        paramValue = defaultValue ?? []
      } else {
        [paramValue] = paramValue
      }
    }

    if (!paramValue || paramValue.length === 0) {
      paramValue = defaultValue ?? ''
    }

    return paramValue
  })
}