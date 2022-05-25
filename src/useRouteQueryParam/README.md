# useRouteQueryParam
The `useRouteQueryParam` gives you a reactive value for a query param. So you can bind directly to `foo` in the route `example.com?foo=bar`

## Example
```typescript
import { useRouteQueryParam } from '@prefecthq/vue-compositions'

const foo = useRouteQueryParam('foo')
```

## Arguments
| Name         | Type                 | Default |
|--------------|----------------------|---------|
| param        | `string`             | None    |
| defaultValue | `string \| string[]` | `''`    |

## Returns
`string | string[]`
