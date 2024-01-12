import type {
  DevtoolsPluginApi,
  CustomInspectorNode,
  CustomInspectorState,
  TimelineEvent} from '@vue/devtools-api'
import Channel from './models/channel'
import { ComponentInternalInstance, getCurrentInstance, nextTick } from 'vue'

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

function throttle(fn: Function, wait: number) {
  let timeout: ReturnType<typeof setTimeout>;
  return function (...args) {
    const next = () => fn.apply(this, args);
    clearTimeout(timeout);
    timeout = setTimeout(next, wait);
  };
}

const SUBSCRIPTIONS_INSPECTOR_ID = 'prefect-vue-compositions-subscriptions'
const SUBSCRIPTIONS_TIMELINE_LAYER_ID = 'prefect-vue-compositions-subscriptions'

class UseSubscriptionDevtoolsInspector {
  public readonly channelNodes: Map<Channel['signature'], { node: CustomInspectorNode, channel: Channel }> = new Map()
  public readonly subscribedComponents: Map<Channel['signature'], Map<number, ComponentInternalInstance | null>> = new Map()

  private API: DevtoolsPluginApi<Record<string, unknown>> | null = null

  constructor() {
    this.refresh = throttle(this.refresh, 100)
  }

  public setupDevtools(api: DevtoolsPluginApi<Record<string, unknown>>): void {
    this.API = api
    api.addInspector({
      id: SUBSCRIPTIONS_INSPECTOR_ID,
      label: 'Subscriptions',
      icon: 'storage',
      treeFilterPlaceholder: 'Search subscriptions',
    })
  
    api.on.getInspectorTree((payload, context) => {
      if (payload.inspectorId === SUBSCRIPTIONS_INSPECTOR_ID) {
        payload.rootNodes = []
        const regex = new RegExp(payload.filter, 'i') // 'i' flag for case-insensitive search
        console.log('getInspectoTree', useSubscriptionDevtoolsInspector.channelNodes.size)
        for (const { node } of useSubscriptionDevtoolsInspector.channelNodes.values()) {
          if (payload.filter && !regex.test(node.label)) { continue }
          payload.rootNodes.push(node)
        }
      }
    })
  
    api.on.getInspectorState(async (payload, context) => {
      if (payload.inspectorId === SUBSCRIPTIONS_INSPECTOR_ID) {
        payload.state = useSubscriptionDevtoolsInspector.getCustomInspectorState(payload.nodeId)
  
        await Promise.all(payload.state["Subscribed Components"].map(async (subscription) => {
          if (!subscription.value) { return }
          const name = await api.getComponentName(subscription.value)
          subscription.value = name
        }))
      }
    })

    // Timeline Layer
    api.addTimelineLayer({
      id: SUBSCRIPTIONS_TIMELINE_LAYER_ID,
      label: 'Subscriptions',
      color: 0x4fc08d,
    })
  }

  public refresh(): void {
    setTimeout(async () => {
      await nextTick();
      this.API?.sendInspectorState(SUBSCRIPTIONS_INSPECTOR_ID);
      this.API?.sendInspectorTree(SUBSCRIPTIONS_INSPECTOR_ID);
    }, 100);
  }

  public addChannel(channel: Channel): void {
    this.addTimelineEvent({title: `Channel Created: ${channel.actionName}`, data: {channel}})

    this.channelNodes.set(channel.signature, { node: mapChannelToInspectorNode(channel), channel })
    this.refresh()
  }

  public removeChannel(channel: Channel): void {
    this.addTimelineEvent({title: `Channel removed ${channel.actionName}`, data: {channel}})

    this.channelNodes.delete(channel.signature)
    this.refresh()
  }

  public registerChannelSubscription(channel: Channel, subscriptionId: number): void {
    this.addTimelineEvent({title: 'Subscription Created', data: {channel, subscriptionId}})

    const channelSubscriptions = this.subscribedComponents.get(channel.signature) ?? new Map()
    const vm = getCurrentInstance()
    channelSubscriptions.set(subscriptionId, vm)
    this.subscribedComponents.set(channel.signature, channelSubscriptions)

    this.refresh()
  }

  public removeChannelSubscription(channel: Channel, subscriptionId: number): void {
    this.addTimelineEvent({title: 'Subscription removed', data: {channel, subscriptionId}})

    const channelSubscriptions = this.subscribedComponents.get(channel.signature)
    if (!channelSubscriptions) { return }
    channelSubscriptions.delete(subscriptionId)
    this.refresh()
  }

  public getCustomInspectorState(nodeId: string): CustomInspectorState {
    const {channel} = this.channelNodes.get(nodeId as Channel['signature']) ?? {}
    if (!channel) {
      return {"Error": [{ key: 'message', value: 'Channel not found.'}], "State": [], "Subscribed Components": []}
    }
    const subscriptions = this.subscribedComponents.get(channel.signature) ?? new Map()
    
    return {
      "State": [
        {
          key: 'channel',
          value: channel,
        }
      ],
      "Subscribed Components": [...subscriptions.entries()].map(([id, name]) => (
        {
          key: id,
          value: name,
        })
      ),
    }
  }

  public addTimelineEvent<T extends Omit<TimelineEvent, 'time'>>(event: T): void {
    this.API?.addTimelineEvent({
      layerId: SUBSCRIPTIONS_TIMELINE_LAYER_ID,
      event: {
        ...event,
        time: this.API.now(),
      },
    })
  }
}

export const useSubscriptionDevtoolsInspector = new UseSubscriptionDevtoolsInspector()


function mapChannelToInspectorNode(channel: Channel): CustomInspectorNode {
  return {
    id: channel.signature,
    label: `${channel.actionName} ${channel.signature}`,
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