import { each, resolveUrl, createScriptByBlob, insertScript } from './utils'
import { getComponentCode } from './main'
import { createProxy, assign, remove, isObject, isArray } from 'ts-fns'
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

function createReactive(obj, currentComponent) {
  const react = createProxy(obj, {
    get(keyPath, value) {
      const [root] = keyPath
      if (root === '$$typeof') {
        return REACTIVE_SYMBOL
      }
      if (root === '$$component') {
        return currentComponent
      }
      if (root === '$$type') {
        return 'object'
      }
      return value
    },
    dispatch() {
      scheduleUpdateComponent(currentComponent, react)
    },
  })
  return react
}

export function reactive(getter) {
  currentComponent.collector = []
  const defaultValue = getter()
  const collector = currentComponent.collector
  currentComponent.collector = []

  if (!isObject(defaultValue) && !isArray(defaultValue)) {
    const react = {
      $$typeof: REACTIVE_SYMBOL,
      $$component: currentComponent,
      $$type: 'primitive',
      value: defaultValue,
      getter,
      valueOf() {
        return react.value
      },
      [Symbol.toPrimitive](hint) {
        const value = react.value
        if (hint !== 'default') {
          return value
        }
        scheduleUpdateComponent(react.$$component, react)
        return value
      },
    }
    currentComponent.reactives.push(react)
    return react
  }

  const react = createReactive(defaultValue, currentComponent)
  currentComponent.reactives.push(react)
  return react
}

export function update(react, updator) {
  if (!react || typeof react !== 'object') {
    return updator()
  }

  if (react.$$typeof !== REACTIVE_SYMBOL) {
    return updator()
  }

  const { $$component } = react
  // 先删除原来的
  $$component.reactives.forEach((item, i) => {
    if (item === react) {
      $$component.reactives.splice(i, 1)
    }
  })

  // 创建一份新的
  const originComponent = currentComponent
  currentComponent = $$component
  const nextReact = reactive(updator)
  currentComponent = originComponent
  scheduleUpdateComponent($$component, nextReact)

  return react
}

export function consume(react) {
  if (!react || typeof react !== 'object') {
    return react
  }

  if (react.$$typeof !== REACTIVE_SYMBOL) {
    return react
  }

  const { $$component, $$type } = react
  $$component.collector.push(react)

  return $$type === 'primitive' ? react.value : react
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
    reactives: [],
    context: null,
    collector: [],
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
