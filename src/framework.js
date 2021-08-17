import { each, resolveUrl, createScriptByBlob, insertScript } from './utils'
import { getComponentCode } from './main'
import { createProxy, isObject, isArray, remove, assign } from 'ts-fns'
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
    console.log(code)
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

export function reactive(init, getter, setter) {
  const value = init()
  const immut = createProxy(value, {
    writable() {
      return false
    },
    receive(...args) {
      if (args.length === 1) {
        const [keyPath] = args
        const next = produce(value, (value) => {
          remove(value, keyPath)
        })
        const newReact = reactive(
          () => next,
          getter,
          setter,
        )
        setter(newReact)
      }
      else {
        const [keyPath, nextValue] = args
        const next = produce(value, (value) => {
          assign(value, keyPath, nextValue)
        })
        const newReact = reactive(
          () => next,
          getter,
          setter,
        )
        setter(newReact)
      }
    },
  })
  var react = {
    $$typeof: REACTIVE_SYMBOL,
    $$component: currentComponent,
    value: immut,
    getter,
    setter,
  }
  return react
}

export function consume(react) {
  if (!react || typeof react !== 'object') {
    return react
  }

  if (react.$$typeof !== REACTIVE_SYMBOL) {
    return react
  }

  const { $$component, value } = react
  $$component.collector.add(react)
  scheduleUpdateComponent($$component).then(() => {
    $$component.collector.clear()
  })
  return value
}

async function initComponent(absUrl, data = {}) {
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
    context: null,
    collector: new Set(),
    inited: false,
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

function scheduleUpdateComponent(component) {
  return Promise.resolve().then(() => {
    const { collector, context, inited } = component

    if (!inited) {
      component.inited = true
      return
    }

    if (!collector.size) {
      return
    }

    const items = [...collector]
    each(items, (item) => {
      const { getter } = item
      const newValue = getter()
      if (item !== newValue) {
        queueUpdateComponent(component, item)
      }
    })

    const { onUpdate } = context
    if (onUpdate) {
      onUpdate()
    }
  })
}

function queueUpdateComponent(component, reactive) {}
