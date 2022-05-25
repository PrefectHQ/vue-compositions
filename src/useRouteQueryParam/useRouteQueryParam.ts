import { Ref, ref, watch } from 'vue'
import { RouteLocationNormalized, useRoute, useRouter } from 'vue-router'

export function useRouteQueryParam(param: string, defaultValue: string | string[] = ''): Ref<string | string[]> {
  const router = useRouter()
  const route = useRoute()
  const valueRef = ref<string | string[]>(getRouteQueryParam(route, param, defaultValue))

  watch(valueRef, () => {
    router.push({ query: { ...route.query, [param]: valueRef.value } })
  })

  watch(route, () => {
    const value = getRouteQueryParam(route, param, defaultValue)

    if (value !== valueRef.value) {
      valueRef.value = value
    }
  }, { deep: true })

  return valueRef
}

function getRouteQueryParam({ query }: RouteLocationNormalized, param: string, defaultValue: string | string[]): string | string[] {
  return query[param] as string | null | string[] ?? defaultValue
}