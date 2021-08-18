import { each, resolveUrl, createScriptByBlob, insertScript } from './utils'
import { getComponentCode } from './main'
import { createProxy, isObject, isArray, remove, assign, isUndefined } from 'ts-fns'
import produce from 'immer'

const modules = {}

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
    this.componentRoot = null
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
    const component = await initComponent(absUrl)
    this.componentRoot = component
    component.mount(this.shadowRoot)
  }

  disconnectedCallback() {
    if (this.componentRoot) {
      this.componentRoot.unmount()
    }
  }
}

customElements.define('sfc-app', SFC_Element)


const REACTIVE_SYMBOL = Symbol('reactive')
class Component {
  props = null
  context = null
  collector = new Set()
  mounted = false
  queue = []
  el = null

  reactive(init, getter, setter) {
    const value = init()
    const immut = createProxy(value, {
      writable: () => false,
      receive: (...args) => {
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
          const newReact = this.reactive(
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
      value: immut,
      getter,
      setter,
    }

    return react
  }

  consume(react) {
    if (!react || typeof react !== 'object') {
      return react
    }

    if (react.$$typeof !== REACTIVE_SYMBOL) {
      return react
    }

    this.collector.add(react)
    this.scheduleUpdate().then(() => {
      this.collector.clear()
    })

    const { value } = react
    return value
  }

  scheduleUpdate() {
    return Promise.resolve().then(() => {
      const { collector, context, mounted } = this

      if (!mounted) {
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
          this.queueUpdate(item)
        }
      })
    })
  }

  queueUpdate(react) {
    const { context, queue } = this
    const { onUpdate } = context
    if (onUpdate) {
      onUpdate()
    }
  }

  mount(el) {
    const { context } = this
    const { render, style } = context

    const vnode = render()

    this.el = el
    this.mounted = true
  }

  unmount() {
    this.el = null
  }

  h = (type, ...fns) => {
    let dataFn = null
    let childrenFn = null
    if (fns.length > 1) {
      [dataFn, childrenFn] = fns
    }
    else if (fns.length === 1) {
      [childrenFn] = fns
    }

    const { visible, props, attrs, events, repeat, await: defer } = dataFn ? dataFn() : {}
    const { collector } = this
    const collected = [...collector]

    if (!isUndefined(visible) && !visible) {
      return null
    }

    const el = this.createElement(type, { props, attrs, events })
    if (!childrenFn) {
      return el
    }


    const { items, item, index } = repeat || {}
    const { await: promise, data } = defer || {}




  }

  createElement(type, { props, attrs, events }) {

  }

  r = (name, ...args) => {}
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

  const component = new Component()
  const context = await Promise.resolve(fn.call(component, ...vars))
  component.context = context

  const { onInit } = context
  if (onInit) {
    onInit()
  }

  return component
}
