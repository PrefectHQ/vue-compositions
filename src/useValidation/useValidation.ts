import { computed, onMounted, onUnmounted, reactive, ref, ToRefs, watch, unref, Ref, WatchStopHandle } from 'vue'
import { NoInfer } from '@/types/generics'
import { MaybeArray, MaybePromise, MaybeRef } from '@/types/maybe'
import { isValidationAbortedError } from '@/useValidation/ValidationAbortedError'
import { ValidationRuleExecutor } from '@/useValidation/ValidationExecutor'
import { ValidationObserverUnregister, VALIDATION_OBSERVER_INJECTION_KEY } from '@/useValidationObserver/useValidationObserver'
import { asArray } from '@/utilities/arrays'
import { injectFromSelfOrAncestor } from '@/utilities/injection'
import { isSame } from '@/utilities/isSame'

export type UseValidationState = {
  valid: boolean,
  invalid: boolean,
  error: string,
  pending: boolean,
  validated: boolean,
}

export type ValidateMethodOptions = {
  source?: string,
}

export type ValidateMethod = (options?: ValidateMethodOptions) => Promise<boolean>

export type ResetMethodParams = [
  /**
   * If true, the next call to validate will not be called.
   * This allows you to reset validation state and then reset the value
   * without triggering another validation.
   */
  resetCallback?: () => void
]
export type ResetMethod = (...params: ResetMethodParams) => void

export type UseValidation = ToRefs<UseValidationState> & {
  validate: ValidateMethod,
  reset: ResetMethod,
  pause: () => void,
  resume: () => void,
  state: UseValidationState,
}

export type ValidationRuleContext<T> = {
  signal: AbortSignal,
  source: string | undefined,
  previousValue: T | undefined,
}

export type ValidationRule<T> = (value: T, name: string, meta: ValidationRuleContext<T>) => MaybePromise<boolean | string | undefined>

type RulesArg<T> = MaybeRef<MaybeArray<ValidationRule<T>>>

function isRules<T>(value: MaybeRef<string> | RulesArg<T>): value is RulesArg<T> {
  return typeof unref(value) !== 'string'
}

export function useValidation<T>(value: MaybeRef<T>, rules: RulesArg<NoInfer<T>>): UseValidation
export function useValidation<T>(value: MaybeRef<T>, name: MaybeRef<string>, rules: RulesArg<NoInfer<T>>): UseValidation
export function useValidation<T>(
  value: MaybeRef<T>,
  nameOrRules: MaybeRef<string> | RulesArg<NoInfer<T>>,
  maybeRules?: RulesArg<NoInfer<T>>,
): UseValidation {

  if (isRules(nameOrRules)) {
    return useValidation(value, 'Value', nameOrRules)
  }

  if (maybeRules === undefined) {
    throw new Error('Invalid useValidation arguments')
  }

  const valueRef = ref(value) as Ref<T>
  const nameRef = ref(nameOrRules)
  const rulesRef = computed(() => asArray(unref(maybeRules)))
  const previousValueRef = ref() as Ref<T>

  const error = ref<string>('')
  const valid = computed(() => error.value === '')
  const invalid = computed(() => !valid.value)
  const pending = ref(false)
  const validated = ref(false)
  const executor = new ValidationRuleExecutor<T>()

  const validate = async ({ source }: ValidateMethodOptions = {}): Promise<boolean> => {
    executor.abort()

    pending.value = true

    try {
      const result = await executor.validate({
        source,
        value: valueRef.value,
        name: nameRef.value,
        rules: rulesRef.value,
        previousValue: previousValueRef.value,
      })

      error.value = result
      pending.value = false
      validated.value = true
      previousValueRef.value = valueRef.value

    } catch (error) {
      if (!isValidationAbortedError(error)) {
        console.warn('There was an error during validation')
        console.error(error)
      }
    }

    return valid.value
  }

  const reset: ResetMethod = (resetCallback) => {
    error.value = ''
    pending.value = false
    validated.value = false

    if (resetCallback) {
      pause()
      try {
        resetCallback()
      } finally {
        resume()
      }
    }
  }

  const pause = (): void => {
    stopWatch?.()
    stopWatch = undefined
  }

  const resume = (): void => {
    if (stopWatch) {
      return
    }
    startWatcher()
  }

  const state = reactive({
    valid,
    invalid,
    error,
    pending,
    validated,
  })

  const validation: UseValidation = {
    valid,
    invalid,
    error,
    pending,
    validated,
    validate,
    reset,
    pause,
    resume,
    state,
  }

  let mounted = false

  let stopWatch: WatchStopHandle | undefined
  function startWatcher(): void {
    stopWatch = watch(valueRef, (newValue, oldValue) => {
      if (!mounted) {
        return
      }

      if (isSame(newValue, oldValue)) {
        return
      }

      validate({ source: 'validator' })
    }, { deep: true })
  }
  startWatcher()

  const observer = injectFromSelfOrAncestor(VALIDATION_OBSERVER_INJECTION_KEY)

  let unregister: ValidationObserverUnregister | undefined

  onMounted(() => {
    unregister = observer?.register(validation)

    mounted = true
  })

  onUnmounted(() => {
    stopWatch?.()
    unregister?.()
  })

  return validation
}