/* eslint-disable no-redeclare */
import { Ref, ref, watch } from 'vue'
import { RouteLocationNormalized, useRoute, useRouter } from 'vue-router'

export function useRouteQueryParam(param: string, defaultValue: string): Ref<string>
export function useRouteQueryParam(param: string, defaultValue: string[]): Ref<string[]>
export function useRouteQueryParam(param: string, defaultValue: string | string[]): Ref<string | string[]>
export function useRouteQueryParam(param: string, defaultValue: string | string[] = ''): Ref<string | string[]> {
  const router = useRouter()
  const route = useRoute()
  const initialValue = matchValueType(defaultValue, getRouteQueryParam(route, param) ?? defaultValue)
  const valueRef = ref<string | string[]>(initialValue)

  watch(valueRef, () => {
    router.push({ query: { ...route.query, [param]: valueRef.value } })
  })

  watch(route, (newRoute, oldRoute) => {
    const newValue = getRouteQueryParam(newRoute, param) ?? defaultValue
    const oldValue = getRouteQueryParam(oldRoute, param) ?? defaultValue
    const matched = matchValueType(oldValue, newValue)

    if (matched !== valueRef.value) {
      valueRef.value = matched
    }
  }, { deep: true })

  return valueRef
}

function getRouteQueryParam({ query }: RouteLocationNormalized, param: string): string | null | string[] {
  return query[param] as string | null | string[]
}

function matchValueType(previous: string | string[], next: string | string[]): string | string[] {
  if (Array.isArray(previous) && !Array.isArray(next)) {
    return [next]
  }

  if (typeof previous === 'string' && Array.isArray(next)) {
    return next[0]
  }

  return next
}