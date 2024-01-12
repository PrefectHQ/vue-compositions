/* eslint-disable max-classes-per-file */
import { isEqual } from 'lodash'
import { effectScope } from 'vue'
import Manager from '@/useSubscription/models/manager'
import Subscription from '@/useSubscription/models/subscription'
import {
  Action,
  ActionArguments,
  ActionResponse,
  ChannelSignature
} from '@/useSubscription/types/action'
import { SubscriptionOptions } from '@/useSubscription/types/subscription'
import { unrefArgs } from '@/useSubscription/utilities/reactivity'

class ChannelSignatureManager {
  private static actionId: number = 0
  private static readonly actionIds: Map<Action, number> = new Map()

  public static get<T extends Action>(
    action: T,
    args: ActionArguments<T>,
  ): ChannelSignature {
    let actionId

    if (ChannelSignatureManager.actionIds.has(action)) {
      actionId = ChannelSignatureManager.actionIds.get(action)!
    } else {
      actionId = ChannelSignatureManager.actionId++

      ChannelSignatureManager.actionIds.set(action, actionId)
    }

    const unwrapped = unrefArgs(args)
    const stringArgs = JSON.stringify(unwrapped)

    return `${actionId}-${stringArgs}`
  }
}

export default class Channel<T extends Action = Action> {
  public readonly signature: ChannelSignature

  private readonly manager: Manager
  private readonly action: T
  private readonly args: ActionArguments<T>
  private readonly subscriptions: Map<number, Subscription<T>> = new Map()
  private scope = effectScope()
  private timer: ReturnType<typeof setInterval> | null = null
  private lastExecution: number = 0
  private _loading: boolean = false
  private _executed: boolean = false
  private _errored: boolean = false
  private _error: unknown = null
  private _response: ActionResponse<T> | undefined = undefined

  public constructor(manager: Manager, action: T, args: ActionArguments<T>) {
    this.signature = ChannelSignatureManager.get(action, args)
    this.manager = manager
    this.action = action
    this.args = args
  }

  public get actionName(): string {
    const prefix = "bound "
    const sanitizedChannelActionName = this.action.name.startsWith(prefix) ? this.action.name.slice(prefix.length) : this.action.name
    return sanitizedChannelActionName
  }

  private get interval(): number {
    const intervals = Array
      .from(this.subscriptions.values())
      .map(subscription => subscription.options.interval ?? Infinity)

    return Math.min(...intervals)
  }

  public get response(): ActionResponse<T> | undefined {
    return this._response
  }

  private set response(response: ActionResponse<T> | undefined) {
    if (isEqual(this._response, response)) {
      return
    }

    this._response = response

    for (const subscription of this.subscriptions.values()) {
      subscription.response.value = response
    }
  }

  public get executed(): boolean {
    return this._executed
  }

  private set executed(executed: boolean) {
    this._executed = executed

    for (const subscription of this.subscriptions.values()) {
      subscription.executed.value = executed
    }
  }

  public get loading(): boolean {
    return this._loading
  }

  private set loading(loading: boolean) {
    this._loading = loading

    for (const subscription of this.subscriptions.values()) {
      subscription.loading.value = loading
    }
  }

  public get errored(): boolean {
    return this._errored
  }

  private set errored(errored: boolean) {
    this._errored = errored

    for (const subscription of this.subscriptions.values()) {
      subscription.errored.value = errored
    }
  }

  public get error(): unknown {
    return this._error
  }

  private set error(error: unknown) {
    this._error = error

    for (const subscription of this.subscriptions.values()) {
      subscription.error.value = error
    }
  }

  public subscribe(options: SubscriptionOptions): Subscription<T> {
    const subscription = new Subscription(this, options)

    this.subscriptions.set(subscription.id, subscription)

    if (this.executed || this.loading) {
      subscription.executed.value = this.executed
    } else {
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
      this.scope.stop()
    }
  }

  public async execute(): Promise<void> {
    const args = unrefArgs(this.args)

    this.loading = true
    this.lastExecution = Date.now()

    this.setInterval()

    try {
      this.response = await this.scope.run(() => this.action(...args))
      this.errored = false
      this.error = null
    } catch (error) {
      this.errored = true
      this.error = error
      this.clearTimer()
      this.onError(error)

      console.error(error)
    } finally {
      this.executed = true
      this.loading = false
    }
  }

  public refresh(): Promise<void> {
    this.scope.stop()
    this.scope = effectScope()
    const response = this.execute()

    return response
  }

  public isSubscribed(id: number): boolean {
    return this.subscriptions.has(id)
  }

  private clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer)
    }
  }

  private setInterval(): void {
    this.clearTimer()

    if (this.interval === Infinity) {
      return
    }

    if (this.errored) {
      return
    }

    const sinceLastRun = Date.now() - this.lastExecution
    const timeTillNextExecution = this.interval - sinceLastRun

    this.timer = setTimeout(() => this.refresh(), timeTillNextExecution)
  }

  private onError(error: unknown): void {
    for (const subscription of this.subscriptions.values()) {
      subscription.options.onError?.(error)
    }
  }
}
