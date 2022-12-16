import { computed, ComputedRef, onMounted, onUnmounted, reactive, ref, Ref, unref, watch } from 'vue'
import { NoInfer } from '@/types/generics'
import { MaybePromise, MaybeRef } from '@/types/maybe'
import { State } from '@/useValidation/state'
import { ValidationAbortedError } from '@/useValidation/ValidationAbortedError'
import { ValidationRuleExecutor } from '@/useValidation/ValidationExecutor'
import { ValidationObserverUnregister, VALIDATION_OBSERVER_INJECTION_KEY } from '@/useValidationObserver/useValidationObserver'
import { injectFromSelfOrAncestor } from '@/utilities/injection'

export type UseValidation = {
  valid: ComputedRef<boolean>,
  invalid: ComputedRef<boolean>,
  error: Ref<string>,
  pending: Ref<boolean>,
  validate: () => Promise<boolean>,
  state: State,
}

export type ValidationRule<T> = (value: T, name: string, signal: AbortSignal) => MaybePromise<boolean | string>

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
  const invalid = computed(() => !valid.value)
  const pending = ref(false)
  const initialValue = unref(value)
  const touched = ref(false)
  const dirty = ref(false)
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

  const state: State = reactive({
    touched,
    pending,
    dirty,
    valid,
    validated,
    initialValue,
  })

  const validation: UseValidation = {
    error,
    valid,
    invalid,
    pending,
    validate,
    state,
  }

  let mounted = false
  const executor = new ValidationRuleExecutor<T>()
  const observer = injectFromSelfOrAncestor(VALIDATION_OBSERVER_INJECTION_KEY)

  let unregister: ValidationObserverUnregister | undefined

  watch(valueRef, value => {
    if (!mounted) {
      return
    }

    touched.value = true
    dirty.value = value !== initialValue

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