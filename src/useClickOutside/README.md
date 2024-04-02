# useClickOutside
The `useClickOutside` composition is designed to detect and react to clicks outside a specified element. It takes an element and a callback function as arguments. The composition returns `on` and `off` functions, allowing for manual control over the event listener if needed, although automatic cleanup is handled as part of the component's lifecycle.

## Example
```vue
<template>
  <div ref="el" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useClickOutside } from '@prefecthq/vue-compositions'

function handleClickOutside(): void {
  // Do something, like close a modal
}

const el = ref()
const { on, off } = useClickOutside(children, handleClickOutside)
// Don't need to do anything with on/off unless your handler needs to be paused for some reason 
</script>
```

## Arguments
| Name     | Type                              |
|----------|-----------------------------------|
| element | `MaybeRefOrGetter<Element> |
| callback | `() => void` |

## Returns

| Name   | Type        | Description                                       |
|--------|-------------|---------------------------------------------------|
| on    | `() => void`  | Manually turn on the event listener (note: this isn't needed unless `off` has been called) |
| off | `() => void`  | Manually turn off the event listener (note: this isn't needed for cleanup - the event listener will be removed automatically as part of the component lifecycle)                |
