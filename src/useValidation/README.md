# useValidation
The `useValidation` is an observation only validation composition. It validates a `Ref` against any validation rules passed in. Can be combined with `useValidationObserver` to validate multiple values.

## Example
```typescript
import { useValidation, ValidationRule } from '@prefecthq/vue-compositions'
import { ref } from 'vue'

const isGreaterThanZero: ValidationRule<number> = (value, name) => {
  if(value > 0) {
    return true
  }

  return `${name} must be greater than 0`
}

const value = ref(0)
const { valid, error } = useValidation(value, 'Number', [isGreaterThanZero])

console.log(valid) // Ref<false>
console.log(error) // Ref<string> 'Number must be greater than 0'
```

## Arguments
| Name     | Type                              |
|----------|-----------------------------------|
| value    | `MaybeRef<T>`                     |
| name     | `MaybeRef<string>`                |
| rules    | `MaybeRef<ValidationRule<T>[]>`   |


## Returns
`UseValidation`