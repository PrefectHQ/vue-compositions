# useChildrenAreWrapped
The `useChildrenAreWrapped` composition returns a computed boolean that can be used in a component to react to the fact that children all fit within a single row, or they do not. This component uses [useElementRect](https://github.com/PrefectHQ/vue-compositions/tree/main/src/useElementRect) for sizing both, so keep in mind that if the container has padding, it will think there is more room for children than there actually is. 

## Example
```typescript
import { useChildrenAreWrapped } from '@prefecthq/vue-compositions'

const wrapped = useCongruentHeight(cogs, machine)
const classes = computed(() => ({
  container: {
    'p-container--wrapped': wrapped.value,
  },
}))
```

```css
.p-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.p-container--wrapped {
  flex-direction: column;
  justify-content: start;
}
```

## Arguments
| Name     | Type                              |
|----------|-----------------------------------|
| children | `HTMLElement[] \| Ref<HTMLElement[]` |
| container | `HTMLElement \| Ref<HTMLElement | undefined` |

## Returns
`ComputedRef<boolean>`