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
    // console.log(code)
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
const PROP_SYMBOL = Symbol('prop')
const TEXT_NODE = Symbol('TextNode')
const FRAGMENT_NODE = Symbol('Fragment')
const SCHEDULE_TYPE = {
  REACT: 'react',
  RENDER: 'render',
  DYE: 'dye',
}

class Neure {
  constructor({
    type,
    meta,
    children,

    args,

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

    this.args = args // 记录meta内函数的参数

    // 固定信息
    this.type = type
    this.meta = meta
    this.children = children // 内部元素的获取函数

    this.node = node // DOM 节点

    this.child = null // 第一个字节点
    this.sibling = null // 第一个兄弟节点
    this.parent = parent // 父节点
  }

  set(data) {
    Object.assign(this, data)
  }

  mount(target) {
    const { node, child, visible } = this

    if (!target) {
      this.next()
      return
    }

    if (!node) {
      this.next()
      return
    }

    if (!visible) {
      this.next()
      return
    }

    let el = node
    let root = target

    if (isInstanceOf(node, Element)) {
      const fragment = document.createDocumentFragment()
      node.mount(fragment)
      el = fragment.children[0] // 要求组件内必须为一个顶级有效标签
    }

    if (isInstanceOf(target, Element)) {
      root = target.root
    }

    root.appendChild(el)

    if (child) {
      child.mount(node)
    }
    else {
      this.next()
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

class NeureFragment extends Neure {
  setList(getter) {
    const neures = getter()
    each(neures, (neure) => {
      neure.parent = this
    })

    this.getter = getter
    this.child = neures[0] || null
    this.list = neures
    this.determine = null // 函数，用于决定是否需要更新
  }

  mount(target) {
    const { list } = this
    each(list, (item) => {
      item.mount(target)
    })
    this.next()
  }
}

class Element {
  props = null // 外部传入的props
  context = null // 内部返回的结果

  collector = new Set()
  mounted = false
  root = null // 挂载到哪个DOM节点上

  queue = []
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

  collect(fn) {
    const { collector } = this
    const originCollector = new Set([...collector])
    collector.clear()

    const res = fn()

    const deps = [...collector]
    this.collector = originCollector
    return [res, deps]
  }

  reactive(init, getter, setter) {
    const [value, deps] = this.collect(() => init())
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

    if (deps.length) {
      each(deps, (dep) => {
        this.schedule.push([SCHEDULE_TYPE.REACT, dep, react])
      })
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
          this.queue.push(item)
          this.queueUpdate()
        }
      })

      collector.clear()
      this._scheduleUpdating = false
    })
    this._scheduleUpdating = true
  }

  queueUpdate() {
    const { context, queue } = this

    if (!queue.length) {
      return
    }

    const { onUpdate } = context
    if (onUpdate) {
      onUpdate()
    }
  }

  mount(el) {
    const { context } = this
    const { render, style } = context

    const css = style()

    const neure = render()
    neure.mount(el)

    this.root = el
    this.mounted = true

    const { onMount } = context
    if (onMount) {
      onMount()
    }
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


  h(type, meta, childrenGetter) {
    if (typeof meta === 'function') {
      childrenGetter = meta
      meta = {}
    }


    const deps = []

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

      const node = createNode(type, { attrs, props, events })
      const neure = new Neure({
        type,
        meta,
        children: childrenGetter,

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

    const createNeure = (meta, args) => {
      const {
        repeat: repeatGetter,
      } = meta
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

            const { repeat, ...others } = meta
            const neure = createNeure(others, args)
            if (neures.length) {
              neures[neures.length - 1].sibling = neure
            }
            neures.push(neure)
          })
          return neures
        }
        const neureList = new NeureFragment({
          type: FRAGMENT_NODE,
          meta,
          children: childrenGetter,

          visible: true,
          args,
        })
        neureList.setList(getter)
        return neureList
      }
      else {
        return createNeureNode(meta, args)
      }
    }

    const [neure, neureDeps] = this.collect(() => createNeure(meta))
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

    const genChildren = (neure) => {
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
      else if (isInstanceOf(sub, Neure)) {
        setNeureNode(sub, neure)
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
    }

    if (isInstanceOf(neure, NeureFragment)) {
      each(neure.list, genChildren)
    }
    else {
      genChildren(neure)
    }

    const records = []
    each(deps, (dep) => {
      records.push([SCHEDULE_TYPE.RENDER, dep, neure])
    })
    each(records, (record) => {
      if (!this.schedule.some(item => isShallowEqual(item, record))) {
        this.schedule.push(record)
      }
    })

    return neure
  }





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
    await loadDepComponents(deps)

    const { props = {}, events = {} } = meta
    element.props = props
    const scope = {
      ...modules,
      props: new Proxy({
        get(_, key) {
          const value = element.props[key]
          element.collector.add({ $$typeof: PROP_SYMBOL, getter: () => element.props[key], value })
          return value
        },
      }),
      emit: (event, ...args) => {
        const callback = events[event]
        if (!callback) {
          return
        }

        return callback(...args)
      },
    }
    const vars = deps.map(dep => scope[dep])

    const inside = Object.freeze({
      h: element.h.bind(element),
      r: element.r.bind(element),
      reactive: element.reactive.bind(element),
      consume: element.consume.bind(element),
    })

    const context = await Promise.resolve(fn.call(inside, ...vars))
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

function createNode(type, meta) {
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

function updateElement(element, meta = {}) {}