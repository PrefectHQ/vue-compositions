import { LocationQueryValue } from 'vue-router'
import { InvalidRouteParamValue } from '@/useRouteQueryParams/formats/InvalidRouteParamValue'
import { RouteParam } from '@/useRouteQueryParams/formats/RouteParam'

export class StringRouteParam extends RouteParam<string> {

  protected override parse(value: LocationQueryValue): string {
    if (typeof value !== 'string') {
      throw new InvalidRouteParamValue()
    }

    return value
  }

  protected override format(value: string): LocationQueryValue {
    return value
  }

}