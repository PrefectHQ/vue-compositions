# useGlobalEventListener
The `useGlobalEventListener` composition can be used to automatically handle setup and teardown of event listeners on the document scope. It takes the same arguments as the global `addEventListener` method

## Example
```typescript
import { useGlobalEventListener } from '@prefecthq/vue-compositions'

function handleEvent(event: Event) {
  // Respond to event
}
useGlobalEventListener('keyup', handleEvent)
```

## Arguments
| Name      | Type                                                      | Default   |
|-----------|-----------------------------------------------------------|-----------|
| type      | `K (K extends keyof DocumentEventMap)`                    | None      |
| callback  | `(this: Document, event: DocumentEventMap[K]) => unknown` | None      |
| options   | `AddEventListenerOptions`                                 | None      |

## Returns
| Name   | Type        | Description                                       |
|--------|-------------|---------------------------------------------------|
| add    | () => void  | Manually attach the event listener (has no effect if the event listener already exists) |
| remove | () => void  | Manually detach the event listener                |