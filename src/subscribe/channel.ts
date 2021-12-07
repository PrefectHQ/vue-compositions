/* eslint-disable @typescript-eslint/no-non-null-assertion */
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
  private static actionIds: Map<Action, number> = new Map()

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
  public loading: Ref<boolean> = ref(false)
  public result: Ref<Awaited<ReturnType<T>> | undefined> = ref(undefined)
  public errored: Ref<boolean> = ref(false)
  public error: Ref<unknown> = ref(null)

  private readonly manager: Manager
  private readonly action: T
  private readonly args: ActionArguments<T>
  private timer: ReturnType<typeof setInterval> | null = null
  private executed: boolean = false
  private lastExecution: number = 0
  private subscriptions: Map<number, Subscription<T>> = new Map()

  public get interval(): number {
    const intervals = Array.from(this.subscriptions.values()).map(
      (subscription) => subscription.options.interval ?? Infinity
    )

    return Math.min(...intervals) ?? Infinity
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

    if (!this.executed || options.updateResultOnSubscribe) {
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

    this.loading.value = true
    this.lastExecution = Date.now()
    this.executed = true

    this.setInterval()

    try {
      this.result.value = await this.action(...args)
      this.errored.value = false
      this.error.value = null
    } catch (error) {
      this.errored.value = true
      this.error.value = error
    } finally {
      this.loading.value = false
    }
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
