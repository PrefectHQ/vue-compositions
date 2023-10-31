import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { ValidationRule, useValidation } from '@/useValidation/useValidation'

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
  })
})
