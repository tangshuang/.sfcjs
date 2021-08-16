import { resolveUrl, randomString, createBlobUrl } from './utils'

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
