import { BooleanRouteParam } from '@/useRouteQueryParams/formats/BooleanRouteParam'
import { NumberRouteParam } from '@/useRouteQueryParams/formats/NumberRouteParam'
import { ObjectRouteParam } from '@/useRouteQueryParams/formats/ObjectRouteParam'
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