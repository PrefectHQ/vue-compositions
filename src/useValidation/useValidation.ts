import { ComponentInternalInstance, computed, getCurrentInstance, inject, onMounted, onUnmounted, ref, Ref, watch } from 'vue'
import { ValidationAbortedError } from './ValidationAbortedError'
import { ValidationRuleExecutor } from './ValidationExecutor'
import { NoInfer } from '@/types/generics'
import { MaybePromise, MaybeRef } from '@/types/maybe'
import { isUseValidationObserver, UseValidationObserver, ValidationObserverUnregister, VALIDATION_OBSERVER_INJECTION_KEY } from '@/useValidationObserver/useValidationObserver'
import { getSymbolForInjectionKey } from '@/utilities/symbols'

const USE_VALIDATION_SYMBOL: unique symbol = Symbol('UseValidationSymbol')

export type UseValidation = {
  valid: Ref<boolean>,
  error: Ref<string>,
  pending: Ref<boolean>,
  validate: () => Promise<boolean>,
  [USE_VALIDATION_SYMBOL]: true,
}

export function isUseValidation(value: unknown): value is UseValidation {
  return typeof value === 'object' && value !== null && USE_VALIDATION_SYMBOL in value
}

export type ValidationRule<T> = (value: T, name: string, signal: AbortSignal) => MaybePromise<boolean | string>

type ComponentInstanceWithProvide = ComponentInternalInstance & { provides: Record<symbol, unknown> } | null

function getValidationObserver(): UseValidationObserver | undefined {
  const vm = getCurrentInstance() as ComponentInstanceWithProvide
  const symbol = getSymbolForInjectionKey(VALIDATION_OBSERVER_INJECTION_KEY)
  const observer = vm?.provides[symbol]

  if (isUseValidationObserver(observer)) {
    return observer
  }

  return inject(VALIDATION_OBSERVER_INJECTION_KEY, undefined)
}

export function useValidation<T>(
  value: MaybeRef<T>,
  name: MaybeRef<string>,
  rules: MaybeRef<ValidationRule<NoInfer<T>>[]>,
): UseValidation {
  const valueRef = ref(value)
  const nameRef = ref(name)
  const rulesRef = ref(rules)

  const error = ref<string>('')
  const valid = computed(() => error.value === '')
  const pending = ref(false)

  const validate = async (): Promise<boolean> => {
    executor.abort()

    pending.value = true

    try {
      error.value = await executor.validate(valueRef.value as T, nameRef.value, rulesRef.value)
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
    [USE_VALIDATION_SYMBOL]: true,
  }

  let mounted = false
  const executor = new ValidationRuleExecutor<T>()
  const observer = getValidationObserver()

  let unregister: ValidationObserverUnregister | undefined

  watch(valueRef, () => {
    if (!mounted) {
      return
    }

    validate()
  }, { deep: true })

  onMounted(() => {
    unregister = observer?.register(validation)

    mounted = true
  })

  onUnmounted(() => {
    unregister?.()
  })

  return validation
}