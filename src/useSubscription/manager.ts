import Channel from './channel'
import Subscription from './subscription'
import {
  Action,
  ActionArguments,
  ChannelSignature,
  SubscriptionOptions
} from './types'

export default class Manager {
  private readonly channels: Map<ChannelSignature, Channel> = new Map()

  public subscribe<T extends Action>(
    action: T,
    args: ActionArguments<T>,
    options: SubscriptionOptions,
  ): Subscription<T> {
    const channel = this.getChannel(action, args)
    const subscription = channel.subscribe(options)

    return subscription
  }

  public deleteChannel(signature: ChannelSignature): void {
    this.channels.delete(signature)
  }

  private getChannel<T extends Action>(
    action: T,
    args: ActionArguments<T>,
  ): Channel<T> {
    const channel = new Channel<T>(this, action, args)

    if (this.channels.has(channel.signature)) {
      return this.channels.get(channel.signature)! as Channel<T>
    }

    this.channels.set(channel.signature, channel)

    return channel
  }
}
