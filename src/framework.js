import { each, resolveUrl, createScriptByBlob, insertScript } from './utils'
import { getComponentCode } from './main'
import { createProxy, isObject, isArray, remove, assign, isUndefined, isShallowEqual, isString, isInstanceOf, decideby, uniqueArray } from 'ts-fns'
import produce from 'immer'

const components = {}

class Component {
  constructor({ url, deps, fn }) {
    this.url = url
    this.deps = deps
    this.fn = fn
  }
}

export function define(absUrl, deps, fn) {
  if (components[absUrl]) {
    return
  }

  const component = components[absUrl] = new Component({
    url: absUrl,
    deps,
    fn,
  })

  const depComponents = deps.filter(item => item[0] === '.')

  if (!depComponents.length) {
    return component
  }

  each(depComponents, (dep) => {
    const url = resolveUrl(absUrl, dep)
    // 必须转化为绝对路径才能从component上读取
    each(component.deps, (item, i) => {
      if (item === dep) {
        component.deps[i] = url
      }
    })
  })
  return component
}

// ---------------------------------------------

// 数据类型
const REACTIVE_SYMBOL = Symbol('reactive')
const PROP_SYMBOL = Symbol('prop')
// 节点类型
const TEXT_NODE = Symbol('TextNode')
const FRAGMENT_NODE = Symbol('Fragment')
// 计划类型
const SCHEDULE_TYPE = {
  VAR: 'var',
  RENDER: 'render',
  DYE: 'dye',
}
// 更新类型
const UPDATE_TYPE = {
  META: 'meta',
  FRAGMENT: 'fragment',
  CHILDREN: 'children',
}

class Neure {
  // 固定信息
  type = null
  meta = null
  children = null // 内部元素的获取函数
  // 实时信息，当前状态，用于下一次渲染
  key = null
  visible = true
  keepAlive = null
  attrs = null
  props = null
  events = null
  // 记录内函数的参数
  args = null
  // DOM 节点
  node = null
  parentNode = null
  // 链表关系
  child = null // 第一个字节点
  sibling = null // 第一个兄弟节点
  parent = null // 父节点
  // 记录依赖
  // 依赖分为两种，一种是meta的依赖，一种是children的依赖，两种依赖发生变化时，要更新的地方不同
  deps = {
    meta: null,
    children: null,
    fragment: null,
  }

  constructor(data = {}) {
    this.set(data)
  }

  set(data) {
    Object.assign(this, data)
  }
}

class NeureFragment extends Neure {
  contents = null // fragment内部的内容
  getter = null // 用于获取contents的函数

  visible = true

  setContents(getter) {
    const neures = getter ? getter() : this.getter()
    each(neures, (neure) => {
      neure.parent = this
    })

    this.getter = getter
    this.child = neures[0] || null
    this.contents = neures
  }

  // async mount(target) {
  //   const { contents } = this
  //   await Promise.all(contents.map(item => item.mount(target)))
  //   await this.next()
  // }
}

// ---------------------------------------------

class Element {
  props = null // 外部传入的props
  context = null // 内部返回的结果

  collector = new Set()
  root = null // 被挂载到的DOM节点

  // 用于渲染的素材
  slot = null
  neure = null // 最顶级的Neure实例
  brushes = null // 样式记录

  schedule = new Set()
  queue = new Set()

  relations = []

  _isCollecting = false
  _scheduleUpdating = false
  _isMounted = false

  constructor(props) {
    this._ready = new Promise((resolve) => {
      this.__ready = resolve
    })
    this.props = Object.freeze(props)
  }

  $ready(resolved) {
    if (resolved) {
      this.__ready()
    }
    return this._ready
  }

  reactive(compute) {
    const [value, deps] = this.collect(() => compute())
    const create = (value) => createProxy(value, {
      writable: () => false,
      receive: (...args) => {
        if (args.length === 1) {
          const [keyPath] = args
          const next = produce(value, (value) => {
            remove(value, keyPath)
          })
          const value = create(next)
          this.update(reactor, () => value)
        }
        else {
          const [keyPath, nextValue] = args
          const next = produce(value, (value) => {
            assign(value, keyPath, nextValue)
          })
          const value = create(next)
          this.update(reactor, () => value)
        }
      },
    })

    var reactor = {
      $$typeof: REACTIVE_SYMBOL,
      value: create(value),
      compute,
    }

    if (deps.length) {
      this.relations.push({
        type: SCHEDULE_TYPE.VAR,
        deps,
        var: reactor,
      })
    }

    return reactor
  }

  consume(reactor) {
    if (!reactor || typeof reactor !== 'object') {
      return reactor
    }

    if (reactor.$$typeof !== REACTIVE_SYMBOL) {
      return reactor
    }

    if (this._isCollecting) {
      this.collector.add(reactor)
    }

    // if (this._isMounted) {
    //   this.schedule.add(reactor)
    //   this.scheduleUpdate()
    // }

    const { value } = reactor
    return value
  }

  collect(fn) {
    const { collector } = this
    const originCollector = new Set([...collector])
    this.collector.clear()
    this._isCollecting = true
    const res = fn()
    this._isCollecting = false
    const deps = [...collector]
    this.collector = originCollector
    return [res, deps]
  }

  update(reactor, compute) {
    if (!reactor || typeof reactor !== 'object') {
      return compute()
    }

    if (reactor.$$typeof !== REACTIVE_SYMBOL) {
      return compute()
    }

    const [value, deps] = this.collect(() => compute())
    reactor.value = value
    reactor.compute = compute

    this.relations.find((item) => {
      if (item.type === SCHEDULE_TYPE.VAR && item.var === reactor) {
        // 自引用，比如自加操作等。这时将原始的依赖进行展开。同时可能有新的依赖
        if (deps.includes(reactor)) {
          deps.splice(deps.indexOf(reactor), 1, ...item.deps)
        }
        item.deps = uniqueDeps(deps)
        return true
      }
    })

    this.queue.add(reactor)
    this.queueUpdate()

    return reactor
  }

  // scheduleUpdate() {

  // }

  queueUpdate() {
    if (this._scheduleUpdating) {
      return
    }
    this._scheduleUpdating = true
    requestAnimationFrame(() => {
      const { context, queue } = this

      if (!queue.size) {
        return
      }


      /**
       * 第一步处理变量
       */

      const scheduleVars = []
      const scheduleRender = []
      const scheduleDye = []
      this.relations.forEach((item) => {
        if (item.type === SCHEDULE_TYPE.VAR) {
          scheduleVars.push(item)
        }
        else if (item.type === SCHEDULE_TYPE.RENDER) {
          scheduleRender.push(item)
        }
        else if (item.type === SCHEDULE_TYPE.DYE) {
          scheduleDye.push(item)
        }
      })

      // 计算依赖关系计算顺序 https://blog.csdn.net/cn_gaowei/article/details/7641649x
      const deps = [] // 被依赖的
      const depBys = [] // 依赖了别的的
      const all = new Set() // 所有的
      const graph = [] // 按特定顺序的
      // const relation = new Map() // 记录一个对象被哪些对象依赖了

      scheduleVars.forEach((item) => {
        item.deps.forEach((dep) => {
          deps.push(dep)
          depBys.push(item)
          all.add(dep)
        })
        all.add(item)
      })

      // 找出只被依赖，不需要依赖别人的
      do {
        // 它们需要被最先处理
        const onlyDeps = [...new Set([...all].filter(item => !depBys.includes(item)))]
        graph.push(onlyDeps)
        for (let i = deps.length - 1; i >= 0; i --) {
          const dep = deps[i]
          if (onlyDeps.includes(dep)) {
            // // 反过来记录被依赖关系
            // const depOf = relation.get(dep) || []
            // depOf.push(depBys[i])
            // relation.set(dep, depOf)

            // 把被加入到带处理组的删除
            deps.splice(i, 1)
            depBys.splice(i, 1)
          }
        }
      } while (deps.length)

      // 找出哪些没有被加入队列的，这些就是最后需要处理的，它们可能依赖前已经变动过的，但是，也可能不需要处理
      const needs = [...new Set([...all].filter(item => !graph.some(items => items.includes(item))))]
      graph.push(needs)

      // 根据依赖关系，计算全部变量
      let changed = [...queue]
      graph.forEach((items) => {
        each(items, (item) => {
          if (!item.deps) {
            return
          }
          // 重新计算，并将该项放到changed中提供给下一个组做判断
          if (item.deps.some(dep => inDeps(dep, changed))) {
            const reactor = item.var
            const { compute } = reactor
            const [value, deps] = this.collect(() => compute())
            reactor.value = value
            // 自引用，比如自加操作等。这时将原始的依赖进行展开。同时可能有新的依赖
            if (deps.includes(reactor)) {
              deps.splice(deps.indexOf(reactor), 1, ...item.deps)
            }
            item.deps = uniqueDeps(deps)
            changed = uniqueDeps([...changed, reactor])
          }
        })
      })

      console.log(changed)

      // 根据变化情况更新DOM
      this.updateNode(changed)


      // const isReactive = (value) => {
      //   return value && typeof value === 'object' && value.$$typeof === REACTIVE_SYMBOL
      // }

      // const changed = []
      // queue.forEach((oldOne, newValue) => {
      //   // const { setter, getter } = oldOne
      //   // if (!isReactive(newValue)) {
      //   //   const reactor = this.reactive(
      //   //     () => newValue,
      //   //     getter,
      //   //     setter,
      //   //   )
      //   //   setter(reactor)
      //   //   newValue = reactor
      //   // }

      //   changed.push({
      //     old: oldOne,
      //     new: newValue,
      //   })
      // })

      this.queue.clear()

      // // 通过脏检查，找出全部发生变化的reactive
      // let dirty = false
      // do {
      //   let hasDiffDep = false

      //   this.relations.forEach((item, i) => {
      //     if (item.type !== SCHEDULE_TYPE.VAR) {
      //       return
      //     }

      //     if (item.deps.some(dep => changed.some(one => one.old === dep))) {
      //       hasDiffDep = true

      //     }
      //   })

      //   dirty = hasDiffDep
      // } while (dirty)

      const { onUpdate } = context
      if (onUpdate) {
        onUpdate()
      }
    })
  }

  // should must run after setup
  async mount(el) {
    const { onMount } = this.context

    const mountNeure = async (neure, root) => {
      const { type, attrs, events, element, child, sibling, text, visible } = neure

      if (isInstanceOf(type, Component)) {
        await element.$ready()
        await element.setup(child)
        await element.mount(root)
      }
      else if (type === FRAGMENT_NODE) {
        if (child) {
          await mountNeure(child, root)
        }
      }
      else if (type === TEXT_NODE) {
        const node = document.createTextNode(text)
        if (visible) {
          root.appendChild(node)
        }
        neure.node = node
        neure.parentNode = root
      }
      else if (type === 'slot') {
        const { slot } = this
        // TODO
      }
      else {
        const node = document.createElement(type)
        each(attrs, (value, key) => {
          node.setAttribute(key, value)
        })
        each(events, (fn, key) => {
          node.addEventListener(key, fn)
        })

        if (visible) {
          root.appendChild(node)
        }

        neure.node = node
        if (child) {
          await mountNeure(child, node)
        }
      }

      neure.parentNode = root
      if (sibling) {
        await mountNeure(sibling, root)
      }
    }

    await mountNeure(this.neure, el)

    // TODO 创建css
    // TODO 挂载style

    this.root = el
    this._isMounted = true

    if (onMount) {
      onMount()
    }
  }

  destroy() {
    this._isMounted = false
    this.props = null
    this.context = null
    this.collector.clear()
    this.queue.length = 0
    this.relations.length = 0
    this.root.innerHTML = ''
    this.root = null
  }

  // should must run after ready()
  async setup(slot) {
    const { context } = this
    const { render, dye, onCreate } = context

    if (dye) {
      const brushes = dye()
      this.brushes = brushes
    }

    this.slot = slot
    const neure = render()
    this.neure = neure

    if (onCreate) {
      onCreate()
    }
  }

  h(type, meta, childrenGetter) {
    if (typeof meta === 'function') {
      childrenGetter = meta
      meta = {}
    }

    const initNeure = (meta = {}, args) => {
      const { repeat: repeatGetter } = meta

      if (repeatGetter) {
        const neureList = new NeureFragment({
          type: FRAGMENT_NODE,
          meta,
          children: childrenGetter,
          args,
        })
        neureList.setContents(() => {
          const neures = []
          const [{ items, item: itemKey, index: indexKey }, repeatDeps] = this.collect(() => repeatGetter())
          neureList.deps.fragment = repeatDeps
          neureList.repeat = items

          each(items, (item, index) => {
            const args = {
              [itemKey]: item,
              [indexKey]: index,
            }

            const { repeat, ...others } = meta
            const neure = initNeure(others, args)
            if (neures.length) {
              neures[neures.length - 1].sibling = neure
            }
            neures.push(neure)
          })
          return neures
        })
        return neureList
      }

      const neure = createNeure(type, meta, childrenGetter, args)
      return neure
    }

    const [neure, metaDeps] = this.collect(() => initNeure(meta))
    neure.deps.meta = metaDeps

    if (isInstanceOf(neure, NeureFragment)) {
      each(neure.contents, this.genChildren.bind(this))
    }
    else {
      this.genChildren(neure)
    }

    // if (
    //   (neure.deps.meta && neure.deps.meta.length)
    //   || (neure.deps.children && neure.deps.children.length)
    //   || (neure.deps.fragment && neure.deps.fragment.length)
    // ) {
    //   this.relations.push({
    //     type: SCHEDULE_TYPE.RENDER,
    //     ...neure.deps,
    //     neure,
    //   })
    // }

    return neure
  }

  genChildren(neure) {
    const { visible, children, args } = neure
    if (!visible) {
      return
    }

    if (!children) {
      return
    }

    const [sub, childrenDeps] = this.collect(() => children(args))
    neure.deps.children = childrenDeps

    if (isString(sub)) {
      setTextNode(sub, neure)
    }
    else if (isInstanceOf(sub, Neure)) {
      setNeureNode(sub, neure)
    }
    else if (isArray(sub)) {
      sub.reduce((backer, item) => {
        if (isInstanceOf(item, Neure)) {
          setNeureNode(item, neure, backer)
        }
        else if (isString(item)) {
          setTextNode(item, neure, backer)
        }
        return item
      }, null)
    }
  }

  updateNode(neure, type) {
    console.log(neure, type)
  }

  r(name, ...args) {}
}

export function initComponent(absUrl, meta = {}) {
  const { props = {} } = meta
  const element = new Element(props)

  ;(async function() {
    const component = isInstanceOf(absUrl, Component) ? absUrl : components[absUrl]

    if (!component) {
      throw new Error(`${absUrl} 组件尚未加载`)
    }

    const { deps, fn } = component
    await loadDepComponents(deps)

    const { events = {} } = meta
    const scope = {
      ...components,
      props: new Proxy(element.props, {
        get(props, key) {
          const value = props[key]
          if (element._isCollecting) {
            element.collector.add({
              $$typeof: PROP_SYMBOL,
              key,
              value,
            })
          }
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
      update: element.update.bind(element),
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

function createNeure(type, meta, children, args) {
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

  const neure = new Neure({
    type,
    meta,
    children,

    args,

    key,
    visible,
    keepAlive,
    attrs,
    props,
    events,
  })

  if (isInstanceOf(type, Component)) {
    const element = initComponent(type, { props, events })
    neure.set({ element })
  }

  return neure
}

// function updateElement(element, props = {}) {
//   const keys = Object.keys(props)
//   const oldProps = element.props

//   const changed = keys.filter(key => props[key] !== oldProps[key])
//   each(changed, (key) => {
//     const value = props[key]
//     element.queue.add({
//       $$typeof: PROP_SYMBOL,
//       key,
//       value,
//     })
//   })
//   if (changed.length) {
//     element.queueUpdate()
//   }
// }

function uniqueDeps(deps) {
  return deps.filter((item, i) => {
    if (deps.indexOf(item) !== i) {
      return false
    }
    if (item.$$typeof === PROP_SYMBOL && deps.findIndex(dep => dep.$$typeof === PROP_SYMBOL && dep.key === item.key) !== i) {
      return false
    }
    return true
  })
}

function inDeps(dep, deps) {
  if (deps.includes(dep)) {
    return true
  }
  if (dep.$$typeof === PROP_SYMBOL && deps.some(item => item.$$typeof === PROP_SYMBOL && item.key === dep.key)) {
    return true
  }
  return false
}

function setTextNode(text, parent, backer) {
  const node = new Neure({
    type: TEXT_NODE,
    parent,
  })

  node.text = text

  if (backer) {
    backer.sibling = node
  }
  if (!parent.child) {
    parent.child = node
  }

  node.backer = backer
  return node
}

function setNeureNode(node, parent, backer) {
  node.parent = parent
  if (backer) {
    backer.sibling = node
  }
  if (!parent.child) {
    parent.child = node
  }
  node.backer = backer
}
