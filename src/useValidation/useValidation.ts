/* eslint-disable max-classes-per-file */
import { computed, inject, InjectionKey, onMounted, onUnmounted, provide, reactive, ref, Ref, UnwrapRef, watch } from 'vue'

type MaybePromise<T> = T | Promise<T>
type MaybeRef<T> = T | Ref<T>
type MaybeUnwrapRef<T> = T | UnwrapRef<T>

type UseValidationMethod<T> = (
  value: MaybeRef<T>,
  name: MaybeRef<string>,
  rules: MaybeRef<ValidationRule<T>[]>
) => UseValidation

type UseValidationParameters<T> = Parameters<UseValidationMethod<T>>

const USE_VALIDATION_SYMBOL = Symbol('_UseValidationSymbol')

type UseValidation = {
  valid: Ref<boolean>,
  error: Ref<ValidationError>,
  pending: Ref<boolean>,
  validate: () => Promise<boolean>,
  USE_VALIDATION_SYMBOL: symbol,
}

function isUseValidation(value: unknown): value is UseValidation {
  return typeof value === 'object' && value !== null && USE_VALIDATION_SYMBOL in value
}

type ValidationError = string | false
type ValidationRule<T> = (value: MaybeUnwrapRef<T>, name: MaybeUnwrapRef<string>, signal: AbortSignal) => MaybePromise<true | string>

// overload so name is optional. or remove name?
export function useValidation<T>(...[value, name, rules]: UseValidationParameters<T>): UseValidation {
  const valueRef = ref(value)
  const nameRef = ref(name)
  const rulesRef = ref(rules)

  const error = ref<string | false>(false)
  const valid = computed(() => error.value !== false)
  const pending = ref(false)

  const validate = async (): Promise<boolean> => {
    executor.abort()

    pending.value = true

    try {
      error.value = await executor.validate(valueRef.value, nameRef.value, rulesRef.value)
    } catch (error) {
      if (!(error instanceof ValidationAbortedError)) {
        console.warn('There was an error during validation')
        console.error(error)
      }
    }

    pending.value = false

    return valid.value
  }

  const result: UseValidation = {
    error,
    valid,
    pending,
    validate,
    USE_VALIDATION_SYMBOL,
  }

  const mounted = ref(false)
  const executor = new ValidationRuleExecutor<T>()
  const observer = inject(VALIDATION_OBSERVER_INJECTION_KEY)
  const unregister = observer?.register(result)

  watch(valueRef, () => {
    // not sure this is needed
    if (!mounted.value) {
      return
    }

    validate()
  }, { deep: true })

  onMounted(() => {
    mounted.value = true
  })

  onUnmounted(() => {
    unregister?.()
  })

  return result
}

class ValidationAbortedError extends Error {}

class ValidationRuleExecutor<T> {
  private controller = new AbortController()

  public abort(): void {
    this.controller.abort()

    this.controller = new AbortController()
  }

  public async validate(value: MaybeUnwrapRef<T>, name: MaybeUnwrapRef<string>, rules: MaybeUnwrapRef<ValidationRule<T>>[]): Promise<ValidationError> {
    const { signal } = this.controller

    for (const rule of rules) {
      if (signal.aborted) {
        throw new ValidationAbortedError()
      }

      // eslint-disable-next-line no-await-in-loop
      const result = await rule(value, name, signal)

      if (typeof result === 'string') {
        return result
      }
    }

    return false
  }

}

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

const VALIDATION_OBSERVER_INJECTION_KEY: InjectionKey<ProvideValidationObserver> = Symbol('useValidationObserverKey')

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
      if (isUseValidation(validation)) {
        return validation.error.value
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