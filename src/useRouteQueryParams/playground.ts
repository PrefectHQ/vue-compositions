import { NoInfer } from '@/types/generics'
import { BooleanRouteParam } from '@/useRouteQueryParams/formats/BooleanRouteParam'
import { NumberRouteParam } from '@/useRouteQueryParams/formats/NumberRouteParam'
import { ObjectRouteParam } from '@/useRouteQueryParams/formats/ObjectRouteParam'
import { RouteParamClass } from '@/useRouteQueryParams/formats/RouteParam'
import { StringRouteParam } from '@/useRouteQueryParams/formats/StringRouteParam'
import { useRouteQueryParam } from '@/useRouteQueryParams/useRouteQueryParams'

useRouteQueryParam('foo', StringRouteParam, '')
useRouteQueryParam('foo', NumberRouteParam, 0)
useRouteQueryParam('foo', [StringRouteParam], [])

type DummyFilter = {
  foo?: number,
  bar?: string,
  fiz: {
    buz: boolean,
  },
}

export class FilterRouteParam extends ObjectRouteParam<DummyFilter> {

  protected override schema = {
    foo: NumberRouteParam,
    bar: StringRouteParam,
    fiz: {
      buz: BooleanRouteParam,
    },
  }

}

const filter = useRouteQueryParam('foo', FilterRouteParam, {
  fiz: {
    buz: true,
  },
})

export type UseRouteQueryParams<T extends Record<string, unknown>> = {
  [P in keyof T]-?: T[P] extends Record<string, unknown> ? UseRouteQueryParams<T[P]> : RouteParamClass<NonNullable<T[P]>>
}

function useRouteQueryParams<T extends Record<string, unknown>>(schema: ObjectRouteParamSchema<T>, defaultValue: NoInfer<T>): T {

}