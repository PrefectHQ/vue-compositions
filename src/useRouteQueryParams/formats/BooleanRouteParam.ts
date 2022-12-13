import { LocationQueryValue } from 'vue-router'
import { RouteParam } from './RouteParam'

export class BooleanRouteParam extends RouteParam<boolean> {

  protected override parse(value: LocationQueryValue): boolean {
    return value === 'true'
  }

  protected override format(value: boolean): LocationQueryValue {
    return value ? 'true' : 'false'
  }

}