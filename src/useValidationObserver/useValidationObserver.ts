import { computed, inject, InjectionKey, onUnmounted, provide, reactive, Ref } from 'vue'
import { isUseValidation, UseValidation } from '@/useValidation/useValidation'

type UseValidationObserver = {
  validate: () => Promise<boolean>,
  valid: Ref<boolean>,
  errors: Ref<string[]>,
}

type ValidationObserverUnregister = () => void
type ValidationObserverRegister = (error: UseValidation) => ValidationObserverUnregister

type ProvideValidationObserver = {
  register: ValidationObserverRegister,
}

export const VALIDATION_OBSERVER_INJECTION_KEY: InjectionKey<ProvideValidationObserver> = Symbol('useValidationObserverKey')

type ValidationStore = Record<symbol, UseValidation>
type RegistrationsStore = Record<symbol, ValidationObserverUnregister | undefined>

export function useValidationObserver(): UseValidationObserver {
  const parent = inject(VALIDATION_OBSERVER_INJECTION_KEY)
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

    Object.values(validations).forEach(validation => {
      if (isUseValidation(validation) && typeof validation.error.value === 'string') {
        errors.push(validation.error.value)
      }
    })

    return errors
  })

  const valid = computed(() => errors.value.length > 0)

  onUnmounted(() => {
    Object.values(registrations).forEach(unregister => {
      if (typeof unregister === 'function') {
        unregister()
      }
    })
  })

  provide(VALIDATION_OBSERVER_INJECTION_KEY, { register })

  return {
    errors,
    valid,
    validate,
  }
}