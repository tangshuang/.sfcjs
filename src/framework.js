import { each, resolveUrl, createScriptByBlob, insertScript, removeBy } from './utils'
import { getComponentCode } from './main'
import {
  createProxy, isObject, isArray,
  parse,
  remove, assign, isUndefined, isShallowEqual, isString,
  isInstanceOf, decideby, isOneInArray, isFunction,
  createRandomString,
  uniqueArray,
} from 'ts-fns'
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
const REACTIVE_TYPE = Symbol('reactive')
const PROP_TYPE = Symbol('prop')
// 节点类型
const TEXT_NODE = Symbol('text')

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
  bind = null
  className = null
  style = null
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
  // 不同的类型依赖生效的域不同，普通节点对meta生效，文本节点对children生效，list节点对list生效
  deps = []

  set(data) {
    Object.assign(this, data)
  }
}

class NeureList extends Neure {
  list = null // fragment内部的内容
  repeat = null // repeat数据
}

class TextNeure extends Neure {
  text = null // TextNode内部的文本
}

class AsyncNeure extends Neure {
  promise = null // 含有await指令
  data = ''
  error = ''
  status = ''
}

// ---------------------------------------------

class Brush {
  constructor(data) {
    Object.assign(this, data)
  }
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

  // 用于样式
  styles = null
  brushes = null
  dyeAt = null
  brushesAt = null

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
      get: (_, value) => {
        if (this._isCollecting) {
          this.collector.add(reactor)
        }
        return value
      },
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
      $$typeof: REACTIVE_TYPE,
      value: create(value),
      getter,
      $id: createRandomString(8),
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

    if (reactor.$$typeof !== REACTIVE_TYPE) {
      return reactor
    }

    if (this._isCollecting) {
      this.collector.add(reactor)
    }

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

    if (reactor.$$typeof !== REACTIVE_TYPE) {
      return getter()
    }

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

      const depRelMap = new Map() // key: reactor -> value: relation

      this.relations.forEach((item) => {
        item.deps.forEach((dep) => {
          deps.push(dep)
          depBys.push(item.by)
          all.add(dep)
        })
        all.add(item.by)
        depRelMap.set(item.by, item)
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
        each(items, (reactor) => {
          const rel = depRelMap.get(reactor)
          // 没有任何依赖的
          if (!rel || !rel.deps) {
            return
          }
          // 重新计算，并将该项放到changed中提供给下一个组做判断
          if (rel.deps.some(dep => inDeps(dep, changed))) {
            const { getter } = reactor
            if (!getter) {
              return
            }
            const [value, deps] = this.collect(() => getter())
            reactor.value = value
            // 自引用，比如自加操作等。这时将原始的依赖进行展开。同时可能有新的依赖
            if (deps.includes(reactor)) {
              deps.splice(deps.indexOf(reactor), 1, ...rel.deps)
            }
            rel.deps = uniqueDeps(deps)
            changed = uniqueDeps([...changed, reactor])
          }
        })
      })

      // 重新构建样式
      if (this.brushes && this.brushesAt) {
        const brushesContent = this.brushes.map((brush) => {
          const { id, getter, deps, value } = brush
          if (deps.length && isOneInArray(changed, deps)) {
            const [next, nextDeps] = this.collect(getter)
            brush.value = next
            brush.deps = nextDeps
            return `--${id}: ${next};`
          }
          return `--${id}: ${value};`
        }).join('\n')
        this.brushesAt.textContent = `:host {\n${brushesContent}\n}`
      }

      this.queue.clear()
      this._queueUpdating = false

      // 根据变化情况更新DOM
      // console.log(changed)
      this.updateNeure(this.neure, changed)
    })
  }

  // should must run after setup
  async mount(el) {
    if (this.styles) {
      await this.mountStyles(this.styles, el)
    }
    await this.mountNeure(this.neure, el)

    this.root = el
    this._isMounted = true
  }

  async mountNeure(neure, root) {
    const { type, attrs, events, element, child, sibling, text, visible, className, style, bind } = neure

    const mount = async (type) => {
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

      if (bind) {
        const bindUpdate = (e) => {
          const nextValue = e.target.value
          bind[0] = nextValue
          bind[1](nextValue)
        }
        node.addEventListener('input', bindUpdate)
      }

      if (visible) {
        root.appendChild(node)
      }

      neure.node = node
      if (child) {
        await this.mountNeure(child, node)
      }

      if (bind) {
        changeInput(neure)
      }
    }

    if (isInstanceOf(type, Component)) {
      await element.$ready()
      await element.setup(child)
      if (element.neure) { // 可能内部完全没东西
        const node = document.createElement('sfc-view')
        neure.node = node
        neure.parentNode = root
        element.root = node.shadowRoot
        // 利用原生customElement实现slot效果
        if (child) {
          await this.mountNeure(child, node)
        }
        // 不一定挂载到真正的文档中
        if (visible) {
          root.appendChild(node)
          await element.mount(node.shadowRoot)
        }
      }
      else {
        console.error(`${type} 组件文件未提供渲染的内容`)
      }
    }
    else if (isInstanceOf(neure, NeureList)) {
      if (child) {
        await this.mountNeure(child, root)
      }
    }
    else if (isInstanceOf(neure, TextNeure)) {
      const node = document.createTextNode(text)
      root.appendChild(node)
      neure.node = node
      neure.parentNode = root
    }
    else {
      await mount(type)
    }

    neure.parentNode = root

    if (sibling) {
      await this.mountNeure(sibling, root)
    }

    // 等到全部初始状态挂载完毕之后，才能进入到更新操作，有一个mounted标记控制
    if (isInstanceOf(neure, AsyncNeure)) {
      neure.promise.then((res) => {
        if (neure.status) {
          const [key, reactor] = neure.status
          neure.args[key] = 'resolved'
          this.update(reactor, () => 'resolved')
        }
        if (neure.data) {
          const [key, reactor] = neure.data
          neure.args[key] = res
          this.update(reactor, () => res)
        }
      }).catch((err) => {
        if (neure.status) {
          const [key, reactor] = neure.status
          neure.args[key] = 'rejected'
          this.update(reactor, () => 'rejected')
        }
        if (neure.error) {
          const [key, reactor] = neure.error
          neure.args[key] = err
          this.update(reactor, () => err)
        }
      })
    }
  }

  // 根据变化情况更新DOM
  updateNeure(neure, changed) {
    const walk = (neure) => {
      const { type, meta, children, deps, repeat, node, parentNode, args, bind } = neure

      let notNeedWalkToChild = false

      if (isInstanceOf(neure, NeureList)) {
        if (!changed || (deps.length && isOneInArray(changed, deps))) {
          const neureList = neure
          const {
            repeat: prevItems,
            list: prevList,
          } = neureList
          const {
            repeat: repeatGetter,
          } = meta
          const [{ items, item: itemKey, index: indexKey }, repeatDeps] = this.collect(() => repeatGetter())

          neureList.deps = repeatDeps
          neureList.repeat = items

          const neures = []
          const { repeat, ...others } = meta

          if (!isShallowEqual(items, prevItems)) {
            each(items, (item, index) => {
              const args = {
                [itemKey]: item,
                [indexKey]: index,
              }
              const prevIndex = prevItems.indexOf(item)

              if (prevIndex > -1) {
                const prevNeure = prevList[index]
                Object.assign(prevNeure.args, args) // 更新args
                neures.push(prevNeure)
                prevList.splice(index, 1) // 从原来的列表中删除
                return
              }

              const neure = this.initNeure(type, others, children, args)
              if (neures.length) {
                neures[neures.length - 1].sibling = neure
              }
              neures.push(neure)
            })
            each(neures, (neure) => {
              neure.parent = neureList
            })

            neureList.child = neures[0] || null
            neureList.list = neures

            const sibling = decideby(() => {
              const firstNode = prevList.find(item => item.visible && item.node)
              if (firstNode) {
                return firstNode
              }
              const sibling = findSibling(neureList)
              return sibling
            })
            each(neures, (neure) => {
              if (neure.node) {
                parentNode.insertBefore(neure.node, sibling)
              }
              else {
                this.mountNeure(neure, parentNode)
              }
            })

            // 移除已经拥有用的DOM节点
            const removeChildren = (list) => {
              each(list, (item) => {
                if (item.node) {
                  parentNode.remove(item.node)
                }
                else if (isInstanceOf(item, NeureList) && item.list) {
                  removeChildren(item.list)
                }
              })
            }
            removeChildren(prevList)
          }
        }
      }
      else if (isInstanceOf(neure, TextNeure)) {
        if (!changed || (deps?.length && isOneInArray(changed, deps))) {
          this.collect(() => {
            const text = children()
            neure.node.textContent = text
            neure.text = text
          }, (deps) => {
            neure.deps = deps
          })
        }
      }
      else if (isInstanceOf(type, Component)) {
        const { element } = neure
        const {
          class: classGetter,
          style: styleGetter,
          visible: visibleGetter,
          key: keyGetter,
          attrs: attrsGetter,
          props: propsGetter,
          events: eventsGetter,
          bind: bindGetter,
        } = meta

        this.collect(async () => {
          const key = keyGetter ? keyGetter(args) : null
          const visible = visibleGetter ? visibleGetter(args) : true
          const attrs = attrsGetter ? attrsGetter(args) : {}
          const props = propsGetter ? propsGetter(args) : {}
          const events = eventsGetter ? eventsGetter(args) : {}
          const className = classGetter ? classGetter(args) : ''
          const style = styleGetter ? styleGetter(args) : ''
          const bind = bindGetter ? bindGetter() : null

          if (neure.visible !== visible) {
            if (visible) {
              const sibling = findSibling(neure)
              parentNode.insertBefore(node, sibling)

              if (!element._isMounted) {
                await element.mount(node.shadowRoot)
              }
            }
            else {
              parentNode.removeChild(node)
            }
          }

          await updateComponent(element, { props })

          neure.set({
            key,
            visible,
            attrs,
            props,
            events,
            className,
            style,
            bind,
          })
        }, (deps) => {
          neure.deps = deps
        })
      }
      else {
        let showOut = false

        if (!changed || (deps?.length && isOneInArray(changed, deps))) {
          this.collect(() => {
            const {
              class: classGetter,
              style: styleGetter,
              visible: visibleGetter,
              key: keyGetter,
              attrs: attrsGetter,
              bind: bindGetter,
            } = meta

            const key = keyGetter ? keyGetter(args) : null
            const visible = visibleGetter ? visibleGetter(args) : true
            const attrs = attrsGetter ? attrsGetter(args) : {}
            const className = classGetter ? classGetter(args) : ''
            const style = styleGetter ? styleGetter(args) : ''
            const bind = bindGetter ? bindGetter() : null

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

            if (bind) {
              neure.bind = bind
              changeInput(neure)
            }

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
                const sibling = findSibling(neure)
                parentNode.insertBefore(node, sibling)
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
            neure.deps = deps
          })
        }

        // 从最开始的不显示，变为显示出来，需要新建child
        if (!neure.child && showOut) {
          this.genChildren(neure)
          if (neure.child) {
            this.mountNeure(neure.child, neure.node)
          }
          notNeedWalkToChild = true
        }
      }

      if (!notNeedWalkToChild && neure.child) {
        walk(neure.child)
      }

      if (neure.sibling) {
        walk(neure.sibling)
      }
    }

    walk(neure)
  }

  async mountStyles(styles, root) {
    const list = []
    const brushes = []
    const create = (attrs) => {
      let text = ''
      each(attrs, (value, key) => {
        if (isInstanceOf(value, Brush)) {
          text += `${key}: var(--${value.id});`
          brushes.push(value)
        }
        else {
          text += `${key}: ${value};`
        }
      })
      return text
    }
    const build = (item) => {
      const { name, attrs } = item
      let text = `${name} {`
      text += create(attrs)
      text += '}'
      return text
    }
    each(styles, (item) => {
      if (isArray(item)) {
        const [type, query, ...rules] = item
        if (isObject(query)) {
          let text = `${type} {`
          text += [query, ...rules].map((item) => item ? create(item) : '').filter(item => !!item).join('')
          text += '}'
          list.push(text)
        }
        else if (isString(query)) {
          let text = `${type} ${query} {`
          text += rules.map((item) => item ? build(item) : '').filter(item => !!item).join(' ')
          text += '}'
          list.push(text)
        }
      }
      else if (!!item) {
        const text = build(item)
        list.push(text)
      }
    })
    const content = list.join('\n')

    if (brushes.length) {
      const brushesContent = brushes.map((brush) => {
        const { id, value } = brush
        return `--${id}: ${value};`
      }).join('\n')
      const brushNode = document.createElement('style')
      brushNode.textContent = `:host {\n${brushesContent}\n}`
      root.appendChild(brushNode)
      this.brushes = brushes
      this.brushesAt = brushNode
    }

    const style = document.createElement('style')
    style.textContent = content
    root.appendChild(style)
    this.dyeAt = style
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
      const styles = dye()
      this.styles = styles
    }

    this.slot = slot
    const neure = render()
    this.neure = neure
  }

  t(textGetter) {
    const [text, deps] = this.collect(() => textGetter())
    const node = new TextNeure()
    node.set({
      type: TEXT_NODE,
      children: textGetter,
      text,
      deps,
    })
    return node
  }

  h(type, meta, childrenGetter) {
    if (typeof meta === 'function') {
      childrenGetter = meta
      meta = {}
    }

    const [neure, metaDeps] = this.collect(() => this.initNeure(type, meta, childrenGetter))
    neure.deps = metaDeps

    if (isInstanceOf(neure, NeureList)) {
      each(neure.list, this.genChildren.bind(this))
    }
    else {
      this.genChildren(neure)
    }

    return neure
  }

  initNeure(type, meta = {}, childrenGetter, args) {
    const { repeat: repeatGetter, await: awaitGetter } = meta

    if (repeatGetter) {
      const neureList = new NeureList()
      neureList.set({
        type,
        meta,
        children: childrenGetter,
        args,
      })
      const neures = []
      const [{ items, item: itemKey, index: indexKey }, repeatDeps] = this.collect(() => repeatGetter())
      neureList.deps = repeatDeps
      neureList.repeat = items

      const { repeat, ...others } = meta

      each(items, (item, index) => {
        const args = {
          [itemKey]: item,
          [indexKey]: index,
        }
        const neure = this.initNeure(type, others, childrenGetter, args)
        if (neures.length) {
          neures[neures.length - 1].sibling = neure
        }
        neures.push(neure)
      })
      each(neures, (neure) => {
        neure.parent = neureList
      })

      neureList.child = neures[0] || null
      neureList.list = neures
      return neureList
    }

    if (awaitGetter) {
      const { await: _await, ...others } = meta
      const { promise, data, error, status } = awaitGetter() // 无法进行响应式，只能一次使用

      const stat = status ? [status, this.reactive(() => 'pending')] : null
      const dt = data ? [data, this.reactive(() => null)] : null
      const err = error ? [error, this.reactive(() => null)] : null

      const passedArgs = args || {}
      const localArgs = { ...passedArgs }
      if (stat) {
        localArgs[stat[0]] = stat[1]
      }

      // 真正实例化
      const neure = createNeure(type, others, childrenGetter, localArgs, AsyncNeure)
      neure.set({
        promise,
        status: stat,
        data: dt,
        error: err,
      })

      this.genChildren(neure)
      return neure
    }

    const neure = createNeure(type, meta, childrenGetter, args)
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

    const subs = children(args)
    subs.reduce((backer, item) => {
      item.parent = parent
      if (!parent.child) {
        parent.child = item
      }

      if (backer) {
        backer.sibling = item
      }
      return item
    }, null)
    neure.child = subs[0]
  }

  r(name, ...args) {
    const attrs = {}
    args.forEach((item) => {
      if (isObject(item)) {
        each(item, (value, key) => {
          if (isFunction(value)) {
            const [v, deps] = this.collect(value)
            attrs[key] = new Brush({
              value: v,
              deps,
              getter: value,
              id: createRandomString(12),
            })
          }
          else {
            attrs[key] = value
          }
        })
      }
    })
    return { name, attrs }
  }
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
      props: createProxy({}, {
        get: (keyPath) => {
          const value = parse(element.props, keyPath)
          if (element._isCollecting) {
            element.collector.add({
              $$typeof: PROP_TYPE,
              key: keyPath[0],
              value,
            })
          }
          return value
        },
        writable: () => false,
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
      t: element.t.bind(element),
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

async function updateComponent(element, meta) {
  const originProps = element.props
  const { props = {} } = meta
  const originKeys = Object.keys(originProps)
  const newKeys = Object.keys(props)
  // 当前已经渲染出来的props
  const keys = uniqueArray([...originKeys, ...newKeys])
  // 找出发生变化的props
  const changed = keys.map((key) => {
    const value = props[key]
    if (originProps[key] !== value) {
      return {
        key,
        value,
      }
    }
  }).filter(item => !!item)
  // 更新组件
  element.props = props
  each(changed, (o) => {
    const reactor = {
      $$typeof: PROP_TYPE,
      ...o,
    }
    element.queue.add(reactor)
  })
  element.queueUpdate()
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

function createNeure(type, meta, children, args, NeureClass = Neure) {
  const {
    class: classGetter,
    style: styleGetter,
    visible: visibleGetter,
    key: keyGetter,
    attrs: attrsGetter,
    props: propsGetter,
    events: eventsGetter,
    bind: bindGetter,
  } = meta

  const key = keyGetter ? keyGetter(args) : null
  const visible = visibleGetter ? visibleGetter(args) : true
  const attrs = attrsGetter ? attrsGetter(args) : {}
  const props = propsGetter ? propsGetter(args) : {}
  const events = eventsGetter ? eventsGetter(args) : {}
  const className = classGetter ? classGetter(args) : ''
  const style = styleGetter ? styleGetter(args) : ''
  const bind = bindGetter ? bindGetter() : null

  const neure = new NeureClass()
  neure.set({
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
    bind,
  })

  if (isInstanceOf(type, Component)) {
    const element = initComponent(type, { props, events })
    neure.set({ element })
  }

  return neure
}

function uniqueDeps(deps) {
  return deps.filter((item, i) => {
    if (deps.indexOf(item) !== i) {
      return false
    }
    if (item.$$typeof === PROP_TYPE && deps.findIndex(dep => dep.$$typeof === PROP_TYPE && dep.key === item.key) !== i) {
      return false
    }
    return true
  })
}

function inDeps(dep, deps) {
  if (deps.includes(dep)) {
    return true
  }
  if (dep.$$typeof === PROP_TYPE && deps.some(item => item.$$typeof === PROP_TYPE && item.key === dep.key)) {
    return true
  }
  return false
}

function findSibling(neure) {
  const sibling = neure.sibling

  if (!sibling) {
    return null
  }

  if (isInstanceOf(sibling, NeureList)) {
    const child = sibling.child
    if (child.visible) {
      return child.node
    }

    const next = findSibling(child)
    if (next) {
      return next
    }
  }

  if (sibling.visible) {
    return neure.sibling.node
  }

  return findSibling(sibling)
}

function changeInput(neure) {
  const { bind, node, type } = neure

  if (type === 'select') {
    const options = [...node.querySelectorAll(':scope > option')]
    const bindValue = bind[0]
    node.value = bindValue
    options.forEach((option) => {
      if (option.getAttribute('value') === bindValue) {
        option.setAttribute('selected', 'selected')
      }
      else {
        option.removeAttribute('selected')
      }
    })
  }
  else if (type === 'textarea') {
    const bindValue = bind[0]
    node.value = bindValue
    node.innerHTML = bindValue
  }
  else if (type === 'input') {
    const bindValue = bind[0]
    node.value = bindValue
    node.setAttribute('value', bindValue)
  }
}
