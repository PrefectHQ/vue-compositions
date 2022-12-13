import { BooleanRouteParam } from './formats/BooleanRouteParam'
import { NumberRouteParam } from './formats/NumberRouteParam'
import { ObjectRouteParam } from './formats/ObjectRouteParam'
import { StringRouteParam } from './formats/StringRouteParam'
import { useRouteQueryParam } from './useRouteQueryParams'

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