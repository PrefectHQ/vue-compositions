import { computed, ComputedRef, inject, InjectionKey, onUnmounted, provide, reactive, UnwrapNestedRefs } from 'vue'
import { ResetMethod, UseValidation } from '@/useValidation/useValidation'

export type UseValidationObserver = {
  register: ValidationObserverRegister,
  validate: () => Promise<boolean>,
  pause: () => void,
  resume: () => void,
  /**
   * Reset all observed validations' states.
   *
   * @see UseValidation['reset']
   */
  reset: ResetMethod,
  valid: ComputedRef<boolean>,
  invalid: ComputedRef<boolean>,
  errors: ComputedRef<string[]>,
  pending: ComputedRef<boolean>,
}

export type ValidationObserverUnregister = () => void
export type ValidationObserverRegister = (error: UseValidation) => ValidationObserverUnregister

export const VALIDATION_OBSERVER_INJECTION_KEY: InjectionKey<UseValidationObserver> = Symbol('useValidationObserverKey')

type ValidationStore = Record<symbol, UnwrapNestedRefs<UseValidation>>
type RegistrationsStore = Record<symbol, ValidationObserverUnregister | undefined>

export function useValidationObserver(): UseValidationObserver {
  const parent = inject(VALIDATION_OBSERVER_INJECTION_KEY, undefined)
  const validations = reactive<ValidationStore>({})
  const registrations: RegistrationsStore = {}

  const register: ValidationObserverRegister = (validation) => {
    const unregister = parent?.register(validation)
    const key = Symbol()

    registrations[key] = unregister
    validations[key] = reactive(validation)

    return () => {
      delete validations[key]
      delete registrations[key]
      unregister?.()
    }
  }

  const validate = (): Promise<boolean> => {
    const keys = Reflect.ownKeys(validations) as symbol[]
    const promises = keys.map(key => validations[key].validate({
      source: 'observer',
    }))

    return Promise.all(promises).then(results => results.every(valid => valid))
  }

  const pause = (): void => {
    const keys = Reflect.ownKeys(validations) as symbol[]

    for (const key of keys) {
      validations[key].pause()
    }
  }

  const resume = (): void => {
    const keys = Reflect.ownKeys(validations) as symbol[]

    for (const key of keys) {
      validations[key].resume()
    }
  }

  const reset: ResetMethod = (resetCallback) => {
    const keys = Reflect.ownKeys(validations) as symbol[]

    for (const key of keys) {
      validations[key].reset(resetCallback)
    }
  }

  const errors = computed<string[]>(() => {
    const keys = Reflect.ownKeys(validations) as symbol[]
    return keys
      .map(key => validations[key].error)
      .filter(error => !!error)
  })

  const pending = computed<boolean>(() => {
    const keys = Reflect.ownKeys(validations) as symbol[]

    return keys.some(key => validations[key].pending)
  })

  const valid = computed(() => errors.value.length === 0)
  const invalid = computed(() => !valid.value)

  onUnmounted(() => {
    Object.values(registrations).forEach(unregister => {
      if (typeof unregister === 'function') {
        unregister()
      }
    })
  })

  const observer: UseValidationObserver = {
    errors,
    valid,
    invalid,
    pending,
    validate,
    pause,
    resume,
    reset,
    register,
  }

  provide(VALIDATION_OBSERVER_INJECTION_KEY, observer)

  return observer
}