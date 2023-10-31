import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'
import { useValidation } from '@/useValidation'
import { useValidationObserver } from '@/useValidationObserver'

describe('useValidationObserver', () => {
  it('should observe a single useValidation', async () => {
    const validationSpy = vi.fn().mockResolvedValue(true)
    const wrapper = mount({
      setup() {
        const { validate } = useValidationObserver()
        useValidation(ref(0), 'Number', validationSpy)
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
        useValidation(ref(0), 'Number', validationSpy1)
        useValidation(ref(0), 'Number', validationSpy2)

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
    const validationRule2Spy = vi.fn().mockResolvedValue(false)
    const wrapper = mount({
      setup() {
        const { validate } = useValidationObserver()
        useValidation(ref(0), 'Number', validationRule1Spy)
        useValidation(ref(0), 'Number', validationRule2Spy)

        return { validate }
      },
    })

    const result = await wrapper.vm.validate()

    expect(result).toBe(false)
    expect(validationRule1Spy).toHaveBeenCalled()
    expect(validationRule2Spy).toHaveBeenCalled()
  })
})