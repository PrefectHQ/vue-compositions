import {
  type App,
  setupDevtoolsPlugin,
  type DevtoolsPluginApi,
  type CustomInspectorNode,
  type CustomInspectorState,
  type InspectorNodeTag
} from '@vue/devtools-api'
import { useSubscriptionDevtoolsInspector } from './useSubscription/devtools'
import { nextTick } from 'vue'

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

function setupSubscriptionsInspector(api: DevtoolsPluginApi<Record<string, unknown>>): void {
  useSubscriptionDevtoolsInspector.setupDevtools(api)
}
