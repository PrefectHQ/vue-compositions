# useRouteParam
The `useRouteParam` gives you a readonly reactive value for a query param. If you need the param to be writable, consider [useRouteQueryParam](https://github.com/PrefectHQ/vue-compositions/tree/main/src/useRouteQueryParam).

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
