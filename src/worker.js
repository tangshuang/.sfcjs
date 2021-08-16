import { loadComponent } from './compiler'
import { prettyJsCode } from './prettier'

self.addEventListener('message', async (e) => {
  if (!e.data) {
    return
  }

  const data = JSON.parse(e.data)
  const { type } = data
  if (type === 'init') {
    const { src, id } = data
    const code = await loadComponent(src, {
      prettyJs: prettyJsCode,
    })
    postMessage(JSON.stringify({
      type: 'inited',
      id,
      code,
    }))
  }
})
