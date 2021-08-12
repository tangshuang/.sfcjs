export function each(obj, fn) {
  const keys = Object.keys(obj)
  for (let i = 0, len = keys.length; i < len; i ++) {
    const key = keys[i]
    const value = obj[key]
    fn(key, value)
  }
}

export function clear(str) {
  return str.replace(/\/\*.*?\*\//gmi, '').replace(/\/\/.*?[\n$]/, '')
}
