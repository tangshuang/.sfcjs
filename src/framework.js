import { each, resolveUrl, createScriptByBlob, insertScript } from './utils'
import { getComponentCode } from './main'
import { createProxy, isObject, isArray, remove, assign, isUndefined, isShallowEqual } from 'ts-fns'
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
    const neure = render()
    // TODO 通过遍历构建DOM树

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

  collect(fn) {
    const { collector } = this
    const originCollector = new Set([...collector])
    collector.clear()

    const res = fn()

    const deps = [...collector]
    this.collector = originCollector
    return [res, deps]
  }

  h(type, ...fns) {
    let meta = {}
    let childrenGetter = null
    if (fns.length > 1) {
      [meta, childrenGetter] = fns
    }
    else if (fns.length === 1) {
      [childrenGetter] = fns
    }

    const {
      visible: visibleGetter,
      repeat: repeatGetter,
      key: keyGetter,
      attrs: attrsGetter,
      props: propsGetter,
      events: eventsGetter,
      keepAlive: keepAliveGetter,
    } = meta

    const [neures, deps] = this.collect(() => {
      const neures = []
      if (repeatGetter) {
        const { items, item: itemKey, index: indexKey } = repeatGetter()
        each(items, (item, index) => {
          const args = {
            [itemKey]: item,
            [indexKey]: index,
          }

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
          neure.args = args
          if (neures.length) {
            neures[neures.length - 1].sibling = neure
          }
          neures.push(neure)
        })
      }
      else {
        const key = keyGetter ? keyGetter() : null
        const visible = visibleGetter ? visibleGetter() : true
        const attrs = attrsGetter ? attrsGetter() : {}
        const props = propsGetter ? propsGetter() : {}
        const events = eventsGetter ? eventsGetter() : {}
        const keepAlive = keepAliveGetter ? keepAliveGetter() : false

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
        neures.push(neure)
      }
      return neures
    })

    const records = []
    each(deps, (dep) => {
      each(neures, (neure) => {
        records.push([dep, neure])
      })
    })
    each(records, (record) => {
      if (!this.schedule.some(item => isShallowEqual(item, record))) {
        this.schedule.push(record)
      }
    })
    console.log(this.schedule)

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

  }

  updateElement(el, meta) {}

  r(name, ...args) {}
}

async function initComponent(absUrl, meta = {}) {
  const mod = modules[absUrl]
  if (!mod) {
    throw new Error(`${absUrl} 组件尚未加载`)
  }

  const { deps, fn } = mod
  const { props, events } = meta
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
