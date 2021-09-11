import {
  parseHtmlToAst,
  // traverseAst as traverseHtmlAst,
} from 'abs-html'
import { each, camelcase, clearHtml } from '../utils'
import { tokenize } from './js-parser'

export function parseHtml(sourceCode, components, givenVars) {
  const html = clearHtml(sourceCode.trim())
  const htmlAst = parseHtmlToAst(html)

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

  let code = '() => {return '

  // DROP 通过clearHtml解决了
  // traverseHtmlAst(htmlAst, {
  //   '[[String]]': {
  //     enter(node, parent, index) {
  //       if (!parent) {
  //         return
  //       }
  //       // 去掉所有换行逻辑
  //       if (/^\n[\s\n]*$/.test(node)) {
  //         parent.splice(index, 1)
  //       }
  //       else if (/^\n.*?\n$/.test(node)) {
  //         const str = node.substring(1, node.length - 1)
  //         parent[index] = str
  //       }
  //     },
  //   },
  // })

  const interpolate = (str) => {
    const res = str.replace(/{{(.*?)}}/g, (_, $1) => {
      return '${' + consumeVars($1) + '}'
    })
    if (str === res) {
      return `'${str}'`
    }
    return '`' + res + '`'
  }

  const create = (obj, type) => {
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
        events.push([k, `event => {${value}}`])
      }
      else if (/^\(.*?\)$/.test(key)) {
        const k = key.substring(1, key.length - 1)
        if (k === 'if') {
          directives.push(['visible', value])
          args.push(null)
        }
        else if (k === 'repeat') {
          const matched = value.match(/^(.+?)(,(.+?))?in (.+?)$/);
          if (!matched) {
            throw new Error(`repeat 语法不正确 repeat="item,index in items"`)
          }

          const [, _item, , _index, _items] = matched
          const [item, index, items] = [_item.trim(), _index ? _index.trim() : null, _items.trim()]
          directives.push(['repeat', `{items:${items},item:'${item}'${index ? `,index:'${index}'` : ''}}`, true])
          args.push(...[item, index].filter(item => !!item))
        }
        else if (k === 'key') {
          directives.push(['key', value])
        }
        else if (k === 'class') {
          directives.push(['class', value])
        }
        else if (k === 'style') {
          directives.push(['style', value])
        }
        else if (k === 'await') {
          const matched = value.match(/^(\w+)(\.then\((\w+)\))?(\.catch\((\w+)\))?(\.finally\((\w+)\))?$/);
          if (!matched) {
            throw new Error(`await 语法不正确 await="promise.then(data).catch(error).finally(result)"`)
          }

          const [, _promise, , _data, , _error, , _result] = matched
          const [promise, data, error, result] = [_promise, _data, _error, _result].map(item => item ? item.trim() : null)
          directives.push(['await', `{promise:${promise}${data ? `,data:'${data}'` : ''}${error ? `,error:'${error}'` : ''}${result ? `,result:'${result}'` : ''}}`, true])
          args.push(...[data, error, result].filter(item => !!item))
        }
        else if (k === 'bind') {
          const allows = ['input', 'textarea', 'select']
          if (!allows.includes(type)) {
            throw new Error(`bind 不能在 ${type} 上使用，只限于 ${allows.join(',')}`)
          }

          directives.push(['bind', `[SFC.consume(${value}), v => SFC.update(${value}, () => v)]`, true, true])
        }
      }
      else {
        const v = createValue()
        attrs.push([key, v])
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
      let res = `${name}:(${finalArgsStr}) => ({`
      res += info.map(([key, value]) => `${key}:${value}`).join(',')
      res += '})'
      return res
    }).concat(directives.map((item) => {
      const [name, value, nonArgs, nonVar] = item
      const exp = nonVar ? value : consumeVars(value, finalArgsMap)
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
      [data, args] = create(props, type)
    }

    const subArgs = args.filter(item => !!item).join(',')
    const subArgsStr = subArgs ? `{${subArgs}}` : ''

    if (children.length && children.some(item => !!item)) {
      each(children, (child) => {
        if (typeof child === 'string') {
          const text = interpolate(child)
          const node = `SFC.t(() => ${text})`
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

    const inner = subs.length ? `(${subArgsStr}) =>` + `[${subs.join(',')}]` : null
    const params = [component, data, inner].filter(item => !!item)
    const code = `SFC.h(${params.join(',')})`
    return code
  }

  code += build(htmlAst)
  code += ';}'

  return code
}
