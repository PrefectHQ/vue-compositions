# useEventListener

The `useEventListener` composition can be used to automatically handle setup and teardown of event listeners on the document or HTMElement scope. The options argument extends browser AddEventListenerOptions with `immediate` boolean, which defaults to `true` but when passed in as `false`, will prevent the composition from adding the listener automatically.

## Example

```typescript
import { useEventListener } from '@prefecthq/vue-compositions'

function handleEvent(event: MouseEvent) {
  // Respond to event
}
const element = ref<HTMLDivElement | undefined>()
useEventListener(element, 'keyup', handleEvent)
```

## Arguments

| Name      | Type                                                      | Default   |
|-----------|-----------------------------------------------------------|-----------|
| type      | `K (K extends keyof DocumentEventMap)`                    | None      |
| callback  | `(this: Document, event: DocumentEventMap[K]) => unknown` | None      |
| options   | `AddEventListenerOptions & { immediate: boolean }`        | None      |

## Returns

| Name   | Type        | Description                                       |
|--------|-------------|---------------------------------------------------|
| add    | () => void  | Manually attach the event listener (has no effect if the event listener already exists) |
| remove | () => void  | Manually detach the event listener                |
