import { each, resolveUrl, createScriptByBlob, insertScript } from './utils'
import { getComponentCode } from './main'
import { createProxy, isObject, isArray, remove, assign, isUndefined, isShallowEqual, isString, isInstanceOf, decideby, isOneInArray } from 'ts-fns'
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
const DEPEND_TYPE = {
  VAR: 'var',
  RENDER: 'render',
  DYE: 'dye',
}

class Neure {
  // 固定信息
  type = null
  meta = null
  children = null // 内部元素的获取函数
  // 实时信息，当前状态，用于下一次渲染
  key = null
  visible = true
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
    repeat: null,
  }

  constructor(data = {}) {
    this.set(data)
  }

  set(data) {
    Object.assign(this, data)
  }
}

class NeureList extends Neure {
  contents = null // fragment内部的内容
  getter = null // 用于获取contents的函数
  repeat = null

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

  // schedule = new Set()
  queue = new Set()

  relations = []

  _isCollecting = false
  _queueUpdating = false
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

  reactive(getter, computed) {
    const [value, deps] = computed ? this.collect(() => getter()) : [getter(), []]
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
      getter,
    }

    if (deps.length) {
      this.relations.push({
        deps,
        by: reactor,
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

  collect(fn, callback) {
    const { collector } = this
    const originCollector = new Set([...collector])
    this.collector.clear()
    this._isCollecting = true
    const res = fn()
    this._isCollecting = false
    const deps = [...collector]
    this.collector = originCollector
    if (callback) {
      callback(deps)
    }
    return [res, deps]
  }

  update(reactor, getter) {
    if (!reactor || typeof reactor !== 'object') {
      return getter()
    }

    if (reactor.$$typeof !== REACTIVE_SYMBOL) {
      return getter()
    }

    // 一旦一个变量被更新，那么它就失去了依赖其他变量响应式的能力

    const value = getter(reactor.value)
    reactor.value = value
    reactor.getter = () => value

    this.relations.find((item, i) => {
      if (item.by === reactor) {
        this.relations.splice(i, 1)
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
    if (this._queueUpdating) {
      return
    }
    this._queueUpdating = true
    requestAnimationFrame(() => {
      const { queue } = this

      if (!queue.size) {
        this._queueUpdating = false
        return
      }

      // 计算依赖关系计算顺序 https://blog.csdn.net/cn_gaowei/article/details/7641649x
      const deps = [] // 被依赖的
      const depBys = [] // 依赖了别的的
      const all = new Set() // 所有的
      const graph = [] // 按特定顺序的

      this.relations.forEach((item) => {
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
            const reactor = item.by
            const { getter } = reactor
            const [value, deps] = this.collect(() => getter())
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


      // 根据变化情况更新DOM

      const walk = (neure) => {
        const { type, meta, children, deps, repeat, node, parentNode, args } = neure
        if (isInstanceOf(neure, NeureList)) {
          const {
            meta: metaDeps,
            children: childrenDeps,
            repeat: repeatDeps,
          } = deps

          if (repeatDeps?.length && isOneInArray(changed, repeatDeps)) {

          }
        }
        else if (type === FRAGMENT_NODE) {}
        else if (type === TEXT_NODE) {}
        else if (type === 'slot') {}
        else if (isInstanceOf(type, Component)) {}
        else {
          const {
            meta: metaDeps,
            children: childrenDeps,
          } = deps

          let showOut = false

          if (metaDeps?.length && isOneInArray(changed, metaDeps)) {
            this.collect(() => {
              const {
                class: classGetter,
                style: styleGetter,
                visible: visibleGetter,
                key: keyGetter,
                attrs: attrsGetter,
              } = meta

              const key = keyGetter ? keyGetter(args) : null
              const visible = visibleGetter ? visibleGetter(args) : true
              const attrs = attrsGetter ? attrsGetter(args) : {}
              const className = classGetter ? classGetter(args) : ''
              const style = styleGetter ? styleGetter(args) : ''

              // 从不显示变为显示
              showOut = visible && !neure.visible

              // 重置样式相关
              node.classList.forEach((className) => {
                node.classList.remove(className)
              })
              node.style.cssText = ''

              // 移除原有的不再需要的属性
              if (neure.attrs) {
                each(neure.attrs, (_, key) => {
                  if (!(key in attrs)) {
                    node.removeAttribute(key)
                  }
                })
              }

              each(attrs, (value, key) => {
                node.setAttribute(key, value)
              })

              if (className) {
                const classNames = className.split(' ')
                classNames.forEach((item) => {
                  node.classList.add(item)
                })
              }

              if (style) {
                node.style.cssText = (node.style.cssText || '') + style
              }

              if (neure.visible !== visible) {
                if (visible) {
                  let next = null
                  let sibling = neure.sibling
                  while (sibling) {
                    if (sibling.visible && sibling.node) {
                      next = sibling.node
                      break
                    }
                    sibling = sibling.sibling
                  }
                  parentNode.insertBefore(node, next)
                }
                else {
                  parentNode.removeChild(node)
                }
              }

              neure.set({
                key,
                visible,
                attrs,
                className,
                style,
              })
            }, (deps) => {
              neure.deps.meta = deps
            })
          }

          // TODO children

          // 内部是文本（只有一个child）
          if (childrenDeps?.length && neure.child?.type === TEXT_NODE && !neure.child?.sibling) {
            this.collect(() => {
              const text = neure.children()
              neure.child.node.textContent = text
              neure.child.text = text
            }, (deps) => {
              neure.deps.children = deps
            })
          }
          // 从最开始的不显示，变为显示出来，需要新建child
          else if (!neure.child && showOut) {
            this.genChildren(neure)
            if (neure.child) {
              this.mountNeure(neure.child, neure.node)
            }
          }
        }

        if (neure.child) {
          walk(neure.child)
        }

        if (neure.sibling) {
          walk(neure.sibling)
        }
      }

      console.log(changed)
      walk(this.neure)

      // const isReactive = (value) => {
      //   return value && typeof value === 'object' && value.$$typeof === REACTIVE_SYMBOL
      // }

      this.queue.clear()
      this._queueUpdating = false
    })
  }

  // should must run after setup
  async mount(el) {
    await this.mountNeure(this.neure, el)

    // TODO 创建css
    // TODO 挂载style

    this.root = el
    this._isMounted = true
  }

  async mountNeure(neure, root) {
    const { type, attrs, events, element, child, sibling, text, visible, className, style } = neure

    if (isInstanceOf(type, Component)) {
      await element.$ready()
      await element.setup(child)
      await element.mount(root)
    }
    else if (type === FRAGMENT_NODE) {
      if (child) {
        await this.mountNeure(child, root)
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
      if (className) {
        const classNames = className.split(' ')
        classNames.forEach((item) => {
          node.classList.add(item)
        })
      }
      if (style) {
        node.style.cssText = (node.style.cssText || '') + style
      }

      if (visible) {
        root.appendChild(node)
      }

      neure.node = node
      if (child) {
        await this.mountNeure(child, node)
      }
    }

    neure.parentNode = root
    if (sibling) {
      await this.mountNeure(sibling, root)
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
    const { render, dye } = context

    if (dye) {
      const brushes = dye()
      this.brushes = brushes
    }

    this.slot = slot
    const neure = render()
    this.neure = neure
  }

  h(type, meta, childrenGetter) {
    if (typeof meta === 'function') {
      childrenGetter = meta
      meta = {}
    }

    const initNeure = (meta = {}, args) => {
      const { repeat: repeatGetter } = meta

      if (repeatGetter) {
        const neureList = new NeureList({
          type: FRAGMENT_NODE,
          meta,
          children: childrenGetter,
          args,
        })
        neureList.setContents(() => {
          const neures = []
          const [{ items, item: itemKey, index: indexKey }, repeatDeps] = this.collect(() => repeatGetter())
          neureList.deps.repeat = repeatDeps
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

    if (isInstanceOf(neure, NeureList)) {
      each(neure.contents, this.genChildren.bind(this))
    }
    else {
      this.genChildren(neure)
    }

    // if (
    //   (neure.deps.meta && neure.deps.meta.length)
    //   || (neure.deps.children && neure.deps.children.length)
    //   || (neure.deps.repeat && neure.deps.repeat.length)
    // ) {
    //   this.relations.push({
    //     type: DEPEND_TYPE.RENDER,
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

  updateNode(neure) {
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
    class: classGetter,
    style: styleGetter,
    visible: visibleGetter,
    key: keyGetter,
    attrs: attrsGetter,
    props: propsGetter,
    events: eventsGetter,
  } = meta

  const key = keyGetter ? keyGetter(args) : null
  const visible = visibleGetter ? visibleGetter(args) : true
  const attrs = attrsGetter ? attrsGetter(args) : {}
  const props = propsGetter ? propsGetter(args) : {}
  const events = eventsGetter ? eventsGetter(args) : {}
  const className = classGetter ? classGetter(args) : ''
  const style = styleGetter ? styleGetter(args) : ''

  const neure = new Neure({
    type,
    meta,
    children,

    args,

    key,
    visible,
    attrs,
    props,
    events,
    className,
    style,
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
