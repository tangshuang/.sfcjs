export function tokenizer(code) {
  const tokens = []

  let cursor = 0
  let token = ''
  let str = ''

  for (let len = code.length; cursor < len; cursor ++) {
    const char = code[cursor]

    if (['(', ')', '[', ']', '{', '}', ';', '\n'].includes(char)) {
      if (token) {
        tokens.push(token)
        token = ''
      }
      if (str) {
        tokens.push(str)
        str = ''
      }
      tokens.push(char)
    }
    else if (/\w/.test(char)) {
      if (str) {
        tokens.push(str)
        str = ''
      }
      token += char
    }
    else {
      if (token) {
        tokens.push(token)
        token = ''
      }
      str += char
    }
  }

  if (token) {
    tokens.push(token)
    token = ''
  }
  if (str) {
    tokens.push(str)
    str = ''
  }

  return tokens
}