import { setupDevtoolsPlugin, DevtoolsPluginApi } from '@vue/devtools-api'

export function setupDevtools(app: any): void {
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
    console.log('hi')
    if (payload.inspectorId === SUBSCRIPTIONS_INSPECTOR_ID) {
      payload.rootNodes = [
        {
          id: 'root',
          label: 'Awesome root',
          children: [
            {
              id: 'child-1',
              label: 'Child 1',
              tags: [
                {
                  label: 'awesome',
                  textColor: 0xffffff,
                  backgroundColor: 0x000000,
                },
              ],
            },
            {
              id: 'child-2',
              label: 'Child 2',
            },
          ],
        },
        {
          id: 'root2',
          label: 'Amazing root',
        },
      ]
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
