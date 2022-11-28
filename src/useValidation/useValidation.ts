import { ComponentInternalInstance, computed, getCurrentInstance, inject, onMounted, onUnmounted, ref, Ref, watch } from 'vue'
import { ValidationAbortedError } from './ValidationAbortedError'
import { ValidationRuleExecutor } from './ValidationExecutor'
import { MaybePromise, MaybeRef, MaybeUnwrapRef } from '@/types/maybe'
import { isUseValidationObserver, UseValidationObserver, ValidationObserverUnregister, VALIDATION_OBSERVER_INJECTION_KEY } from '@/useValidationObserver/useValidationObserver'
import { getSymbolForInjectionKey } from '@/utilities/symbols'

type UseValidationMethod<T> = (
  value: MaybeRef<T>,
  name: MaybeRef<string>,
  rules: MaybeRef<ValidationRule<T>[]>
) => UseValidation

type UseValidationParameters<T> = Parameters<UseValidationMethod<T>>

const USE_VALIDATION_SYMBOL = Symbol('UseValidationSymbol')

export type UseValidation = {
  valid: Ref<boolean>,
  error: Ref<ValidationError>,
  pending: Ref<boolean>,
  validate: () => Promise<boolean>,
  USE_VALIDATION_SYMBOL: symbol,
}

export function isUseValidation(value: unknown): value is UseValidation {
  return typeof value === 'object' && value !== null && USE_VALIDATION_SYMBOL in value
}

export type ValidationError = string | false
export type ValidationRule<T> = (value: MaybeUnwrapRef<T>, name: MaybeUnwrapRef<string>, signal: AbortSignal) => MaybePromise<true | string>

type ComponentInstanceWithProvide = ComponentInternalInstance & { provides: Record<symbol, unknown> } | null

function getValidationObserver(): UseValidationObserver | undefined {
  const vm = getCurrentInstance() as ComponentInstanceWithProvide
  const symbol = getSymbolForInjectionKey(VALIDATION_OBSERVER_INJECTION_KEY)
  const observer = vm?.provides[symbol]

  if (isUseValidationObserver(observer)) {
    return observer
  }

  return inject(VALIDATION_OBSERVER_INJECTION_KEY)
}

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

  const validation: UseValidation = {
    error,
    valid,
    pending,
    validate,
    USE_VALIDATION_SYMBOL,
  }

  const mounted = ref(false)
  const executor = new ValidationRuleExecutor<T>()
  const observer = getValidationObserver()

  let unregister: ValidationObserverUnregister | undefined

  watch(valueRef, () => {
    // not sure this is needed
    if (!mounted.value) {
      return
    }

    validate()
  }, { deep: true })

  onMounted(() => {
    mounted.value = true

    unregister = observer?.register(validation)
  })

  onUnmounted(() => {
    unregister?.()
  })

  return validation
}