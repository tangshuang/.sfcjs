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
