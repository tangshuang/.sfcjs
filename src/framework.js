import { each, resolveUrl, createScriptByBlob, insertScript } from './utils'
import { getComponentCode } from './main'
import { createProxy, isObject, isArray, remove, assign, isUndefined, isShallowEqual, isString, isInstanceOf, decideby } from 'ts-fns'
import produce from 'immer'

const modules = {}

class Component {
  constructor({ url, deps, fn }) {
    this.url = url
    this.deps = deps
    this.fn = fn
  }
}

export function define(absUrl, deps, fn) {
  if (modules[absUrl]) {
    return
  }

  const mod = modules[absUrl] = new Component({
    url: absUrl,
    deps,
    fn,
  })

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

class SFC_Element extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.rootElement = null
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
    const element = initComponent(absUrl)
    this.rootElement = element
    await element.$ready()
    element.mount(this.shadowRoot)
  }

  disconnectedCallback() {
    if (this.rootElement) {
      this.rootElement.unmount()
    }
  }
}

customElements.define('sfc-app', SFC_Element)


const REACTIVE_SYMBOL = Symbol('reactive')
const TEXT_NODE = Symbol('TextNode')

class Neure {
  constructor({
    type,
    meta,
    childrenGetter,

    node,
    parent,

    key,
    visible,
    keepAlive,
    attrs,
    props,
    events,
  }) {
    // 实时信息，当前状态，用于下一次渲染
    this.key = key
    this.visible = visible
    this.keepAlive = keepAlive
    this.attrs = attrs
    this.props = props
    this.events = events

    this.args = null // 记录meta内函数的参数

    // 固定信息
    this.type = type
    this.meta = meta
    this.childrenGetter = childrenGetter

    this.node = node // DOM 节点

    this.child = null // 第一个字节点
    this.sibling = null // 第一个兄弟节点
    this.parent = parent // 父节点
  }

  mount(target) {
    const { node, child, visible, parent, sibling } = this

    if (!visible) {
      if (sibling) {
        this.next()
      }
      else {
        parent?.next()
      }
      return
    }

    if (isInstanceOf(node, Element)) {
      return
    }

    else if (isInstanceOf(target, Element)) {
      return
    }

    target.appendChild(node)
    if (child) {
      child.mount(node)
    }
    else if (sibling) {
      this.next()
    }
    else {
      parent?.next()
    }
  }

  next() {
    const { sibling, parent } = this
    if (sibling) {
      sibling.mount(parent.node)
    }
    else {
      parent?.next()
    }
  }
}

class NeureList extends Array {
  constructor(items, data) {
    super(items)

    const {
      parent,
      getter,
    } = data

    this.getter = getter // 获取items的函数
    this.sibling = null // 第一个兄弟节点
    this.parent = parent // 父节点
  }
}

class Element {
  props = null
  context = null
  collector = new Set()
  mounted = false
  queue = []
  root = null
  schedule = []

  constructor() {
    this._ready = new Promise((resolve) => {
      this.__ready = resolve
    })
  }

  $ready(resolved) {
    if (resolved) {
      this.__ready()
    }
    return this._ready
  }

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
    this.scheduleUpdate()

    const { value } = react
    return value
  }

  scheduleUpdate() {
    if (this._scheduleUpdating) {
      return
    }
    requestAnimationFrame(() => {
      const { collector, mounted } = this

      if (!mounted) {
        collector.clear()
        return
      }

      if (!collector.size) {
        collector.clear()
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

      collector.clear()
      this._scheduleUpdating = false
    })
    this._scheduleUpdating = true
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
    const neures = render()

    const fragment = document.createDocumentFragment()
    each(neures, (neure) => {
      neure.mount(fragment)
    })

    console.log(neures, fragment)

    this.root = el
    this.mounted = true
  }

  unmount() {
    this.mounted = false
    this.props = null
    this.context = null
    this.collector.clear()
    this.queue.length = 0
    this.schedule.length = 0
    this.root.innerHTML = ''
    this.root = null
  }

  collect(fn) {
    const { collector } = this
    const originCollector = new Set([...collector])
    collector.clear()

    const res = fn()

    const deps = [...collector]
    this.collector = originCollector
    return [res, deps]
  }

  h(type, meta, childrenGetter) {
    if (typeof meta === 'function') {
      childrenGetter = meta
      meta = {}
    }

    const {
      repeat: repeatGetter,
    } = meta

    const createNeureNode = (meta, args) => {
      const {
        visible: visibleGetter,
        key: keyGetter,
        attrs: attrsGetter,
        props: propsGetter,
        events: eventsGetter,
        keepAlive: keepAliveGetter,
      } = meta

      const key = keyGetter ? keyGetter(args) : null
      const visible = visibleGetter ? visibleGetter(args) : true
      const attrs = attrsGetter ? attrsGetter(args) : {}
      const props = propsGetter ? propsGetter(args) : {}
      const events = eventsGetter ? eventsGetter(args) : {}
      const keepAlive = keepAliveGetter ? keepAliveGetter(args) : false

      const node = this.createElement(type, { attrs, props, events })
      const neure = new Neure({
        type,
        meta,
        childrenGetter,

        node,

        key,
        visible,
        keepAlive,
        attrs,
        props,
        events,
      })

      if (args) {
        neure.args = args
      }

      return neure
    }

    const deps = []
    const [neure, neureDeps] = this.collect(() => {
      if (repeatGetter) {
        const getter = () => {
          const neures = []
          const [{ items, item: itemKey, index: indexKey }, repeatDeps] = this.collect(() => repeatGetter())
          deps.push(...repeatDeps)
          each(items, (item, index) => {
            const args = {
              [itemKey]: item,
              [indexKey]: index,
            }

            const neure = createNeureNode(meta, args)
            if (neures.length) {
              neures[neures.length - 1].sibling = neure
            }
            neures.push(neure)
          })
          return neures
        }
        const neures = getter()
        const neureList = new NeureList(neures, { getter })
        each(neures, (neure) => {
          neure.parent = neureList
        })
        neureList.child = neures[0] || null
        return neureList
      }
      else {
        return createNeureNode(meta)
      }
    })
    deps.push(...neureDeps)

    let current = null
    const setTextNode = (text, parent) => {
      const node = new Neure({
        type: TEXT_NODE,
        node: document.createTextNode(text),
        parent,
        visible: true,
      })
      if (current) {
        current.sibling = node
      }
      if (!parent.child) {
        parent.child = node
      }
      current = node
    }
    const setNeureNode = (node, parent) => {
      node.parent = parent
      if (current) {
        current.sibling = node
      }
      if (!parent.child) {
        parent.child = node
      }
      current = node
    }

    const neures = isInstanceOf(neure, NeureList) ? neure : [neure]
    each(neures, (neure) => {
      const { visible, childrenGetter, args } = neure
      if (!visible) {
        return
      }

      if (!childrenGetter) {
        return
      }

      const [sub, childrenDeps] = this.collect(() => childrenGetter(args))
      deps.push(...childrenDeps)
      if (isString(sub)) {
        setTextNode(sub, neure)
      }
      else if (isArray(sub) && sub.every(item => isArray(item))) {
        each(sub, (items) => {
          each(items, (item) => {
            if (isInstanceOf(item, Neure)) {
              setNeureNode(item, neure)
            }
            else if (isString(item)) {
              setTextNode(item, neure)
            }
          })
        })
      }
      else if (isArray(sub)) {
        each(sub, (item) => {
          if (isInstanceOf(item, Neure)) {
            setNeureNode(item, neure)
          }
          else if (isString(item)) {
            setTextNode(item, neure)
          }
        })
      }
    })

    const records = []
    each(deps, (dep) => {
      records.push([dep, neure])
    })
    each(records, (record) => {
      if (!this.schedule.some(item => isShallowEqual(item, record))) {
        this.schedule.push(record)
      }
    })

    // // 放到父级节点下面
    // if (parent) {
    //   if (parent.child) {
    //     let child = parent.child
    //     while (child.sibling) {
    //       child = child.sibling
    //     }
    //     child.sibling = neure
    //   }
    //   else {
    //     parent.child = neure
    //   }
    // }



    // const update = () => {
    //   const { collector } = this
    //   collector.clear()
    //   const meta = metaFn ? metaFn() : {}
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

    //   this.updateElement(el, meta)
    // }

    // each(collected, (react) => {
    //   this.schedule.push([react, update])
    // })

    // if (!childrenFn) {
    //   return el
    // }


    // const { items, item, index } = repeat || {}
    // const { await: promise, meta: then } = defer || {}



    // return fragment

    return neures
  }

  createElement(type, meta) {
    const { props, attrs, events } = meta
    if (isInstanceOf(type, Component)) {
      const element = initComponent(type, { props, events })
      return element
    }

    const node = document.createElement(type)
    each(attrs, (value, key) => {
      node.setAttribute(key, value)
    })
    each(events, (fn, key) => {
      node.addEventListener(key, fn)
    })
    return node
  }

  updateElement(el, meta) {}

  r(name, ...args) {}
}

function initComponent(absUrl, meta = {}) {
  const element = new Element()

  ;(async function() {
    const component = isInstanceOf(absUrl, Component) ? absUrl : modules[absUrl]

    if (!component) {
      throw new Error(`${absUrl} 组件尚未加载`)
    }

    const { deps, fn } = component
    const { props = {}, events = {} } = meta
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

    const context = await Promise.resolve(fn.call(element, ...vars))
    element.context = context

    const { onInit } = context
    if (onInit) {
      onInit()
    }

    element.$ready(true)
  } ());

  return element
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
