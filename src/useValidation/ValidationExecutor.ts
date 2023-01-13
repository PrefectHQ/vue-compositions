import { ValidationRule } from '@/useValidation/useValidation'
import { ValidationAbortedError } from '@/useValidation/ValidationAbortedError'
import { ValidationSkippedError } from '@/useValidation/ValidationSkippedError'

type Validate<T> = {
  value: T,
  name: string,
  rules: ValidationRule<T>[],
  previousValue: T | undefined,
  source: string | undefined,
}

export class ValidationRuleExecutor<T> {
  private controller = new AbortController()

  public abort(): void {
    this.controller.abort()

    this.controller = new AbortController()
  }

  public async validate({ value, name, rules, source, previousValue }: Validate<T>): Promise<string> {
    const { signal } = this.controller

    for (const rule of rules) {
      // eslint-disable-next-line no-await-in-loop
      const result = await rule(value, name, {
        source,
        signal,
        previousValue,
      })

      if (signal.aborted) {
        throw new ValidationAbortedError()
      }

      // we cannot stop looping when a rule skips...
      if (result === undefined) {
        throw new ValidationSkippedError()
      }

      if (result === false) {
        return `${name} is not valid`
      }

      if (typeof result === 'string') {
        return result
      }
    }

    return ''
  }

}