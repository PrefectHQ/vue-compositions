import { ref, Ref, watch } from 'vue'
import Channel from './channel'
import { Action, SubscriptionOptions } from './types'

class SubscriptionIdManager {
  private static id: number = 0

  public static get() {
    return SubscriptionIdManager.id++
  }
}

export default class Subscription<T extends Action> {
  public readonly id: number
  public readonly options: SubscriptionOptions
  public loading: Ref<boolean> = ref(false)
  public response: Ref<Awaited<ReturnType<T>> | undefined> = ref(undefined)
  public errored: Ref<boolean> = ref(false)
  public error: Ref<unknown> = ref(null)

  private readonly channel: Channel<T>

  constructor(channel: Channel<T>, options: SubscriptionOptions) {
    this.id = SubscriptionIdManager.get()
    this.channel = channel
    this.options = options
  }

  public async refresh(): Promise<void> {
    await this.channel.execute()
  }

  public unsubscribe(): void {
    this.channel.unsubscribe(this.id)
  }

  public isSubscribed(): boolean {
    return this.channel.isSubscribed(this.id)
  }

  public promise(): Promise<Subscription<T>> {
    return new Promise((resolve, reject) => {
      if (this.channel.executed) {
        if (this.errored.value) {
          reject(this.error.value)
          return
        }

        resolve(this)
        return
      }

      let loadingWatcher
      let erroredWatcher

      loadingWatcher = watch(this.loading, () => {
        if (!this.loading.value) {
          if (erroredWatcher) {
            erroredWatcher()
          }

          loadingWatcher()
          resolve(this)
        }
      })

      erroredWatcher = watch(this.errored, () => {
        if (this.errored.value) {
          if (loadingWatcher) {
            loadingWatcher()
          }

          erroredWatcher()
          reject(this.error.value)
        }
      })
    })
  }
}
