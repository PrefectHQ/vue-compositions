/* eslint-disable vue/one-component-per-file */
import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import { defineComponent, ref } from 'vue'
import { useValidation } from '@/useValidation'
import { useValidationObserver } from '@/useValidationObserver'
import { timeout } from '@/utilities/tests'

describe('useValidationObserver', () => {
  it('should observe a single useValidation', async () => {
    const validationRule = vi.fn().mockResolvedValue(true)
    const wrapper = mount(defineComponent({
      name: 'TestComponent',
      expose: ['validate'],
      setup() {
        const { validate } = useValidationObserver()
        useValidation(0, validationRule)
        return { validate }
      },
    }))

    const result = await wrapper.vm.validate()

    expect(result).toBe(true)
    expect(validationRule).toHaveBeenCalled()
  })

  it('should observe multiple useValidations', async () => {
    const validationRule1 = vi.fn().mockResolvedValue(true)
    const validationRule2 = vi.fn().mockResolvedValue(true)
    const wrapper = mount(defineComponent({
      name: 'TestComponent',
      expose: ['validate'],
      setup() {
        const { validate } = useValidationObserver()
        useValidation(0, validationRule1)
        useValidation(0, validationRule2)

        return { validate }
      },
    }))

    const result = await wrapper.vm.validate()

    expect(result).toBe(true)
    expect(validationRule1).toHaveBeenCalled()
    expect(validationRule2).toHaveBeenCalled()
  })

  it('should observe multiple useValidations and be invalid if any does not pass', async () => {
    const validationRule1Spy = vi.fn().mockResolvedValue(true)
    const validationRule2Spy = vi.fn().mockResolvedValue(false)
    const wrapper = mount(defineComponent({
      name: 'TestComponent',
      expose: ['validate'],
      setup() {
        const { validate } = useValidationObserver()
        useValidation(0, validationRule1Spy)
        useValidation(0, validationRule2Spy)

        return { validate }
      },
    }))

    const result = await wrapper.vm.validate()

    expect(result).toBe(false)
    expect(validationRule1Spy).toHaveBeenCalled()
    expect(validationRule2Spy).toHaveBeenCalled()
  })

  describe('reset', () => {
    it('should reset all observed validation states when reset is called', async () => {
      const validationRule1 = vi.fn().mockResolvedValue(true)
      const validationRule2 = vi.fn().mockResolvedValue(false)
      const wrapper = mount(defineComponent({
        name: 'TestComponent',
        expose: ['validate'],
        setup() {
          const { validate, reset, valid, errors } = useValidationObserver()
          useValidation(ref(0), validationRule1)
          useValidation(ref(0), validationRule2)

          return { validate, reset, valid, errors }
        },
      }))

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
      const validationRule = vi.fn().mockResolvedValue(false)
      const wrapper = mount(defineComponent({
        name: 'TestComponent',
        expose: ['validate'],
        setup() {
          const { validate, reset, valid, errors } = useValidationObserver()
          useValidation(value, validationRule)

          return { validate, reset, valid, errors }
        },
      }))

      // initial, pre-validated state should be true
      expect(wrapper.vm.valid).toBe(true)

      await wrapper.vm.validate()
      expect(wrapper.vm.valid).toBe(false)
      expect(wrapper.vm.errors).toHaveLength(1)

      validationRule.mockClear()
      wrapper.vm.reset(() => value.value = undefined)
      expect(wrapper.vm.valid).toBe(true)
      expect(wrapper.vm.errors).toHaveLength(0)

      await timeout()

      expect(validationRule).not.toHaveBeenCalled()
      expect(wrapper.vm.valid).toBe(true)
      expect(wrapper.vm.errors).toHaveLength(0)

      validationRule.mockClear()
      // the next value change should trigger validation
      value.value = 1
      await timeout()

      expect(validationRule).toHaveBeenCalled()
      expect(wrapper.vm.valid).toBe(false)
    })
  })
})