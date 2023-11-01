import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { useValidation } from '@/useValidation'
import { useValidationObserver } from '@/useValidationObserver'

describe('useValidationObserver', () => {
  it('should observe a single useValidation', async () => {
    const validationSpy = vi.fn().mockResolvedValue(true)
    const wrapper = mount({
      setup() {
        const { validate } = useValidationObserver()
        useValidation(ref(0), validationSpy)
        return { validate }
      },
    })

    const result = await wrapper.vm.validate()

    expect(result).toBe(true)
    expect(validationSpy).toHaveBeenCalled()
  })

  it('should observe multiple useValidations', async () => {
    const validationSpy1 = vi.fn().mockResolvedValue(true)
    const validationSpy2 = vi.fn().mockResolvedValue(true)
    const wrapper = mount({
      setup() {
        const { validate } = useValidationObserver()
        useValidation(ref(0), validationSpy1)
        useValidation(ref(0), validationSpy2)

        return { validate }
      },
    })

    const result = await wrapper.vm.validate()

    expect(result).toBe(true)
    expect(validationSpy1).toHaveBeenCalled()
    expect(validationSpy2).toHaveBeenCalled()
  })

  it('should observe multiple useValidations and be invalid if any does not pass', async () => {
    const validationRule1Spy = vi.fn().mockResolvedValue(true)
    const validationRule2Spy = vi.fn().mockResolvedValue('Number must be greater than 0')
    const wrapper = mount({
      setup() {
        const { validate } = useValidationObserver()
        useValidation(ref(0), validationRule1Spy)
        useValidation(ref(0), validationRule2Spy)

        return { validate }
      },
    })

    const result = await wrapper.vm.validate()

    expect(result).toBe(false)
    expect(validationRule1Spy).toHaveBeenCalled()
    expect(validationRule2Spy).toHaveBeenCalled()
  })

  describe('reset', () => {
    it('should reset all observed validation states when reset is called', async () => {
      const validationRule1Spy = vi.fn().mockResolvedValue(true)
      const validationRule2Spy = vi.fn().mockResolvedValue('Number must be greater than 0')
      const wrapper = mount({
        setup() {
          const { validate, reset, valid, errors } = useValidationObserver()
          useValidation(ref(0), validationRule1Spy)
          useValidation(ref(0), validationRule2Spy)

          return { validate, reset, valid, errors }
        },
      })

      // initial, pre-validated state should be true
      expect(wrapper.vm.valid).toBe(true)

      await wrapper.vm.validate()
      expect(wrapper.vm.valid).toBe(false)
      expect(wrapper.vm.errors).toHaveLength(1)

      wrapper.vm.reset()
      expect(wrapper.vm.valid).toBe(true)
      expect(wrapper.vm.errors).toHaveLength(0)
    })

    it('should reset and allow the value to be reset without rerunning validations', async () => {
      const value = ref<number | undefined>(0)
      // this validator will always fail. testing that calling reset allows the value to be reset without revalidating
      const validationRuleSpy = vi.fn().mockResolvedValue('Number must be greater than 0')
      const wrapper = mount({
        setup() {
          const { validate, reset, valid, errors } = useValidationObserver()
          useValidation(value, validationRuleSpy)

          return { validate, reset, valid, errors }
        },
      })

      // initial, pre-validated state should be true
      expect(wrapper.vm.valid).toBe(true)

      await wrapper.vm.validate()
      expect(wrapper.vm.valid).toBe(false)
      expect(wrapper.vm.errors).toHaveLength(1)

      wrapper.vm.reset({ skipNextValidateOnChange: true })
      expect(wrapper.vm.valid).toBe(true)
      expect(wrapper.vm.errors).toHaveLength(0)

      validationRuleSpy.mockClear()

      value.value = undefined
      await nextTick()

      expect(validationRuleSpy).not.toHaveBeenCalled()
      expect(wrapper.vm.valid).toBe(true)
      expect(wrapper.vm.errors).toHaveLength(0)

      validationRuleSpy.mockClear()
      // the next value change should trigger validation
      value.value = 1
      await nextTick()
      await new Promise(setImmediate)

      expect(validationRuleSpy).toHaveBeenCalled()
      expect(wrapper.vm.valid).toBe(false)
    })
  })
})