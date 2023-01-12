import { computed, onMounted, onUnmounted, reactive, ref, ToRefs, watch, unref } from 'vue'
import { NoInfer } from '@/types/generics'
import { MaybeArray, MaybePromise, MaybeRef } from '@/types/maybe'
import { ValidationAbortedError } from '@/useValidation/ValidationAbortedError'
import { ValidationRuleExecutor } from '@/useValidation/ValidationExecutor'
import { ValidationObserverUnregister, VALIDATION_OBSERVER_INJECTION_KEY } from '@/useValidationObserver/useValidationObserver'
import { asArray } from '@/utilities/arrays'
import { injectFromSelfOrAncestor } from '@/utilities/injection'
import { isSame } from '@/utilities/variables'

export type UseValidationState = {
  valid: boolean,
  invalid: boolean,
  error: string,
  pending: boolean,
  validated: boolean,
}

export type UseValidation = ToRefs<UseValidationState> & {
  validate: () => Promise<boolean>,
  state: UseValidationState,
}

export type ValidationRule<T> = (value: T, name: string, signal: AbortSignal) => MaybePromise<boolean | string>

export function useValidation<T>(
  value: MaybeRef<T>,
  name: MaybeRef<string>,
  rules: MaybeRef<MaybeArray<ValidationRule<NoInfer<T>>>>,
): UseValidation {
  const valueRef = ref(value)
  const nameRef = ref(name)
  const rulesRef = computed(() => asArray(unref(rules)))

  const error = ref<string>('')
  const valid = computed(() => error.value === '')
  const invalid = computed(() => !valid.value)
  const pending = ref(false)
  const validated = ref(false)

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
    validated.value = true

    return valid.value
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
    state,
  }

  let mounted = false
  const executor = new ValidationRuleExecutor<T>()
  const observer = injectFromSelfOrAncestor(VALIDATION_OBSERVER_INJECTION_KEY)

  let unregister: ValidationObserverUnregister | undefined

  watch(valueRef, (newValue, oldValue) => {
    if (!mounted) {
      return
    }

    if (isSame(newValue, oldValue)) {
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