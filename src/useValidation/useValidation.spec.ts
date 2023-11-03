import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { ValidationRule, useValidation } from '@/useValidation/useValidation'
import { flushPromises } from '@/utilities/tests'

const isGreaterThanZero: ValidationRule<number> = (value, name) => {
  if (value > 0) {
    return true
  }

  return `${name} must be greater than 0`
}

describe('useValidation', () => {
  describe('validate', () => {
    it('sets valid to true when the rules pass', async () => {
      const { valid, error, validate } = useValidation(
        ref(1),
        'Number',
        isGreaterThanZero,
      )

      await validate()

      expect(valid.value).toBe(true)
      expect(error.value).toBe('')
    })

    it('sets valid to false with an error message when the rules do not pass', async () => {
      const { valid, error, validate } = useValidation(
        ref(0),
        'Number',
        isGreaterThanZero,
      )

      await validate()

      expect(valid.value).toBe(false)
      expect(error.value).toBe('Number must be greater than 0')
    })

    it('triggers automatically when the value changes', async () => {
      const theValue = ref(0)
      const validationRule = vi.fn().mockResolvedValue('Validation did not pass')
      const wrapper = mount({
        setup() {
          const { valid, error } = useValidation(
            theValue,
            validationRule,
          )

          return { valid, error }
        },
      })

      expect(wrapper.vm.valid).toBe(true)
      expect(wrapper.vm.error).toBe('')
      expect(validationRule).not.toHaveBeenCalled()

      theValue.value = 1
      await nextTick()
      await flushPromises()

      expect(validationRule).toHaveBeenCalled()
      expect(wrapper.vm.error).toBe('Validation did not pass')
      expect(wrapper.vm.valid).toBe(false)
    })
  })

  describe('pause and resume', () => {
    it('prevents validation from running when paused', async () => {
      const theValue = ref(0)
      const validationRule = vi.fn().mockResolvedValue('Validation did not pass')
      const wrapper = mount({
        setup() {
          const { valid, error, pause, resume } = useValidation(
            theValue,
            validationRule,
          )

          return { valid, error, pause, resume }
        },
      })

      expect(wrapper.vm.valid).toBe(true)
      expect(wrapper.vm.error).toBe('')
      expect(validationRule).not.toHaveBeenCalled()

      wrapper.vm.pause()
      theValue.value = 1
      await nextTick()
      await flushPromises()

      expect(validationRule).not.toHaveBeenCalled()
      expect(wrapper.vm.error).toBe('')
      expect(wrapper.vm.valid).toBe(true)

      wrapper.vm.resume()
      theValue.value = 2
      await nextTick()
      await flushPromises()

      expect(validationRule).toHaveBeenCalled()
      expect(wrapper.vm.error).toBe('Validation did not pass')
      expect(wrapper.vm.valid).toBe(false)
    })
  })

  describe('reset', () => {
    it('resets the validation state', async () => {
      const { state, validate, reset } = useValidation(
        ref(0),
        'Number',
        isGreaterThanZero,
      )

      await validate()

      expect(state.valid).toBe(false)
      expect(state.error).toBe('Number must be greater than 0')

      reset()

      expect(state.valid).toBe(true)
      expect(state.error).toBe('')
      expect(state.validated).toBe(false)
    })

    it('resets the validation state and optionally allows the value to be reset without revalidating', async () => {
      const theValue = ref(0)
      async function updateTheValueAndWaitForEffects(value: number): Promise<void> {
        theValue.value = value
        await nextTick()
        await flushPromises()
      }
      const wrapper = mount({
        setup() {
          const { state, reset, pause, resume } = useValidation(
            theValue,
            isGreaterThanZero,
          )

          return { state, reset, pause, resume }
        },
      })
      expect(wrapper.vm.state.valid).toBe(true)

      await updateTheValueAndWaitForEffects(-1)
      expect(wrapper.vm.state.valid).toBe(false)

      // without the reset callback managing pause/resume, changing the value triggers validations again
      wrapper.vm.reset()
      expect(wrapper.vm.state.valid).toBe(true)

      await updateTheValueAndWaitForEffects(0)
      expect(wrapper.vm.state.valid).toBe(false)

      // now try with a reset callback
      await updateTheValueAndWaitForEffects(1)
      expect(wrapper.vm.state.valid).toBe(true)

      wrapper.vm.reset(() => theValue.value = 0)
      await nextTick()
      await flushPromises()
      expect(theValue.value).toBe(0)
      expect(wrapper.vm.state.valid).toBe(true)

      // make sure it resumes normal behavior
      await updateTheValueAndWaitForEffects(-1)
      expect(wrapper.vm.state.valid).toBe(false)
    })
  })
})
