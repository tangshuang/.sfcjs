const OPERATORS = ['++', '--', '**']
const SPECIARES = ['(', ')', '[', ']', '{', '}', ';', '\n']
const MODIFIERS = ['+=', '-=', '*=', '/=', '%=']

export function tokenize(code) {
  const tokens = []

  let cursor = 0
  let token = ''
  let str = ''

  const quotes = []

  for (let len = code.length; cursor < len; cursor ++) {
    const char = code[cursor]

    const twoChars = char + code[cursor + 1]
    if ([...OPERATORS, ...MODIFIERS].includes(twoChars)) {
      if (token) {
        tokens.push(token)
        token = ''
      }
      if (str) {
        tokens.push(str)
        str = ''
      }
      tokens.push(twoChars)
      cursor ++
    }
    else if (SPECIARES.includes(char)) {
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
    else if (['"', "'", '`'].includes(char)) {
      const latest = quotes[quotes.length - 1]
      if (latest && latest === char) {
        quotes.pop()
        token += char
        if (!quotes.length) {
          tokens.push(token)
          token = ''
        }
      }
      else {
        quotes.push(char)
        if (str) {
          tokens.push(str)
          str = ''
        }
        token += char
      }
    }
    else if (quotes.length) {
      if (str) {
        tokens.push(str)
        str = ''
      }
      token += char
    }
    else if (token && char === ':') {
      token += ':'
      tokens.push(token)
      token = ''
    }
    else if (token && char === ' ') {
      let following = ' '
      let i = cursor + 1
      let next = code[i]
      while (next === ' ') {
        following += ' '
        next = code[++ i]
      }

      if (next === ':') {
        token += following + ':'
        cursor = i
        tokens.push(token)
        token = ''
      }
      else {
        tokens.push(token)
        token = ''
        str = ' '
      }
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

export function parseJs(sourceCode) {
  const deps = []
  const imports = []
  const components = []
  const lines = sourceCode
    .replace(/import([\w\W]*?)from\s*?['"]sfc:(.+?)['"][;\n$]/gmi, (_, declares, src) => {
      if (src.indexOf('.') === 0 || src.indexOf('/') === 0) {
        components.push([declares.trim(), src])
      }
      deps.push([declares.trim(), src])
      return ''
    })
    .replace(/const (.+?)\s*?=\s*?await\s*?import\(['"]sfc:(.+?)['"]\)[;\n$]/gmi, (_, declares, src) => {
      deps.push([declares.trim(), src])
      return ''
    })
    .replace(/import([\w\W]*?)from\s*?['"](.+?)['"][;\n$]/gmi, (_, declares, src) => {
      imports.push([declares.trim(), src])
      return ''
    })

  const scripts = lines.split('\n').reduce((lines, current) => {
    const last = lines[lines.length - 1]
    const isCurrentEmpty = !current.trim()
    if (!last && isCurrentEmpty) {
      return lines
    }

    if (!last) {
      lines.push(current)
      return lines
    }

    const isLastEmpty = !last.trim()
    if (isLastEmpty && isCurrentEmpty) {
      return lines
    }

    lines.push(current)
    return lines
  }, []).join('\n')

  const tokens = tokenize(scripts)

  const vars = {}
  const createReactive = (code) => {
    return code.replace(/let(.*?)=([\w\W]+?);$/, (_, name, value) => {
      const varName = name.trim()
      vars[varName] = 1
      const varValue = value.trim()
      const varExp = varValue[0] === '{' ? `(${varValue})` : varValue
      return `let ${varName} = SFC.reactive(() => ${varExp});`
    })
  }
  const createUpdate = (code) => {
    return code.replace(/(.*?)=([\w\W]+?);$/, (_, name, value) => {
      const varName = name.trim()
      const varValue = value.trim()
      return `${varName} = SFC.update(${varName}, () => ${varValue});`
    })
  }

  let code = ''
  for (let i = 0, len = tokens.length; i < len; i ++) {
    const token = tokens[i]

    // declare
    if (token === 'let') {
      const localScope = []
      const start = ['(', '[', '{']
      const end = [')', ']', '}']
      let reactive = token

      i ++
      let next = tokens[i]
      if (vars[next]) {
        next = `SFC.consume(${next})`
      }
      reactive += next

      while (1) {
        if (i >= len) {
          code += createReactive(reactive)
          break
        }

        // 结束标记
        if (!localScope.length && next === ';') {
          code += createReactive(reactive)
          break
        }

        if (start.includes(next)) {
          localScope.push(next)
        }
        else if (end.includes(next)) {
          const index = end.indexOf(next)
          const latest = localScope[localScope.length - 1]

          if (latest !== start[index]) {
            throw new Error(`${start[index]} 尚未关闭 at ${i} ${tokens[i - 1]} ${token} ${tokens[i + 1]}`)
          }

          localScope.pop()
        }

        i ++
        next = tokens[i]
        if (vars[next]) {
          next = `SFC.consume(${next})`
        }
        reactive += next
      }
    }
    // update
    else if (
      vars[token.trim()]
      && (
        (tokens[i + 1]?.trim() === '=' && tokens[i + 2]?.trim() !== '=')
        || (MODIFIERS.includes(tokens[i + 1]))
      )
    ) {
      const localScope = []
      const start = ['(', '[', '{']
      const end = [')', ']', '}']
      let updator = token

      i ++
      let next = tokens[i]
      updator += next

      while (1) {
        if (i >= len) {
          code += createUpdate(updator)
          break
        }

        // 结束标记
        if (!localScope.length && next === ';') {
          code += createUpdate(updator)
          break
        }

        if (start.includes(next)) {
          localScope.push(next)
        }
        else if (end.includes(next)) {
          const index = end.indexOf(next)
          const latest = localScope[localScope.length - 1]

          if (latest !== start[index]) {
            throw new Error(`${start[index]} 尚未关闭 at ${i} ${tokens[i - 1]} ${token} ${tokens[i + 1]}`)
          }

          localScope.pop()
        }

        i ++
        next = tokens[i]
        if (vars[next]) {
          updator += `SFC.consume(${next})`
        }
        else {
          updator += next
        }
      }
    }
    // 一元操作
    else if (vars[token.trim()] && OPERATORS.includes(tokens[i + 1])) {
      i ++
      const operator = tokens[i]
      const varname = token.trim()

      const exp = `${varname} = SFC.update(${varname}, () => { let _${varname} = SFC.consume(${varname}); return ${operator} _${varname} });`
      code += exp
    }
    // consume
    else if (vars[token]) {
      const next = `SFC.consume(${token})`
      code += next
    }
    // normal
    else {
      code += token
    }
  }

  return {
    imports,
    deps,
    components: components.reduce((obj, curr) => {
      const [name, src] = curr
      obj[name] = src
      return obj
    }, {}),
    vars,
    code,
  }
}
