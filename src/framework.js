import { each, resolveUrl, createScriptByBlob, insertScript } from './utils'
import { getComponentCode } from './main'
import { createProxy, assign, remove } from 'ts-fns'
import produce from 'immer'

export const modules = {}

export function define(absUrl, deps, fn) {
  if (modules[absUrl]) {
    return
  }

  const mod = modules[absUrl] = {
    url: absUrl,
    deps,
    fn,
  }

  const depComponents = deps.filter(item => item[0] === '.')
  if (!depComponents.length) {
    return
  }
  each(depComponents, (dep) => {
    const url = resolveUrl(absUrl, dep)
    // 必须转化为绝对路径才能从modules上读取
    mod.deps.forEach((item, i) => {
      if (item === dep) {
        mod.deps[i] = url
      }
    })
  })
}

async function loadDepComponents(deps) {
  const components = deps.filter(item => /^[a-z]+?:\/\//.test(item))
  if (!components.length) {
    return
  }
  await Promise.all(components.map((url) => {
    return getComponentCode(url).then((code) => {
      const script = createScriptByBlob(code)
      script.setAttribute('sfc-src', url)
      return insertScript(script)
    })
  }))
}

class SFC_Element extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  async connectedCallback() {
    const src = this.getAttribute('src')
    const baseUrl = window.location.href
    const url = resolveUrl(baseUrl, src)
    const code = await getComponentCode(url)
    const script = createScriptByBlob(code)
    script.setAttribute('sfc-src', url)
    this.absUrl = url
    await insertScript(script)
    this.setup()
  }

  async setup() {
    const { absUrl } = this
    initComponent(absUrl)
  }
}

customElements.define('sfc-app', SFC_Element)

let currentComponent = null
const REACTIVE_SYMBOL = Symbol('reactive')

function createReactiveValue(reactive, reactiveValue) {
  const value = createProxy(reactiveValue, {
    receive(...args) {
      if (args.length === 2) {
        const [keyPath, value] = args
        const prev = reactive.value
        const next = produce(prev, obj => {
          assign(obj, keyPath, value)
        })
        reactive.value = createReactiveValue(reactive, next)
        scheduleUpdateComponent(reactive.component, reactive, prev)
      }
      else {
        const [keyPath] = args
        const prev = reactive.value
        const next = produce(prev, obj => {
          remove(obj, keyPath)
        })
        reactive.value = createReactiveValue(reactive, next)
        scheduleUpdateComponent(reactive.component, reactive, prev)
      }
    },
    writable() {
      return false
    },
  })
  return value
}
export function reactive(getter) {
  const react = {
    $$typeof: REACTIVE_SYMBOL,
    component: currentComponent,
    value: null,
    getter,
    valueOf() {
      return react.value
    },
    [Symbol.toPrimitive](hint) {
      const prev = react.value
      if (hint !== 'default') {
        return prev
      }
      scheduleUpdateComponent(react.component, react, prev)
      return prev
    },
  }

  const defaultValue = getter()
  const value = createReactiveValue(react, defaultValue)
  react.value = value

  currentComponent.reactives.push(react)
  return react
}

export function update(reactive, update) {
  if (!reactive || typeof reactive !== 'object') {
    return update()
  }

  if (reactive.$$typeof !== REACTIVE_SYMBOL) {
    return update()
  }

  const next = update()
  const prev = reactive.value
  reactive.value = createReactiveValue(reactive, next)
  scheduleUpdateComponent(reactive.component, reactive, prev)
  return reactive
}

function initComponent(absUrl, data) {
  const mod = modules[absUrl]
  if (!mod) {
    throw new Error(`${absUrl} 组件尚未加载`)
  }

  const { deps, fn } = mod
  const { props, events } = data
  await loadDepComponents(deps)
  const scope = {
    ...modules,
    props,
    emit: (event, ...args) => {
      const callback = events[event]
      if (!callback) {
        return
      }

      return callback(...args)
    },
  }
  const vars = deps.map(dep => scope[dep])

  currentComponent = {
    props,
    reactives: [],
  }
  const context = await Promise.resolve(fn(...vars))
  currentComponent.context = context
  const { onInit } = context

  if (onInit) {
    onInit()
  }

  return context
}

function mountComponent() {}

function updateComponent() {}

function unmountComponent() {}

function scheduleUpdateComponent(component, reactive, prev) {}
