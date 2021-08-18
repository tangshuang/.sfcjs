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
    this.elementRoot = null
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
    const element = await initComponent(absUrl)
    this.elementRoot = element
    element.mount(this.shadowRoot)
  }

  disconnectedCallback() {
    if (this.elementRoot) {
      this.elementRoot.unmount()
    }
  }
}

customElements.define('sfc-app', SFC_Element)


const REACTIVE_SYMBOL = Symbol('reactive')

class NeureNode {
  constructor({ key, type, data, dataGetter, childrenGetter, node, parent }) {
    this.key = key
    this.type = type
    this.data = data
    this.dataGetter = dataGetter
    this.childrenGetter = childrenGetter

    this.node = node // DOM 节点

    this.child = null // 第一个字节点
    this.sibling = null // 第一个兄弟节点
    this.return = parent // 父节点
  }
}

class Element {
  props = null
  context = null
  collector = new Set()
  mounted = false
  queue = []
  el = null
  schedule = []
  neure = null

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
      const { collector, mounted } = this

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

    const css = style()
    const node = render()
    each(css, (item) => {
      el.appendChild(item)
    })
    if (node) {
      el.appendChild(node)
    }

    this.el = el
    this.mounted = true
  }

  unmount() {
    this.mounted = false
    this.props = null
    this.context = null
    this.collector.clear()
    this.queue.length = 0
    this.schedule.length = 0
    this.el.innerHTML = ''
    this.el = null
  }

  h(type, ...fns) {
    let dataGetter = null
    let childrenGetter = null
    if (fns.length > 1) {
      [dataGetter, childrenGetter] = fns
    }
    else if (fns.length === 1) {
      [childrenGetter] = fns
    }

    const { collector } = this
    collector.clear()
    const data = dataGetter ? dataGetter() : {}
    const deps = [...collector]
    collector.clear()

    const { visible, repeat } = data
    if (repeat) {
      const { items, item: itemKey, index: indexKey, key } = repeat
      const sets = []
      each(items, (item, index) => {
        const trace = key ? item[key] : null
        const args = {
          [itemKey]: item,
          [indexKey]: index,
        }
        const subs = childrenGetter(args)

      })
    }

    const neureNode = new NeureNode({
      type,
      data,
      dataGetter,
      childrenGetter,
    })

    if (isUndefined(visible) || visible) {

    }


    const node = this.createElement(type, data)

    // // 放到父级节点下面
    // if (parent) {
    //   if (parent.child) {
    //     let child = parent.child
    //     while (child.sibling) {
    //       child = child.sibling
    //     }
    //     child.sibling = neureNode
    //   }
    //   else {
    //     parent.child = neureNode
    //   }
    // }

    const { visible, repeat, await: defer, keepAlive } = data



    // const update = () => {
    //   const { collector } = this
    //   collector.clear()
    //   const data = dataFn ? dataFn() : {}
    //   const collected = [...collector]
    //   collector.clear()

    //   const stayCollected = []
    //   this.schedule.forEach(([prevReact, prevUpdate], i) => {
    //     if (prevUpdate === update && !collected.includes(prevReact)) {
    //       this.schedule.splice(i, 1)
    //     }
    //     else if (prevUpdate === update) {
    //       stayCollected.push(prevReact)
    //     }
    //   })

    //   const nextCollected = collected.filter(item => !stayCollected.includes(item))
    //   this.schedule.push(...nextCollected.map(item => [item, update]))

    //   this.updateElement(el, data)
    // }

    // each(collected, (react) => {
    //   this.schedule.push([react, update])
    // })

    if (!childrenFn) {
      return el
    }


    const { items, item, index } = repeat || {}
    const { await: promise, data: then } = defer || {}



    return fragment
  }

  createElement(type, data) {

  }

  updateElement(el, data) {}

  r(name, ...args) {}
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

  const element = new Element()
  const context = await Promise.resolve(fn.call(element, ...vars))
  element.context = context

  const { onInit } = context
  if (onInit) {
    onInit()
  }

  return element
}
