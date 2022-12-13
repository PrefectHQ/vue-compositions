import { LocationQueryValue } from 'vue-router'
import { RouteParam } from './RouteParam'

export class StringRouteParam extends RouteParam<string> {

  protected override parse(value: LocationQueryValue): string {
    return value ?? ''
  }

  protected override format(value: string): LocationQueryValue {
    return value
  }

}