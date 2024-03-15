# useMedia
The `useMousePosition` composition is a utility composition that passively tracks the position of the mouse as well as the position of the mouse at last click

## Example
```typescript
import { useMousePosition } from '@prefecthq/vue-compositions'

const { position, positionAtLastClick } = useMousePosition()
```

## Arguments
None

## Returns
```ts
type MousePosition {
  x: number,
  y: number
}

type UseMousePosition {
  position: MousePosition,
  positionAtLastClick: MousePosition
}
```
