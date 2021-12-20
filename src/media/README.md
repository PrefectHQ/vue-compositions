# Subscribe
The `media` composition is a reactive wrapper around [window.matchMedia](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia) which can be used to react to changes to the document's [type and media](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Using_media_queries#syntax) features. 

## Example
```typescript
import { media } from '@prefecthq/vue-compositions'

const breakpoint = media('(min-width: 1440px)')
```

## Arguments
| Name  | Type                    |
|-------|-------------------------|
| query | `string \| Ref<string>` |

## Returns
`Ref<boolean>`