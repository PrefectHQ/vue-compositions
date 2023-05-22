# useBoolean
The `useBoolean` is a utility composition for handling the state of a boolean ref

## Example
```typescript
import { ref } from 'vue'
import { useBoolean } from '@prefecthq/vue-compositions'

const initialValueRef = ref(false)
// The initial ref is optional
const { value, setTrue, setFalse, toggle } = useBoolean(initialValueRef)

value.value // false

value.value = true
value.value // true

setFalse()
value.value // false

setTrue()
value.value // true

toggle()
value.value // false

toggle()
value.value // true
```

## Arguments
| Name         | Type                   | Default |
|--------------|------------------------|---------|
| valueRef     | `MaybeRef<boolean>`    | false   |

## Returns
`UseBooleanToggle`
