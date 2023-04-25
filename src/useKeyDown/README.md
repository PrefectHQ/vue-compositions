# useKeyDown
The `useKeyDown` composition can be used to react to keydown [events](https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event). 

## Example
```typescript
import { useKeyDown } from '@prefecthq/vue-compositions'

const { down } = useKeyDown('Shift')
```

## Arguments
| Name      | Type                             | Default            |
|-----------|----------------------------------|--------------------|
| key       | `MaybeRef<MaybeArray<string>>`   | None               |
| callback  | `(event: KeyboardEvent) => void` | None               |

## Returns
| Name   | Type                   |
|--------|------------------------|
| down   | `ComputedRef<boolean>` |