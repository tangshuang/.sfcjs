import { parseHtmlToAst, traverseAst as traverseHtmlAst } from 'abs-html'
import { each, camelcase } from '../utils'
import { tokenize } from './js-parser'

export function parseHtml(sourceCode, components, vars) {
  const htmlAst = parseHtmlToAst(sourceCode.trim())
  const consumeVars = (code) => {
    const tokens = tokenize(code)
    each(tokens, (item, i) => {
      if (vars[item]) {
        tokens[i] = `SFCJS.consume(${item})`
      }
    })
    const res = tokens.join('')
    return res
  }

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
          directives.push(['visible', consumeVars(value)])
          args.push(null)
        }
        else if (k === 'repeat') {
          const [left, items] = value.split(' of ').map(item => item.trim())
          const [item, index] = left.split(',').map(item => item.trim())

          directives.push(['repeat', `{items:${consumeVars(items)},item:'${item}',index:'${index}'}`])
          args.push(item, index)
        }
        else if (k === 'await') {
          const [promise, data] = value.split(' then ')
          directives.push(['await', `{await:${consumeVars(promise)},data:'${data}'}`])
          args.push(data)
        }
      }
      else {
        const v = createValue()
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
