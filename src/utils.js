export function each(obj, fn) {
  if (Array.isArray(obj)) {
    for (let i = 0, len = obj.length; i < len; i ++) {
      const item = obj[i]
      fn(item, i)
    }
    return
  }

  const keys = Object.keys(obj)
  for (let i = 0, len = keys.length; i < len; i ++) {
    const key = keys[i]
    const value = obj[key]
    fn(value, key)
  }
}

export function clearComments(str) {
  return str.replace(/\/\*.*?\*\//gmi, '').replace(/\/\/.*?[\n$]/, '')
}

export function clearHtml(str) {
  return str.replace(/>[\n\s]+?</gmi, '><').replace(/>\n+?([\w\W]+?)\n+?</gmi, '>$1<')
}

export function padding(count) {
  return new Array(count).fill(' ').join('')
}

export function camelcase(str, force) {
  if (force) {
    const s = camelcase(str)
    return s.replace(s[0], s[0].toUpperCase())
  }
  return str.replace(/[-_]\w/ig, (matched) => {
    return matched[1].toUpperCase()
  }).replace(/\s+/g, '')
}

export function resolveUrl(baseUrl, uri) {
  if (!uri) {
    throw new Error('resolveUrl 必须传入 baseUrl & uri')
  }

  if (/^[a-z]+:\/\//.test(uri)) {
    // 使用绝对路径
    return uri
  }

  if (!baseUrl || !/^[a-z]+:\/\//.test(baseUrl)) {
    throw new Error('resolveUrl 中 baseUrl 必须是带协议的 url')
  }

  const origin = baseUrl.split('/').slice(0, 3).join('/')

  if (uri.indexOf('/') === 0) {
    return origin + uri
  }

  if (/^(\?|&|#)$/.test(uri[0])) {
    return baseUrl + uri
  }

  let dir = ''
  if (baseUrl[baseUrl.length - 1] === '/') {
    dir = baseUrl.substring(0, baseUrl.length - 1)
  }
  else {
    const chain = baseUrl.split('/')
    const tail = chain.pop()
    dir = tail.indexOf('.') === -1 ? baseUrl : chain.join('/')
  }

  const roots = dir.split('/')
  const blocks = uri.split('/')
  while (true) {
    const block = blocks[0]
    if (block === '..') {
      blocks.shift()
      roots.pop()
    }
    else if (block === '.') {
      blocks.shift()
    }
    else {
      break
    }
  }

  const url = roots.join('/') + '/' + blocks.join('/')
  return url
}

export function randomString(len = 8) {
  const CHARS = '0123456789abcdefghigklmnopqrstuvwxyzABCDEFGHIGKLMNOPQRSTUVWXYZ'
  let text = ''
  for (let i = 0; i < len; i++) {
    text += CHARS.charAt(Math.floor(Math.random() * CHARS.length))
  }
  return text
}

export function noop() {}

export function createBlobUrl(contents) {
  const _URL = window.URL || window.webkitURL
  const blob = new Blob([ contents ], { type: 'application/javascript' })
  const blobURL = _URL.createObjectURL(blob)
  return blobURL
}

export function createScriptByBlob(contents) {
  const src = createBlobUrl(contents)
  const script = document.createElement('script')
  script.type = 'module'
  script.src = src
  return script
}

export async function insertScript(script) {
  return new Promise((r) => {
    script.onload = r
    document.body.appendChild(script)
  })
}

export function tryParse(str) {
  try {
    const jsonStr = str.replace(/'/g, '"').replace(/(\w+:)|(\w+ :)/g, function(s) {
      return '"' + s.substring(0, s.length-1) + '":';
    })
    return JSON.parse(jsonStr)
  }
  catch (e) {
  }
}

/**
 * 根据条件删除元素
 * @param {*} items
 * @param {*} fn
 */
export function removeBy(items, fn) {
  items.forEach((item, i) => {
    if (fn(item, i, items)) {
      items.splice(i, 1)
    }
  })
}

export function createReady() {
  let resolve = null
  const promise = new Promise((r) => {
    resolve = r
  })

  return (resolved) => {
    if (resolved) {
      resolve()
    }
    return promise
  }
}
