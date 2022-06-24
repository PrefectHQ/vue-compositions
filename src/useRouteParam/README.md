# useRouteParam
The `useRouteParam` gives you a readonly reactive value for a param. This is different from [useRouteQueryParam](https://github.com/PrefectHQ/vue-compositions/tree/main/src/useRouteQueryParam), which uses the query params of the route and is writable.

## Example
```typescript
import { useRouteParam } from '@prefecthq/vue-compositions'

const foo = useRouteParam('foo') // type is `string | string[]`
const foo = useRouteParam('foo', 'default-string') // type is `string`
const foo = useRouteParam('foo', ['default-array']) // type is `string[]`
```

## Arguments
| Name         | Type                 | Default |
|--------------|----------------------|---------|
| param        | `string`             | None    |
| defaultValue | `string \| string[]` | `undefined`    |

## Returns
`string | string[]`
