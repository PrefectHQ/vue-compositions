import { Ref } from 'vue'
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

  public get result(): Ref<Awaited<ReturnType<T>> | undefined> {
    return this.channel.result
  }

  constructor(channel: Channel<T>, options: SubscriptionOptions) {
    this.id = SubscriptionIdManager.get()
    this.channel = channel
    this.options = options
  }

  public refresh() {
    this.channel.execute()
  }

  public subscribe() {
    this.channel.unsubscribe(this.id)
    this.channel.subscribe(this.options)
  }

  public unsubscribe() {
    this.channel.unsubscribe(this.id)
  }
}
