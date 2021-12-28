import { Ref, ref, unref } from 'vue'
import Manager from './manager'
import Subscription from './subscription'
import {
  Action,
  ActionArguments,
  ChannelSignature,
  SubscriptionOptions
} from './types'

class ChannelSignatureManager {
  private static actionId: number = 0
  private static readonly actionIds: Map<Action, number> = new Map()

  public static get<T extends Action>(
    action: T,
    args: ActionArguments<T>
  ): ChannelSignature {
    let actionId

    if (ChannelSignatureManager.actionIds.has(action)) {
      actionId = ChannelSignatureManager.actionIds.get(action)!
    } else {
      actionId = ChannelSignatureManager.actionId++

      ChannelSignatureManager.actionIds.set(action, actionId)
    }

    return `${actionId}-${JSON.stringify(args)}`
  }
}

export default class Channel<T extends Action = Action> {
  public readonly signature: ChannelSignature
  public executed: boolean = false

  private readonly manager: Manager
  private readonly action: T
  private readonly args: ActionArguments<T>
  private timer: ReturnType<typeof setInterval> | null = null
  private lastExecution: number = 0
  private readonly subscriptions: Map<number, Subscription<T>> = new Map()

  private get interval(): number {
    const intervals = Array.from(this.subscriptions.values()).map(
      (subscription) => subscription.options.interval ?? Infinity
    )

    return Math.min(...intervals) ?? Infinity
  }

  private set loading(loading: boolean) {
    for (const subscription of this.subscriptions.values()) {
      subscription.loading.value = loading
    }
  }

  private set errored(errored: boolean) {
    for (const subscription of this.subscriptions.values()) {
      subscription.errored.value = errored
    }
  }

  private set error(error: unknown) {
    for (const subscription of this.subscriptions.values()) {
      subscription.error.value = error
    }
  }

  private set response(response: Awaited<ReturnType<T>>) {
    for (const subscription of this.subscriptions.values()) {
      subscription.response.value = response
    }
  }

  constructor(manager: Manager, action: T, args: ActionArguments<T>) {
    this.signature = ChannelSignatureManager.get(action, args)
    this.manager = manager
    this.action = action
    this.args = args
  }

  public subscribe(options: SubscriptionOptions): Subscription<T> {
    const subscription = new Subscription(this, options)

    this.subscriptions.set(subscription.id, subscription)

    if (!this.executed) {
      this.execute()
    }

    this.setInterval()

    return subscription
  }

  public unsubscribe(subscriptionId: number): void {
    this.subscriptions.delete(subscriptionId)

    this.setInterval()

    if (this.subscriptions.size == 0) {
      this.manager.deleteChannel(this.signature)
    }
  }

  public async execute() {
    const args = (unref(this.args) as Parameters<T>).map(unref)

    this.loading = true
    this.executed = true
    this.lastExecution = Date.now()

    this.setInterval()

    try {
      this.response = await this.action(...args)
      this.errored = false
      this.error = null
    } catch (error) {
      this.errored = true
      this.error = error
    } finally {
      this.loading = false
    }
  }

  public isSubscribed(id: number): boolean {
    return this.subscriptions.has(id)
  }

  private setInterval() {
    if (this.timer) {
      clearTimeout(this.timer)
    }

    if (this.interval === Infinity) {
      return
    }

    const sinceLastRun = Date.now() - this.lastExecution
    const timeTillNextExecution = this.interval - sinceLastRun

    this.timer = setTimeout(() => this.execute(), timeTillNextExecution)
  }
}
