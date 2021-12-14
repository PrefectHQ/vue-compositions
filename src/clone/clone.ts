import { getCurrentInstance, isReactive, isRef, onUnmounted, reactive, shallowReactive, watch } from "vue";

function cloner<T>(source: T, options: { shallow: boolean } = { shallow: false}): T {
    if(source === null || typeof source !== 'object') {
        return source
    }
    
    let temp = new (source as any).constructor()
    
    for(let key in source) {
        temp[key] = cloner(source[key])
    }
    
    if(isReactive(source)) {
        return options.shallow ? shallowReactive(temp) : reactive(temp)
    }
    
    return temp;
}

function isUnknownObject(value: unknown): value is object {
    return typeof value === 'object'
}

export function clone<T>(source: T, options: { shallow: boolean } = { shallow: false}): T {
    const copy = cloner(source, options)
    let unwatch: ReturnType<typeof watch>
    
    if(isUnknownObject(source) && (isRef(source) || isReactive(source))) {
        unwatch = watch(source, () => {
            Object.assign(copy, cloner(source, options))
        }, { deep: true })
    }
        
    if(getCurrentInstance()) {
        onUnmounted(() => {
            if(unwatch) {
                unwatch()
            }
        })
    }

    return copy
}