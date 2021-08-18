import { parseHtmlToAst, traverseAst as traverseHtmlAst } from 'abs-html'
import { each, camelcase } from '../utils'
import { tokenize } from './js-parser'

export function parseHtml(sourceCode, components, givenVars) {
  const htmlAst = parseHtmlToAst(sourceCode.trim())

  const consumeVars = (code, vars = {}) => {
    const tokens = tokenize(code)
    const localVars = { ...givenVars, ...vars }
    each(tokens, (item, i) => {
      if (localVars[item]) {
        tokens[i] = `SFC.consume(${item})`
      }
    })
    const res = tokens.join('')
    return res
  }

  let code = 'function() {return '
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
    const res = str.replace(/{{(.*?)}}/g, (_, $1) => {
      return '${' + consumeVars($1) + '}'
    })
    if (str === res) {
      return str
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
      const createValue = () => value && typeof value === 'object' ? create(value)
        : typeof value === 'string' ? interpolate(value)
        : value

      if (key.indexOf(':') === 0) {
        const res = consumeVars(value)
        const realKey = key.substr(1)
        const k = camelcase(realKey)
        props.push([k, res])
      }
      else if (key.indexOf('@') === 0) {
        const k = key.substr(1)
        const v = createValue()
        events.push([k, `event => ${v}`])
      }
      else if (/^\(.*?\)$/.test(key)) {
        const k = key.substring(1, key.length - 1)
        if (k === 'if') {
          directives.push(['visible', value])
          args.push(null)
        }
        else if (k === 'repeat') {
          const matched = value.match(/^(.+?)(,(.+?))?of (.+?)$/);
          if (!matched) {
            throw new Error(`repeat 语法不正确`)
          }

          const [, item, , index = 'index', items] = matched
          directives.push(['repeat', `{items:${items.trim()},item:'${item.trim()}',index:'${index.trim()}'}`, true])
          args.push(item, index)
        }
        // else if (k === 'await') {
        //   const [promise, data] = value.split(' then ')
        //   directives.push(['await', `{await:${consumeVars(promise)},data:'${data}'}`])
        //   args.push(data)
        // }
        else if (k === 'keep-alive') {
          directives.push(['keepAlive', value])
        }
        else if (k === 'key') {
          directives.push(['key', value])
        }
      }
      else {
        const v = createValue()
        attrs.push([key, `'${v}'`])
      }
    })

    const finalArgs = args.filter(item => !!item).join(',')
    const finalArgsStr = finalArgs ? `{${finalArgs}}` : ''
    const finalArgsMap = args.filter(item => !!item).reduce((map, curr) => {
      map[curr] = 1
      return map
    }, {})

    const data = [
      ['props', props],
      ['attrs', attrs],
      ['events', events],
    ].map((item) => {
      const [name, info] = item
      if (!info.length) {
        return
      }
      let res = `${name}: (${finalArgsStr}) => ({`
      res += info.map(([key, value]) => `${key}:${value}`).join(',')
      res += '})'
      return res
    }).concat(directives.map((item) => {
      const [name, value, nonArgs] = item
      const exp = consumeVars(value, finalArgsMap)
      return `${name}:(${nonArgs ? '' : finalArgsStr}) => ${value[0] === '{' ? `(${exp})` : exp}`
    })).filter(item => !!item).join(',')

    return [data ? `{${data}}` : '', args]
  }

  const build = (astNode) => {
    const [type, props, ...children] = astNode

    let data = ''
    let args = []
    let subs = []

    if (props) {
      [data, args] = create(props)
    }

    if (children.length && children.some(item => !!item)) {
      each(children, (child) => {
        if (typeof child === 'string') {
          const node = interpolate(child)
          subs.push(`'${node}'`)
        }
        else {
          const node = build(child)
          subs.push(node)
        }
      })
    }

    const componentName = camelcase(type, true)
    const component = components && components[componentName] ? componentName : `'${type}'`

    const subArgs = args.filter(item => !!item).join(',')
    const subArgsStr = subArgs ? `{${subArgs}}` : ''
    const inner = subs.length ? `(${subArgsStr}) =>` + (subs.length > 1 ? `[${subs.join(',')}]` : subs[0]) : null
    const params = [component, data, inner].filter(item => !!item)
    const code = `SFC.h(${params.join(',')})`
    return code
  }

  code += build(htmlAst)
  code += ';}'

  return code
}
