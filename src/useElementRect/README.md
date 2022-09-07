# useElementRect
The `useElementRect` composition abstracts away the logic for tracking the client rect of an HTMLElement, even when the client rect changes on resize thanks to [useResizeObserver](https://github.com/PrefectHQ/vue-compositions/tree/main/src/useResizeObserver).

## Example
```typescript
import { useElementRect } from '@prefecthq/vue-compositions'

const templateRef = ref<HTMLElement | undefined>()
const { height, width, x, y } = useElementRect(templateRef)
```

## Arguments
| Name     | Type                              |
|----------|-----------------------------------|
| element | `HTMLElement \| undefined \| Ref<HTMLElement \| undefined>` |

## Returns
`Ref<number>` (in px)