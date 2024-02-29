import { SubscriptionChannel } from '@/useSubscription/models/channel'
import { Subscription } from '@/useSubscription/models/subscription'
import {
  Action,
  ActionArguments,
  ChannelSignature
} from '@/useSubscription/types/action'
import { RefreshChannelOptions } from '@/useSubscription/types/channels'
import { SubscriptionOptions } from '@/useSubscription/types/subscription'
import * as useSubscriptionDevtools from '@/useSubscription/useSubscriptionDevtools'

export class SubscriptionManager {
  private readonly channels: Map<ChannelSignature, SubscriptionChannel> = new Map()

  public subscribe<T extends Action>(
    action: T,
    args: ActionArguments<T>,
    options: SubscriptionOptions,
  ): Subscription<T> {
    const channel = this.getChannel(action, args)
    const subscription = channel.subscribe(options)

    useSubscriptionDevtools.registerChannelSubscription(channel, subscription.id)

    return subscription
  }

  public pause(): void {
    for (const channel of this.channels.values()) {
      channel.paused = true
    }
  }

  public resume(): void {
    for (const channel of this.channels.values()) {
      channel.paused = false
    }
  }

  public refresh<T extends Action>(
    action: T,
    args: ActionArguments<T>,
    options?: RefreshChannelOptions,
  ): void {
    const { signature } = new SubscriptionChannel<T>(this, action, args)
    const channel = this.channels.get(signature)

    if (!channel) {
      return
    }

    channel.refresh(options)
  }

  public deleteChannel(signature: ChannelSignature): void {
    const channel = this.channels.get(signature)
    if (channel) {
      useSubscriptionDevtools.removeChannel(channel)
    }

    this.channels.delete(signature)
  }

  private getChannel<T extends Action>(
    action: T,
    args: ActionArguments<T>,
  ): SubscriptionChannel<T> {
    const channel = new SubscriptionChannel<T>(this, action, args)

    if (this.channels.has(channel.signature)) {
      return this.channels.get(channel.signature)! as SubscriptionChannel<T>
    }

    this.addChannel(channel)

    return channel
  }

  private addChannel(channel: SubscriptionChannel): void {
    this.channels.set(channel.signature, channel)

    useSubscriptionDevtools.addChannel(channel)
  }

}
