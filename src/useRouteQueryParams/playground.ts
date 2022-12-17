import { BooleanRouteParam } from '@/useRouteQueryParams/formats/BooleanRouteParam'
import { NumberRouteParam } from '@/useRouteQueryParams/formats/NumberRouteParam'
import { StringRouteParam } from '@/useRouteQueryParams/formats/StringRouteParam'
import { useRouteQueryParam } from '@/useRouteQueryParams/useRouteQueryParam'

useRouteQueryParam('foo', StringRouteParam, '')
useRouteQueryParam('foo', NumberRouteParam, 0)
useRouteQueryParam('foo', StringRouteParam, [])

type DummyFilter = {
  foo?: number,
  bar?: string,
  fiz: {
    buz: boolean,
  },
}
