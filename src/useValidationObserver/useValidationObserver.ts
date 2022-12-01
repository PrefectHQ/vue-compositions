import { computed, ComputedRef, inject, InjectionKey, onUnmounted, provide, reactive, UnwrapNestedRefs } from 'vue'
import { isUseValidation, UseValidation } from '@/useValidation/useValidation'

const USE_VALIDATION_OBSERVER_SYMBOL = Symbol('UseValidationObserverSymbol')

export type UseValidationObserver = {
  register: ValidationObserverRegister,
  validate: () => Promise<boolean>,
  valid: ComputedRef<boolean>,
  errors: ComputedRef<string[]>,
  pending: ComputedRef<boolean>,
  USE_VALIDATION_OBSERVER_SYMBOL: typeof USE_VALIDATION_OBSERVER_SYMBOL,
}

export function isUseValidationObserver(value: unknown): value is UseValidationObserver {
  return typeof value === 'object' && value !== null && 'USE_VALIDATION_OBSERVER_SYMBOL' in value
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
    const promises: Promise<boolean>[] = []

    Object.values(validations).forEach(validation => {
      if (isUseValidation(validation)) {
        promises.push(validation.validate())
      }
    })

    return Promise.all(promises).then(results => results.every(valid => valid))
  }

  const errors = computed<string[]>(() => {
    const keys = Reflect.ownKeys(validations) as symbol[]
    const errors: string[] = []

    keys.forEach(key => {
      const validation = validations[key]

      if (validation.error) {
        errors.push(validation.error)
      }
    })

    return errors
  })

  const pending = computed<boolean>(() => {
    const keys = Reflect.ownKeys(validations) as symbol[]

    for (const key of keys) {
      const validation = validations[key]

      if (validation.pending) {
        return true
      }

    }

    return false
  })

  const valid = computed(() => errors.value.length === 0)

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
    pending,
    validate,
    register,
    USE_VALIDATION_OBSERVER_SYMBOL,
  }

  provide(VALIDATION_OBSERVER_INJECTION_KEY, observer)

  return observer
}