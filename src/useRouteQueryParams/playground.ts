import { NumberRouteParam } from './formats/NumberRouteParam'
import { FilterRouteParam } from './formats/SchemaRouteParam'
import { StringRouteParam } from './formats/StringRouteParam'
import { useRouteQueryParam } from './useRouteQueryParams'

useRouteQueryParam('foo', StringRouteParam)
useRouteQueryParam('foo', NumberRouteParam)
useRouteQueryParam('foo', [StringRouteParam])
const filter = useRouteQueryParam('foo', FilterRouteParam)