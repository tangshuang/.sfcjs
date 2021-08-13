// import { parse as parseJs } from '@babel/parser'
import parseCssAst from './css-parser'
import { parseHtmlToAst, traverseAst as traverseHtmlAst } from 'abs-html'
import { clear, each, camelcase } from './utils'
import { tokenizer as tokenizeJs } from './js-parser'
import { prettyCode } from './code-prettier'

function parseJs(sourceCode) {
  const deps = []
  const imports = []
  const components = []
  const lines = clear(sourceCode)
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

  const scriptCode = prettyCode(scripts)
  const tokens = tokenizeJs(scriptCode)

  const createReactive = (code) => {
    return code.replace(/let(.*?)=([\w\W]+?);$/, (_, name, value) => {
      return `let ${name.trim()} = SFCJS.reactive(${value.trim()}, () => ${name.trim()});`
    })
  }

  let code = ''
  for (let i = 0, len = tokens.length; i < len; i ++) {
    const token = tokens[i]

    if (token === 'let') {
      const localScope = []
      const start = ['(', '[', '{']
      const end = [')', ']', '}']
      let reactive = token

      i ++
      let next = tokens[i]
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
        // TODO 需要支持不使用分号结尾的脚本
        if (!localScope.length && next === '\n') {
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
        reactive += next
      }
    }
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
    code,
  }
}

function parseCss(sourceCode, source) {
  const ast = parseCssAst(sourceCode, { source })
  let code = 'function(r) {'

  const { stylesheet = {} } = ast
  const { rules = [] } = stylesheet
  const fnsSections = []
  const sections = []
  each(rules, (rule) => {
    if (rule.type === 'fns') {
      fnsSections.push(rule)
    }
    else {
      sections.push(rule)
    }
  })

  const createName = (name) => {
    const str = name.replace(/\[\[(.*?)\]\]/g, '${$1}')
    return name === str ? `'${str}'` : '`' + str + '`'
  }
  const createValue = (value) => {
    const wrapped = value.replace(/^\('\{\{(.*?)\}\}'\)$/, '[[$1]]').trim()
    const interpolated = wrapped.replace(/\[\[(.*?)\]\]/g, '${$1}')
    const real = interpolated === wrapped ? `'${wrapped}'`
      : /^\$\{.*?\}$/.test(interpolated) ? wrapped.substring(2, wrapped.length - 2) : '`' + interpolated + '`'
    return real
  }
  const createProps = (declarations) => {
    const properties = []
    each(declarations, ({ property, value }) => {
      if (property === 'fns') {
        const fns = value.split(/,\s*?(?=\w+\()/).map((invoker) => {
          const [name, paramsStr = ''] = invoker.split(/(?=\()/)
          const paramsT = paramsStr.trim()
          const params = paramsT.substring(1, paramsT.length - 1).split(',')
            .map(item => item.trim())
            .map(item => createValue(item))
          return `${name}(${params.join(',')})`
        })
        properties.push({ fns })
        return
      }

      const prop = camelcase(property)
      properties.push({
        name: prop,
        value: createValue(value),
      })
    })
    return properties
  }
  const createRule = (section) => {
    const { selectors, declarations } = section
    const properties = createProps(declarations)

    const name = createName(selectors.join(','))
    let rule = `r(${name},`

    const props = []
    each(properties, (item) => {
      const { name, value, fns } = item
      if (fns) {
        if (props.length) {
          rule += `{${props.join(',')}},`
          props.length = 0
        }
        rule += fns.join(',')
      }
      else {
        props.push(`${name}: ${value}`)
      }
    })

    if (props.length) {
      rule += `{${props.join(',')}}`
    }

    rule += ')'

    return rule
  }

  const fnsMapping = {}
  each(fnsSections, ({ rules }) => {
    each(rules, (rule) => {
      const { selectors, declarations } = rule
      const exp = selectors[0]
      const [name, params] = exp.split(/(?=\()/)
      const properties = createProps(declarations)
      const fn = `const ${name} = ${params} => ({ ${properties.map(({ name, value }) => `${name}:${value}`).join(',')} })`
      fnsMapping[name] = fn
    })
  })
  const fns = Object.values(fnsMapping)

  const css = []
  let inIf = ''
  each(sections, (section) => {
    const { type } = section
    if (type === 'if') {
      if (inIf) {
        throw new Error('@if不允许嵌套')
      }

      const { condition, rules } = section
      inIf = createValue(condition) + '?'
      const rule = rules.map(createRule).join(',')
      inIf += rules.length > 1 ? `[${rule}]`
        : rules.length === 1 ? rule
        : 'null'

      return
    }
    if (type === 'elseif') {
      if (!inIf) {
        throw new Error('@elseif必须跟在@if后面')
      }

      const { condition, rules } = section
      inIf += `:${createValue(condition)}?`
      const rule = rules.map(createRule).join(',')
      inIf += rules.length > 1 ? `[${rule}]`
        : rules.length === 1 ? rule
        : 'null'

      return
    }
    if (type === 'else') {
      if (!inIf) {
        throw new Error('@else必须跟在@if后面')
      }

      const { rules } = section
      const rule = rules.map(createRule).join(',')
      inIf += ':'
      inIf += rules.length > 1 ? `[${rule}]`
        : rules.length === 1 ? rule
        : 'null'

      css.push(inIf)
      inIf = ''

      return
    }

    // 直接结束if
    if (inIf) {
      inIf += ':null'
      css.push(inIf)
      inIf = ''
    }

    if (type === 'for') {
      const { items, item, index, rules } = section
      const rule = `...${items}.map((${item},${index}) => [${rules.map(createRule).join(',')}])`
      css.push(rule)
      return
    }

    if (type === 'rule') {
      const rule = createRule(section)
      css.push(rule)
      return
    }
  })

  code += fns.join(';') + ';'

  code += `return [${css.join(',')}];`

  code += '}'
  return code
}

function parseHtml(sourceCode, components) {
  const htmlAst = parseHtmlToAst(sourceCode.trim())

  let code = 'function(h) {return '
  traverseHtmlAst(htmlAst, {
    '*': {
      enter(node, parent) {
        // 去掉所有换行逻辑
        if (typeof node === 'string' && /\n\s*/.test(node)) {
          const index = parent.indexOf(node)
          parent.splice(index, 1)
        }
      },
    },
  })

  const interpolate = (str) => {
    const res = str.replace(/{{(.*?)}}/g, '${$1}')
    if (str === res) {
      return "'" + str + "'"
    }
    return '`' + res + '`'
  }

  const create = (obj) => {
    const attrs = []
    const props = []
    const events = []
    const directives = []
    const args = []
    each(obj, (value, key) => {
      const v = value && typeof value === 'object' ? create(value)
        : typeof vlaue === 'string' ? interpolate(value)
        : value
      if (key.indexOf(':') === 0) {
        const realKey = key.substr(1)
        const k = camelcase(realKey)
        props.push([k, v])
      }
      else if (key.indexOf('@') === 0) {
        const k = key.substr(1)
        events.push([k, `event => ${v}`])
      }
      else if (/^\(.*?\)$/.test(key)) {
        const k = key.substring(1, key.length - 1)

        if (k === 'if') {
          directives.push(['visible', value])
          args.push(null)
        }
        else if (k === 'repeat') {
          const [left, items] = value.split(' of ').map(item => item.trim())
          const [item, index] = left.split(',').map(item => item.trim())

          directives.push(['repeat', `{items:${items},item:'${item}',index:'${index}'}`])
          args.push(item, index)
        }
        else if (k === 'await') {
          const [promise, data] = value.split(' then ')
          directives.push(['await', `{await:${promise},data:'${data}'}`])
          args.push(data)
        }
      }
      else {
        attrs.push([key, `'${v}'`])
      }
    })

    const inner = [
      ['props', props],
      ['attrs', attrs],
      ['events', events],
    ].map((item) => {
      const [name, info] = item
      if (!info.length) {
        return
      }
      let res = name + ': {'
      res += info.map(([key, value]) => `${key}: ${value}`).join(',')
      res += '}'
      return res
    }).concat(directives.map((item) => {
      const [name, value] = item
      return `${name}: ${value}`
    })).filter(item => !!item).join(',')

    if (!inner) {
      return ''
    }

    return [`{${inner}}`, args]
  }

  const build = (astNode) => {
    const [type, props, ...children] = astNode

    let attrs = ''
    let args = []
    let subs = []

    if (props) {
      [attrs, args] = create(props)
    }

    if (children.length && children.some(item => !!item)) {
      each(children, (child) => {
        if (typeof child === 'string') {
          const node = interpolate(child)
          subs.push(node)
        }
        else {
          const node = build(child)
          subs.push(node)
        }
      })
    }

    const componentName = camelcase(type, true)
    const component = components && components[componentName] ? componentName : `'${type}'`

    const isNeedFn = !!args.length
    const subArgs = args.filter(item => !!item).join(',')
    const subArgsStr = subArgs ? `{${subArgs}}` : ''
    const inner = subs.length ? (isNeedFn ? `(${subArgsStr}) =>` : '') + (subs.length > 1 ? `[${subs.join(',')}]` : subs[0]) : null
    const params = [component, attrs, inner].filter(item => !!item)
    const code = `h(${params.join(',')})`
    return code
  }

  code += build(htmlAst)
  code += ';}'

  return code
}

export function parseComponent(text, source) {
  let jsSource = null
  let cssCode = null

  const html = text
    .replace(/<script.*?>([\w\W]*?)<\/script>\n?/gmi, (_, sourceCode) => {
      jsSource = parseJs(sourceCode, source)
      return ''
    })
    .replace(/<style>([\w\W]*?)<\/style>\n?/gmi, (_, sourceCode) => {
      cssCode = parseCss(sourceCode, source)
      return ''
    })
    .trim()

  const { imports, deps, code: jsCode, components } = jsSource
  const htmlCode = parseHtml(html, components)

  return {
    imports,
    deps,
    jsCode,
    cssCode,
    htmlCode,
  }
}

export function genComponent({ imports, deps, jsCode, cssCode, htmlCode }, source) {
  const output = [
    ...imports.map(([vars, src]) => `import ${vars} from "${src}";`),
    `SFCJS.define("${source}", [${deps.map(([, src]) => `"${src}"`).join(', ')}], function(${deps.map(([name]) => `${name}`).join(', ')}) {`,
    jsCode,
    `  return {style:${cssCode},render:${htmlCode}}`,
    '});',
  ].join('\n')
  return output
}

export function compileComponent(text, source) {
  const start = performance.now()
  const asts = parseComponent(text, source)
  const code = genComponent(asts, source)
  const res = prettyCode(code)
  const end = performance.now()
  console.log(res, 'cost time:', end - start)
  return res
}

export function loadComponent(src) {
  return fetch(src).then(res => res.text()).then(text => compileComponent(text, src))
}
