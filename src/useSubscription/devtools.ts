import type {
  DevtoolsPluginApi,
  CustomInspectorNode,
  CustomInspectorState,
  InspectorNodeTag
} from '@vue/devtools-api'
import Channel from './models/channel'

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
  public readonly channelNodes: CustomInspectorNode[] = []

  public constructor() {
    this.channelNodes = []
  }

  public addChannel(channel: Channel): void {
    this.channelNodes.push(mapChannelToInspectorNode(channel))
  }

  public removeChannel(channel: Channel): void {
    this.channelNodes.splice(this.channelNodes.indexOf(mapChannelToInspectorNode(channel)), 1)
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