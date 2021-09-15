import { resolveUrl, randomString, createBlobUrl, createScriptByBlob, insertScript, each, tryParse } from './utils'
import { initComponent } from './framework'

const { currentScript } = document
const { src } = currentScript
const { href } = window.location
const baseUrl = resolveUrl(href, src)
const workerSrc = currentScript.getAttribute('worker-src') || resolveUrl(baseUrl, './worker.js')
const workerUrl = createBlobUrl(`importScripts('${workerSrc}')`)
const worker = new Worker(workerUrl)

const toolsSrc = currentScript.getAttribute('tools-src')
if (toolsSrc) {
  worker.postMessage(JSON.stringify({ type: 'tools', src: resolveUrl(baseUrl, toolsSrc) }))
}

export function getComponentCode(src) {
  return new Promise((resolve, reject) => {
    const id = randomString()
    worker.postMessage(JSON.stringify({ type: 'init', src, id }))
    const onComplete = () => {
      worker.removeEventListener('message', onSuccess)
    }
    const onSuccess = (e) => {
      if (!e.data) {
        return
      }

      const data = JSON.parse(e.data)
      const { type } = data
      if (type !== 'inited') {
        return
      }

      if (data.id !== id) {
        return
      }

      const { code } = data
      if (!code) {
        return
      }

      onComplete()
      resolve(code)
    }
    worker.addEventListener('message', onSuccess)
  })
}

class SFC_View extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.rootElement = null

    this._ready = new Promise((r) => {
      this.__ready = r
    })
  }

  $ready(resolved) {
    if (resolved) {
      this.__ready()
    }
    return this._ready
  }

  async connectedCallback() {
    const src = this.getAttribute('src')
    const passive = this.getAttribute('passive')
    if (!src) {
      return
    }

    // 这里使用了一个技巧，就是在一开始的时候，让slot存在，显示出内部信息，当需要挂载的时候清空
    // 如果不做这个操作，那么当<sfc-view>挂载之后，就会立即清空内部的内容
    // 这个能力仅对传入了src的有效，传入src的是真正用于入口的组件，没有传的是内部使用，不提供这个功能
    // 只有当调用mount之后，才会消失，如果开发者自己手动调用过程中想提前清空，也可以调用clear
    this.shadowRoot.innerHTML = '<slot></slot>'

    await this.setup()
    if (!passive) {
      await this.mount()
    }
  }

  async setup() {
    const src = this.getAttribute('src')
    const baseUrl = window.location.href
    const url = resolveUrl(baseUrl, src)
    const code = await getComponentCode(url)
    // console.log(code)
    const script = createScriptByBlob(code)
    script.setAttribute('sfc-src', url)
    this.absUrl = url
    await insertScript(script)
    this.$ready(true)
  }

  clear() {
    this.shadowRoot.innerHTML = '' // 清空内容
  }

  async mount(meta = {}) {
    const { attributes } = this
    const props = {}
    const attrs = {}
    each(attributes, ({ name, value }) => {
      if (['src', 'passive'].includes(name)) {
        return
      }
      if (name[0] === ':') {
        props[name.substr(1)] = tryParse(value)
      }
      else if (/^[a-z]/.test(name)) {
        attrs[name] = value
      }
    })
    const info = {
      props,
      attrs,
      ...meta,
    }

    await this.$ready()
    const { absUrl } = this
    const element = initComponent(absUrl, info)
    this.rootElement = element
    await element.$ready()
    await element.setup()
    this.clear()
    await element.mount(this.shadowRoot)
    // console.log(element)
  }

  disconnectedCallback() {
    if (this.rootElement) {
      this.rootElement.unmount()
    }
  }
}

customElements.define('sfc-view', SFC_View)
