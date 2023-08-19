# useEventListener

The `useEventListener` composition can be used to automatically handle setup and teardown of event listeners on the document or HTMElement scope. The options argument extends browser AddEventListenerOptions with `immediate` boolean, which defaults to `true` but when passed in as `false`, will prevent the composition from adding the listener automatically.

The composition will return two methods `add` and `remove`. Calling add will trigger `addEventListener` on the target. Calling `remove` will trigger `removeEventListener` on the target.

The composition uses a watcher to remove and re-add the eventListener automatically when the `target` changes. Note this will NOT execute if `options.immediate` is `false`, or if `remove` is called.

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
| target    | `MaybeRefOrGetter<Document \| HTMLElement \| undefined \| null>`               | None      |
| type      | `K (K extends keyof DocumentEventMap)`                    | None      |
| callback  | `(this: Document \| HTMLElement, event: DocumentEventMap[K] \| HTMLElementEventMap[K]) => unknown` | None      |
| options   | `AddEventListenerOptions & { immediate: boolean }`        | { immediate: true }      |

## Returns

| Name   | Type        | Description                                       |
|--------|-------------|---------------------------------------------------|
| add    | () => void  | Manually attach the event listener (has no effect if the event listener already exists) |
| remove | () => void  | Manually detach the event listener, prevent watch from automatically reattaching on target change.                |
