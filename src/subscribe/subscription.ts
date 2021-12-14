import { Ref, watch } from 'vue'
import { Action, SubscriptionOptions } from './types'
import Channel from './channel'

class SubscriptionIdManager {
  private static id: number = 0

  public static get() {
    return SubscriptionIdManager.id++
  }
}

export default class Subscription<T extends Action> {
  public readonly id: number
  public readonly options: SubscriptionOptions

  private readonly channel: Channel<T>

  public get error(): Ref<unknown> {
    return this.channel.error
  }

  public get errored(): Ref<boolean> {
    return this.channel.errored
  }

  public get loading(): Ref<boolean> {
    return this.channel.loading
  }

  public get response(): Ref<Awaited<ReturnType<T>> | undefined> {
    return this.channel.response
  }

  constructor(channel: Channel<T>, options: SubscriptionOptions) {
    this.id = SubscriptionIdManager.get()
    this.channel = channel
    this.options = options
  }

  public refresh(): void {
    this.channel.execute()
  }

  public subscribe(): Subscription<T> {
    this.channel.unsubscribe(this.id)

    return this.channel.subscribe(this.options)
  }

  public unsubscribe(): void {
    this.channel.unsubscribe(this.id)
  }

  public promise(): Promise<Subscription<T>> {
    return new Promise((resolve, reject) => {
      if(this.channel.executed) {
        if(this.errored.value == true) {
          reject(this.error.value)
          return
        }
        
        resolve(this)
        return
      }

      let loadingWatcher
      let erroredWatcher

      loadingWatcher = watch(this.loading, () => {
        if(this.loading.value === false) {
          if(erroredWatcher) {
            erroredWatcher()
          }
          
          loadingWatcher()
          resolve(this)
        }
      })

      erroredWatcher = watch(this.errored, () => {
        if(this.errored.value === true) {
          if(loadingWatcher) {
            loadingWatcher()
          }
          
          erroredWatcher()
          reject(this.error.value)
        }
      })
    })
  }
}
