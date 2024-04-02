import { computed, onMounted, onUnmounted, reactive, ref, ToRefs, watch, unref, Ref, MaybeRef, MaybeRefOrGetter, WatchStopHandle, toRef } from 'vue'
import { NoInfer } from '@/types/generics'
import { MaybeArray, MaybePromise } from '@/types/maybe'
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

export type UseValidation = ToRefs<UseValidationState> & {
  validate: ValidateMethod,
  /**
   * Reset the validation state.
  *
  * @param resetCallback An optional callback that will be called within a pause/resume block.
  *   This allows you to reset validation state and then reset the value without triggering
  *   another validation on change.
  *
  * @example
  * ```ts
  * const value = ref(0)
  * const { reset } = useValidation(value, isGreaterThanZero)
  * reset(() => value.value = 0)
  * ```
  */
  // eslint-disable-next-line @typescript-eslint/method-signature-style -- JSDoc in IDE doesn't work nearly as well with a property
  reset(resetCallback?: () => void): void,
  pause: () => void,
  resume: () => void,
  state: UseValidationState,
}

export type ResetMethod = UseValidation['reset']

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

export function useValidation<T>(value: MaybeRefOrGetter<T>, rules: RulesArg<NoInfer<T>>): UseValidation
export function useValidation<T>(value: MaybeRefOrGetter<T>, name: MaybeRef<string>, rules: RulesArg<NoInfer<T>>): UseValidation
export function useValidation<T>(
  value: MaybeRefOrGetter<T>,
  nameOrRules: MaybeRef<string> | RulesArg<NoInfer<T>>,
  maybeRules?: RulesArg<NoInfer<T>>,
): UseValidation {

  if (isRules(nameOrRules)) {
    return useValidation(value, 'Value', nameOrRules)
  }

  if (maybeRules === undefined) {
    throw new Error('Invalid useValidation arguments')
  }

  const valueRef = toRef(value)
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