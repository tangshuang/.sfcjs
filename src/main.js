import { resolveUrl, randomString, createBlobUrl, createScriptByBlob, insertScript, each } from './utils'
import { initComponent } from './framework'

const { currentScript } = document
const { src } = currentScript
const { href } = window.location
const baseUrl = resolveUrl(href, src)
const workerSrc = currentScript.getAttribute('worker-src') || resolveUrl(baseUrl, './worker.js')
const workerUrl = createBlobUrl(`importScripts('${workerSrc}')`)
const worker = new Worker(workerUrl)

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
    setTimeout(() => {
      onComplete()
      reject(new Error(`加载组件 ${src} 超时`))
    }, 5000)
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
    const auto = this.getAttribute('auto')
    if (src) {
      await this.setup()
    }
    if (src && auto) {
      await this.mount()
    }
  }

  async setup() {
    const src = this.getAttribute('src')
    const baseUrl = window.location.href
    const url = resolveUrl(baseUrl, src)
    const code = await getComponentCode(url)
    // console.debug(code)
    const script = createScriptByBlob(code)
    script.setAttribute('sfc-src', url)
    this.absUrl = url
    await insertScript(script)
    this.$ready(true)
  }

  async mount(meta) {
    await this.$ready()
    const { absUrl } = this
    const element = initComponent(absUrl, meta)
    this.rootElement = element
    await element.$ready()
    await element.setup()
    await element.mount(this.shadowRoot)
    // console.debug(element)
  }

  disconnectedCallback() {
    if (this.rootElement) {
      this.rootElement.unmount()
    }
  }
}

customElements.define('sfc-view', SFC_View)
