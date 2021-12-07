/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  Action,
  ActionArguments,
  ChannelSignature,
  SubscriptionOptions
} from './types'
import Channel from './channel'
import Subscription from './subscription'

export default class Manager {
  private channels: Map<ChannelSignature, Channel> = new Map()

  public subscribe<T extends Action>(
    action: T,
    args: ActionArguments<T>,
    options: SubscriptionOptions
  ): Subscription<T> {
    const channel = this.getChannel(action, args)
    const subscription = channel.subscribe(options)

    return subscription
  }

  private getChannel<T extends Action>(
    action: T,
    args: ActionArguments<T>
  ): Channel<T> {
    const channel = new Channel<T>(this, action, args)

    if (this.channels.has(channel.signature)) {
      return this.channels.get(channel.signature)! as Channel<T>
    }

    this.channels.set(channel.signature, channel)

    return channel
  }

  public deleteChannel(signature: ChannelSignature) {
    this.channels.delete(signature)
  }
}
