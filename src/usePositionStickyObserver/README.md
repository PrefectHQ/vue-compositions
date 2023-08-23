# usePositionStickyObserver

This composition is abstracts away the logic necessary to determine if a `position: sticky;` element has gone into it's "stuck" mode. This is useful when you want to style the element differently when it's stuck, like if you want to add a background color.

## Example

```typescript
const stickyHeader = ref<HTMLElement>()
const { stuck } = usePositionStickyObserver(stickyHeader)

const classes = computed(() ({
  header: {
    'header--stuck': stuck.value,
  }
}))
```

## Arguments

| Name    | Type                                           |
| ------- | ---------------------------------------------- |
| element | `HTMLElement \| Ref<HTMLElement \| undefined>` |
| options | '{}'                                           |

### Options

| Name            | Type                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------ |
| rootMargin      | `string`, [MDN DOcs](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/rootMargin) |
| boundingElement | `HTMLElement \| Ref<HTMLElement \| undefined>`. The scroll container, defaults to the body.            |

## Returns

`UsePositionStickyObserverResponse`
