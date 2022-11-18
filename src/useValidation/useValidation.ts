import { computed, inject, InjectionKey, onUnmounted, provide, reactive, ref, Ref, watch } from 'vue'

type MaybePromise<T> = T | Promise<T>

type UseValidationMethod<T> = (
  value: Ref<T>,
  name: string,
  rules: ValidationRule<T>[]
) => UseValidation

type UseValidationParameters<T> = Parameters<UseValidationMethod<T>>

type UseValidation = {
  valid: Ref<boolean>,
  error: Ref<ValidationError>,
  pending: Ref<boolean>,
}

type ValidationError = string | false
type ValidationRule<T> = (value: T, name: string) => MaybePromise<true | string>

// overload so name is optional. or remove name?
export function useValidation<T>(...[value, name, rules]: UseValidationParameters<T>): UseValidation {
  const error = ref<string | false>(false)
  const valid = computed(() => error.value !== false)
  const pending = ref(false)

  const observer = inject(VALIDATION_OBSERVER_INJECTION_KEY)
  const unregister = observer?.register(error)

  watch(value, async value => {
    pending.value = true

    try {
      error.value = await check(value, name, rules)
    } catch (error) {
      console.warn('There was an error during validation')
      console.error(error)
    }

    pending.value = false
  }, { deep: true })

  onUnmounted(() => {
    unregister?.()
  })

  return {
    valid,
    error,
    pending,
  }
}

// need to be able to abort this in case the value changes while check is being run
async function check<T>(value: T, name: string, rules: ValidationRule<T>[]): Promise<ValidationError> {
  for (const rule of rules) {
    // we do want to await each validation rule
    // eslint-disable-next-line no-await-in-loop
    const result = await rule(value, name)

    if (typeof result === 'string') {
      return result
    }
  }

  return false
}


type UseValidationObserver = {
  // validate: () => void,
  valid: Ref<boolean>,
  // errors: ValidationErrors<T>,
  errors: Ref<string[]>,
}

type ValidationObserverUnregister = () => void
type ValidationObserverRegister = (error: Ref<ValidationError>) => ValidationObserverUnregister

type ProvideValidationObserver = {
  register: ValidationObserverRegister,
}

const VALIDATION_OBSERVER_INJECTION_KEY: InjectionKey<ProvideValidationObserver> = Symbol('useValidationObserverKey')

type ErrorsStore = Record<symbol, Ref<ValidationError>>
type RegistrationsStore = Record<symbol, ValidationObserverUnregister | undefined>

export function useValidationObserver(): UseValidationObserver {
  const observer = inject(VALIDATION_OBSERVER_INJECTION_KEY)
  const errorsStore = reactive<ErrorsStore>({})
  const registrationStore: RegistrationsStore = {}
  const register: ValidationObserverRegister = (error) => {
    const unregister = observer?.register(error)
    const key = Symbol()

    registrationStore[key] = unregister
    errorsStore[key] = error

    return () => {
      delete errorsStore[key]
      delete registrationStore[key]
      unregister?.()
    }
  }

  // typescript is annoying sometimes. Can this be written cleaner?
  const allErrors = computed<Ref<ValidationError>[]>(() => Object.values(errorsStore))
  const errors = computed(() => allErrors.value.filter(error => error.value !== false).map(error => error.value) as string[])
  const valid = computed(() => errors.value.length > 0)

  onUnmounted(() => {
    // typescript is annoying sometimes. Can this be written cleaner?
    Object.values(registrationStore).forEach(unregister => (unregister as ValidationObserverUnregister | undefined)?.())
  })

  provide(VALIDATION_OBSERVER_INJECTION_KEY, { register })

  return {
    errors,
    valid,
  }
}