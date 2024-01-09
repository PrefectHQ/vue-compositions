import {
  type App,
  setupDevtoolsPlugin,
  type DevtoolsPluginApi,
  type CustomInspectorNode,
  type CustomInspectorState,
  type InspectorNodeTag
} from '@vue/devtools-api'
import { useSubscriptionDevtoolsInspector } from './useSubscription/devtools'

export function setupDevtools(app: App): void {
  setupDevtoolsPlugin({
    id: 'prefect-vue-compositions-devtools',
    label: 'Prefect Devtools',
    packageName: '@prefecthq/vue-compositions',
    homepage: 'https://www.prefect.io/',
    app,
  }, (api) => {
    // api.on.inspectComponent((payload, ctx) => {
    //   payload.instanceData.state.push({
    //     type: 'text',
    //     key: 'subscriptions',
    //     editable: false,
    //     value: ,
    //   })
    //   })
    setupSubscriptionsInspector(api)
    api.getComponentName
  })
}

const SUBSCRIPTIONS_INSPECTOR_ID = 'prefect-vue-compositions-subscriptions'

function setupSubscriptionsInspector(api: DevtoolsPluginApi<Record<string, unknown>>): void {
  api.addInspector({
    id: SUBSCRIPTIONS_INSPECTOR_ID,
    label: 'Subscriptions',
    icon: 'storage',
    treeFilterPlaceholder: 'Search subscriptions',
  })

  api.on.getInspectorTree((payload, context) => {
    if (payload.inspectorId === SUBSCRIPTIONS_INSPECTOR_ID) {
      payload.rootNodes = []
      for (const { node } of useSubscriptionDevtoolsInspector.channelNodes.values()) {
        payload.rootNodes.push(node)
      }
    }
  })

  api.on.getInspectorState((payload, context) => {
    if (payload.inspectorId === SUBSCRIPTIONS_INSPECTOR_ID) {
      payload.state = useSubscriptionDevtoolsInspector.getCustomInspectorState(payload.nodeId)
    }
  })
}

// export const refreshInspector = throttle(() => {
//   setTimeout(async () => {
//     await nextTick();
//     API?.sendInspectorState(INSPECTOR_ID);
//     API?.sendInspectorTree(INSPECTOR_ID);
//   }, 100);
// }, 100);
