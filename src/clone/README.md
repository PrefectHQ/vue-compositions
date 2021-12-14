# Clone
The `clone` composition 

## Example
```typescript
import { clone } from '@prefecthq/vue-compositions'

const source = reactive({ hello: 'world' })
const copy = clone(source)
```

## How it works
`clone` creates an exact copy of the source passed in. It retains prototypes and classes while breaking object references. It also retains the reactive proxy for an object if one is present. For example a source of `reactive({ user: new User() })` would retain both the reactive proxy as well as the `User` instance. But it would return a completely new instance of both. 

## Known limitations
Vue.js currently does not provide an `isShallow` method or expose a marker to allow checking if a reactive object is shallow. There's an open github issue for this [3044](https://github.com/vuejs/vue-next/issues/3044).

To account for this `clone` accepts an optional options argument where you can specify that shallow reactive proxies should be used. 

```javascript
const copy = clone(source, { shallow: true })
```