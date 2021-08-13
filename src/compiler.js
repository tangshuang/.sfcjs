// import { parse as parseJs } from '@babel/parser'
import parseCssAst from './css-parser'
import { parseHtmlToAst, traverseAst as traverseHtmlAst } from 'abs-html'
import { clear, padding, each, camelcase } from './utils'
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

  const tokens = tokenizeJs(scripts)
  const createReactive = (code) => {
    return code.replace(/let(.*?)=([\w\W]+?);$/, (_, name, value) => {
      return `let ${name.trim()} = SFCJS.reactive(${value.trim()}, () => ${name.trim()});\n`
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
    components,
    code,
  }
}

function parseCss(sourceCode, source) {
  const ast = parseCssAst(sourceCode, { source })
  let code = 'function(r) {\n'

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

      const propStr = createValue(property)
      const prop = camelcase(propStr)
      properties.push({
        name: prop,
        value: createValue(value),
      })
    })
    return properties
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

  const createRule = (section) => {
    const { selectors, declarations } = section
    const properties = createProps(declarations)

    let rule = `r('${selectors.join(',')}',`

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

  code += fns.join(';\n') + ';\n'

  code += `return [\n${css.join(',\n')}\n];\n`

  code += '}'
  return code
}

function parseHtml(sourceCode) {
  const htmlAst = parseHtmlToAst(sourceCode.trim())

  let code = 'function(h) {\nreturn '
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
    }).filter(item => !!item).join(',')

    if (!inner) {
      return ''
    }

    return `{${inner}}`
  }

  const build = (astNode) => {
    const [type, props, ...children] = astNode

    let attrs = ''
    let subs = []

    if (props) {
      attrs = create(props)
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

    const inner = subs.join(',\n')
    const params = [`'${type}'`, attrs, inner].filter(item => !!item)
    const code = `h(${params.join(',\n')})`
    return code
  }

  code += build(htmlAst)
  code += ';\n}'

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

  const htmlCode = parseHtml(html, source)
  const { imports, deps, code: jsCode, components } = jsSource

  return {
    imports,
    deps,
    components,
    jsCode,
    cssCode,
    htmlCode,
  }
}

export function genComponent({ imports, deps, components, jsCode, cssCode, htmlCode }, source) {
  const output = [
    ...imports.map(([vars, src]) => `import ${vars} from "${src}";`),
    `SFCJS.define("${source}", [${deps.map(([, src]) => `"${src}"`).join(', ')}], function(${deps.map(([name]) => `${name}`).join(', ')}) {`,
    jsCode,
    `  const components = {\n${components.map(([name]) => `    ${name}`).join(',\n')}\n  }`,
    `  return {\n    components,\n    style: ${cssCode},\n    render: ${htmlCode}\n  }`,
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
