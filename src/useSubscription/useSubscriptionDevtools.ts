import type {
  DevtoolsPluginApi,
  CustomInspectorNode,
  CustomInspectorState,
  TimelineEvent,
  PluginSettingsItem,
  ExtractSettingsTypes
} from '@vue/devtools-api'
import { ComponentInternalInstance, getCurrentInstance, nextTick } from 'vue'
import { SubscriptionChannel } from '@/useSubscription/models/channel'

function throttle(fn: () => void, wait: number): () => void {
  let isThrottled = false
  let invokedDuringThrottle = false

  function wrapper(this: unknown): void {
    if (isThrottled) {
      invokedDuringThrottle = true
      return
    }
    isThrottled = true

    fn.apply(this)

    setTimeout(() => {
      isThrottled = false
      if (invokedDuringThrottle) {
        wrapper.apply(this)
        invokedDuringThrottle = false
      }
    }, wait)
  }

  return wrapper
}

const SUBSCRIPTIONS_INSPECTOR_ID = 'prefect-vue-compositions-subscriptions'
const SUBSCRIPTIONS_TIMELINE_LAYER_ID = 'prefect-vue-compositions-subscriptions'

export const SUBSCRIPTION_DEVTOOLS_SETTINGS = {
  // timelineColor: {
  //   label: 'Timeline Color',
  //   type: 'choice',
  //   defaultValue: 0xFF69B4,
  //   options: [
  //     { value: 0x4fc08d, label: 'Vue Green' },
  //     { value: 0x175cd3, label: 'Prefect Blue' },
  //     { value: 0xFF69B4, label: 'Hot' }
  //   ],
  //   component: 'button-group'
  // }
} satisfies Record<string, PluginSettingsItem>

export type SubscriptionDevtoolsSettings = ExtractSettingsTypes<typeof SUBSCRIPTION_DEVTOOLS_SETTINGS>

const channelNodes: Map<SubscriptionChannel['signature'], { node: CustomInspectorNode, channel: SubscriptionChannel }> = new Map()
const subscribedComponents: Map<SubscriptionChannel['signature'], Map<number, ComponentInternalInstance | null>> = new Map()
let API: DevtoolsPluginApi<Record<string, unknown>> | null = null

export function init(api: DevtoolsPluginApi<SubscriptionDevtoolsSettings>): void {
  API = api
  api.addInspector({
    id: SUBSCRIPTIONS_INSPECTOR_ID,
    label: 'Subscriptions',
    icon: 'subscriptions',
    treeFilterPlaceholder: 'Search subscriptions',
  })

  api.on.getInspectorTree((payload) => {
    if (payload.inspectorId === SUBSCRIPTIONS_INSPECTOR_ID) {
      payload.rootNodes = []
      // 'i' flag for case-insensitive search
      const regex = new RegExp(payload.filter, 'i')
      for (const { node } of channelNodes.values()) {
        if (payload.filter && !regex.test(node.label)) {
          continue
        }
        payload.rootNodes.push(node)
      }
    }
  })

  api.on.getInspectorState(async (payload) => {
    if (payload.inspectorId === SUBSCRIPTIONS_INSPECTOR_ID) {
      payload.state = await getCustomInspectorState(payload.nodeId)
    }
  })

  // Timeline Layer
  api.addTimelineLayer({
    id: SUBSCRIPTIONS_TIMELINE_LAYER_ID,
    label: 'Subscriptions',
    color: 0x175cd3,
  })

  // api.on.setPluginSettings((payload, context) => {

  // })
}

function initialized(): boolean {
  return API !== null
}

const refresh: () => void = throttle(() => {
  setTimeout(async () => {
    await nextTick()
    API?.sendInspectorState(SUBSCRIPTIONS_INSPECTOR_ID)
    API?.sendInspectorTree(SUBSCRIPTIONS_INSPECTOR_ID)
  }, 100)
}, 200)

export function addChannel(channel: SubscriptionChannel): void {
  if (!initialized()) {
    return
  }
  addTimelineEvent({ title: `${channel.actionName} · Channel created`, data: { channel, action: channel.actionName }, groupId: channel.signature })

  channelNodes.set(channel.signature, { node: mapChannelToInspectorNode(channel), channel })
  refresh()
}

export type UpdateChannelEventTypes = 'Loading' | 'Error' | 'Executed' | 'Response' | 'Refresh' | 'Paused' | 'Late'
type UpdateChannelEvent = {
  [K in UpdateChannelEventTypes]: CreateSubscriptionDevtoolsTimelineEvent<K, EventTypeToDataMap[K]>
}[UpdateChannelEventTypes]
export function updateChannel(channel: SubscriptionChannel, event: UpdateChannelEvent): void {
  if (!initialized()) {
    return
  }

  channelNodes.set(channel.signature, { node: mapChannelToInspectorNode(channel), channel })
  addTimelineEvent(event)
  refresh()
}

export function removeChannel(channel: SubscriptionChannel): void {
  if (!initialized()) {
    return
  }
  addTimelineEvent({ title: `${channel.actionName} · Channel removed`, data: { channel, action: channel.actionName }, groupId: channel.signature })

  channelNodes.delete(channel.signature)
  refresh()
}

export function registerChannelSubscription(channel: SubscriptionChannel, subscriptionId: number): void {
  if (!initialized()) {
    return
  }
  addTimelineEvent({ title: `${channel.actionName} · Subscription created`, data: { channel, action: channel.actionName, subscriptionId }, groupId: channel.signature })

  const channelSubscriptions = subscribedComponents.get(channel.signature) ?? new Map()
  const vm = getCurrentInstance()
  channelSubscriptions.set(subscriptionId, vm)
  subscribedComponents.set(channel.signature, channelSubscriptions)

  refresh()
}

export function removeChannelSubscription(channel: SubscriptionChannel, subscriptionId: number): void {
  if (!initialized()) {
    return
  }
  addTimelineEvent({ title: `${channel.actionName} · Subscription removed`, data: { channel, action: channel.actionName, subscriptionId }, groupId: channel.signature })

  const channelSubscriptions = subscribedComponents.get(channel.signature)
  if (!channelSubscriptions) {
    return
  }
  channelSubscriptions.delete(subscriptionId)
  refresh()
}

type SubscriptionsInspectorState = CustomInspectorState & {
  State: CustomInspectorState[keyof CustomInspectorState],
  'Subscribed Components': CustomInspectorState[keyof CustomInspectorState],
}

async function getCustomInspectorState(nodeId: string): Promise<SubscriptionsInspectorState> {
  const { channel } = channelNodes.get(nodeId as SubscriptionChannel['signature']) ?? {}
  if (!channel) {
    return { 'Error': [{ key: 'message', value: 'Channel not found.' }], 'State': [], 'Subscribed Components': [] }
  }
  const subscriptions = subscribedComponents.get(channel.signature) ?? new Map<number, ComponentInternalInstance | null>()

  return {
    'State': [
      {
        key: 'channel',
        value: channel,
      },
    ],
    'Subscribed Components': await Promise.all([...subscriptions.entries()].map(async ([id, vm]) => {
      let componentName = vm ? await API?.getComponentName(vm) : null

      if (!componentName) {
        componentName = vm === null ? '﹖ Unknown component' : "🔎 Couldn't resolve component name"
      }

      return {
        key: String(id),
        value: componentName,
      }
    })),
  }
}

type CreateSubscriptionDevtoolsTimelineEvent<TEvent extends string, TData> = Omit<TimelineEvent<TData>, 'time'> & {
  title: `${string} · ${TEvent}`,
  groupId: string,
}

type EventTypeToDataMap = {
  'Channel created': { channel: SubscriptionChannel, action: string },
  'Channel removed': { channel: SubscriptionChannel, action: string },
  'Subscription created': { channel: SubscriptionChannel, action: string, subscriptionId: number },
  'Subscription removed': { channel: SubscriptionChannel, action: string, subscriptionId: number },
  'Loading': { channel: SubscriptionChannel, action: string, loading: boolean },
  'Error': { channel: SubscriptionChannel, action: string, error: unknown },
  'Executed': { channel: SubscriptionChannel, action: string, executed: boolean },
  'Response': { channel: SubscriptionChannel, action: string, response: unknown },
  'Refresh': { channel: SubscriptionChannel, action: string },
  'Paused': { channel: SubscriptionChannel, action: string, paused: boolean },
  'Late': { channel: SubscriptionChannel, action: string, late: boolean },
}

type SubscriptionDevtoolsTimelineEvent = {
  [K in keyof EventTypeToDataMap]: CreateSubscriptionDevtoolsTimelineEvent<K, EventTypeToDataMap[K]>
}[keyof EventTypeToDataMap]

function addTimelineEvent(event: SubscriptionDevtoolsTimelineEvent): void {
  API?.addTimelineEvent({
    layerId: SUBSCRIPTIONS_TIMELINE_LAYER_ID,
    event: {
      ...event,
      time: API.now(),
    },
  })
}

function mapChannelToInspectorNode(channel: SubscriptionChannel): CustomInspectorNode {
  return {
    id: channel.signature,
    label: `${channel.actionName} ${channel.signature}`,
    tags: [
      {
        label: 'channel',
        textColor: 0xffffff,
        backgroundColor: 0x175cd3,
      },
    ],
  }
}
