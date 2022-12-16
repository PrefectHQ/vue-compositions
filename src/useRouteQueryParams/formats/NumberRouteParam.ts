import { LocationQueryValue } from 'vue-router'
import { InvalidRouteParamValue } from '@/useRouteQueryParams/formats/InvalidRouteParamValue'
import { RouteParam } from '@/useRouteQueryParams/formats/RouteParam'

export class NumberRouteParam extends RouteParam<number> {

  protected override parse(value: LocationQueryValue): number {
    if (value === null) {
      throw new InvalidRouteParamValue()
    }

    const parsed = parseInt(value)

    if (isNaN(parsed)) {
      throw new InvalidRouteParamValue()
    }

    return parsed
  }

  protected override format(value: number): LocationQueryValue {
    return `${value}`
  }

}
