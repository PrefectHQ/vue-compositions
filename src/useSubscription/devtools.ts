import type {
  DevtoolsPluginApi,
  CustomInspectorNode,
  CustomInspectorState,
  InspectorNodeTag
} from '@vue/devtools-api'
import Channel from './models/channel'
import Manager from './models/manager'
import { getCurrentInstance } from 'vue'

export function withDevtoolIntercepts(map: Map<unknown, unknown>) {
  return new Proxy(map, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver)

      if (typeof value === 'function') {
        if (value.name === 'get') {

        }
        return value.bind(target)
      }

      return value
    },
  })
}

class UseSubscriptionDevtoolsInspector {
  public readonly channelNodes: Map<Channel['signature'], { node: CustomInspectorNode, channel: Channel }> = new Map()
  public readonly subscribedComponents: Map<Channel['signature'], Map<number, any>> = new Map()

  public refresh: () => void = () => {}

  public addChannel(channel: Channel): void {
    this.channelNodes.set(channel.signature, { node: mapChannelToInspectorNode(channel), channel })
    this.refresh()
  }

  public removeChannel(channel: Channel): void {
    this.channelNodes.delete(channel.signature)
    this.refresh()
  }

  public registerChannelSubscription(channel: Channel, subscriptionId: number): void {
    const channelSubscriptions = this.subscribedComponents.get(channel.signature) ?? new Map()
    const vm = getCurrentInstance()
    const componentName = vm ?? 'Unknown'
    channelSubscriptions.set(subscriptionId, componentName)
    this.subscribedComponents.set(channel.signature, channelSubscriptions)

    this.refresh()
  }

  public getCustomInspectorState(nodeId: string): CustomInspectorState {
    const {channel} = this.channelNodes.get(nodeId as Channel['signature']) ?? {}
    if (!channel) {
      return {"Error": [{ key: 'message', value: 'Channel not found.'}], "State": [], "Subscriptions": []}
    }
    const subscriptions = this.subscribedComponents.get(channel.signature) ?? new Map()
    
    return {
      "State": [
        {
          key: 'channel',
          value: channel,
        }
      ],
      "Subscriptions": [...subscriptions.entries()].map(([id, name]) => (
        {
          key: id,
          value: name,
        })
      ),
    }
  }
}

export const useSubscriptionDevtoolsInspector = new UseSubscriptionDevtoolsInspector()


function mapChannelToInspectorNode(channel: Channel): CustomInspectorNode {
  const prefix = "bound "
  const sanitizedChannelActionName = channel.actionName.startsWith(prefix) ? channel.actionName.slice(prefix.length) : channel.actionName
  return {
    id: channel.signature,
    label: `${sanitizedChannelActionName} ${channel.signature}`,
    tags: [
      {
        label: 'channel',
        textColor: 0xffffff,
        backgroundColor: 0x000000,
      },
    ],
  }
}

// function mapSubscriptionToInspectorState(subscription: Subscription): CustomInspectorState {
//   return {
//     "State": [
//         {
//           key: 'channel',
//           value: channel,
//         }
//       ]
//     },
//     "Subscriptions": [
//       {
//         key: 'subscriptions',
//         value: channel?.subscriptions,
//       }
//     ]
// }

// export class DevtoolsManager extends Manager {
//   override deleteChannel(signature: `${number}-${string}`): void {
//     const channel = this.channels.get(signature)
//     if (channel) {
//       useSubscriptionDevtoolsInspector.removeChannel(channel)
//     }
//   }
  
//   override addChannel(channel: Channel): void {
//     super.addChannel(channel)
//     useSubscriptionDevtoolsInspector.addChannel(channel)
//   }
// }