import { loadComponent } from './compiler'

const context = {
  options: {},
}

self.addEventListener('message', async (e) => {
  if (!e.data) {
    return
  }

  const data = JSON.parse(e.data)
  const { type } = data
  if (type === 'init') {
    const { src, id } = data
    const code = await loadComponent(src, context.options)
    postMessage(JSON.stringify({
      type: 'inited',
      id,
      code,
    }))
  }
  else if (type === 'tools') {
    const { src } = data
    importScripts(src) // 同步的
    if (self.Tools) {
      Object.assign(context.options, self.Tools)
    }
  }
})
