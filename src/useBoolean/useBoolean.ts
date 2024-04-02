import { ref, Ref, MaybeRef } from 'vue'

type UseBoolean = {
  value: Ref<boolean>,
  toggle: () => void,
  setTrue: () => void,
  setFalse: () => void,
}

/**
 * `useBoolean` is a utility composition for managing a boolean state.
 * It returns an object with `value`, `toggle`, `setTrue`, and `setFalse` properties.
 *
 * @param {MaybeRef<boolean>} [valueRef] - Optional parameter. A Vue ref object or a boolean that holds the initial state.
 *
 * @returns {UseBoolean} - An object with the following properties:
 *                        `value`: a Vue ref object that holds the current boolean state.
 *                        `toggle`: a method to toggle the state.
 *                        `setTrue`: a method to set the state to true.
 *                        `setFalse`: a method to set the state to false.
 *
 * @example
 * const { toggle, setTrue, setFalse, value } = useBoolean()
 * toggle() // toggle the state
 * setTrue() // set the state to true
 * setFalse() // set the state to false
 * console.log(value.value) // check the current state
 */
export function useBoolean(valueRef?: MaybeRef<boolean>): UseBoolean {
  const value = ref(valueRef ?? false)

  const toggle = (): void => {
    value.value = !value.value
  }

  const setTrue = (): void => {
    value.value = true
  }

  const setFalse = (): void => {
    value.value = false
  }

  return { value, toggle, setTrue, setFalse }
}

