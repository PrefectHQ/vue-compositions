import { LocationQueryValue } from 'vue-router'
import { RouteParam } from '@/useRouteQueryParam/formats/RouteParam'

export class BooleanRouteParam extends RouteParam<boolean> {

  protected override parse(value: LocationQueryValue): boolean {
    return value === null
  }

  protected override format(value: boolean | null): null | undefined {
    return value ? null : undefined
  }

}