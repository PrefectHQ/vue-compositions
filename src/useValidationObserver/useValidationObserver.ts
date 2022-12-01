import { computed, inject, InjectionKey, onUnmounted, provide, reactive, Ref } from 'vue'
import { isUseValidation, UseValidation } from '@/useValidation/useValidation'

const USE_VALIDATION_OBSERVER_SYMBOL = Symbol('UseValidationObserverSymbol')

export type UseValidationObserver = {
  register: ValidationObserverRegister,
  validate: () => Promise<boolean>,
  valid: Ref<boolean>,
  errors: Ref<string[]>,
  USE_VALIDATION_OBSERVER_SYMBOL: typeof USE_VALIDATION_OBSERVER_SYMBOL,
}

export function isUseValidationObserver(value: unknown): value is UseValidationObserver {
  return typeof value === 'object' && value !== null && 'USE_VALIDATION_OBSERVER_SYMBOL' in value
}

export type ValidationObserverUnregister = () => void
export type ValidationObserverRegister = (error: UseValidation) => ValidationObserverUnregister

export const VALIDATION_OBSERVER_INJECTION_KEY: InjectionKey<UseValidationObserver> = Symbol('useValidationObserverKey')

type ValidationStore = Record<symbol, UseValidation>
type RegistrationsStore = Record<symbol, ValidationObserverUnregister | undefined>

export function useValidationObserver(): UseValidationObserver {
  const parent = inject(VALIDATION_OBSERVER_INJECTION_KEY, undefined)
  const validations = reactive<ValidationStore>({})
  const registrations: RegistrationsStore = {}

  const register: ValidationObserverRegister = (validation) => {
    const unregister = parent?.register(validation)
    const key = Symbol()

    registrations[key] = unregister
    validations[key] = validation

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
    const errors: string[] = []

    Reflect.ownKeys(validations).forEach(key => {
      const validation = validations[key as symbol]

      if (isUseValidation(validation) && typeof validation.error === 'string') {
        errors.push(validation.error)
      }
    })

    return errors
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
    validate,
    register,
    USE_VALIDATION_OBSERVER_SYMBOL,
  }

  provide(VALIDATION_OBSERVER_INJECTION_KEY, observer)

  return observer
}