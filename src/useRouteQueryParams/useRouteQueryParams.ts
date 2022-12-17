import { useRoute, useRouter } from 'vue-router'
import { NoInfer } from '@/types/generics'
import { RouteParamClass } from '@/useRouteQueryParams/formats'

export type RouteParamsSchema<T extends Record<string, unknown>> = {
  [P in keyof T]-?: T[P] extends Record<string, unknown> ? RouteParamsSchema<T[P]> : RouteParamClass<NonNullable<T[P]>>
}

function useRouteQueryParams<T extends Record<string, unknown>>(schema: RouteParamsSchema<T>, defaultValue: NoInfer<T>): T {
  const route = useRoute()
  const router = useRouter()

  // use schema as the "template"
  // create a useRouteQueryParam for each param in the schema
  // wrap that in reactive
  // debounce the router push?
  // profit?

}