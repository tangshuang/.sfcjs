import { parseCss } from './css-parser'
import { parseJs } from './js-parser'
import { parseHtml } from './html-parser'
import { clearComments, resolveUrl } from '../utils'

export function parseComponent(text, source, options = {}) {
  let jsSource = {}
  let cssText = ''

  const html = text
    .replace(/<script.*?>([\w\W]*?)<\/script>\n?/gmi, (_, sourceCode) => {
      // sourceCode = clearComments(sourceCode)
      const jsSourceCode = options.prettyJs ? options.prettyJs(sourceCode) : sourceCode
      jsSource = parseJs(jsSourceCode)
      return ''
    })
    .replace(/<style>([\w\W]*?)<\/style>\n?/gmi, (_, sourceCode) => {
      // sourceCode = clearComments(sourceCode)
      cssText = options.prettyCss ? options.prettyCss(sourceCode) : sourceCode
      return ''
    })
    .trim()

  const { imports, deps, code: jsCode, components, vars } = jsSource

  const cssCode = cssText ? parseCss(cssText, source, vars) : undefined
  const htmlSource = options.prettyHtml ? options.prettyHtml(html) : html
  const htmlCode = htmlSource ? parseHtml(htmlSource, components, vars) : undefined

  return {
    imports,
    deps,
    jsCode,
    cssCode,
    htmlCode,
  }
}

export function genComponent({ imports = [], deps = [], jsCode, cssCode, htmlCode }, source, options = {}) {
  const output = [
    ...imports.map(([vars, src]) => `import ${vars} from "${resolveUrl(source, src)}";`),
    '\n',
    `SFCJS.define("${source}", [${deps.map(([, src]) => `"${src}"`).join(', ')}], async function(${deps.map(([name]) => `${name}`).join(', ')}) {`,
    'const SFC = this',
    jsCode,
    'return {',
    cssCode ? `dye:${cssCode},` : '',
    `render:${htmlCode || `() => null`}`,
    '}',
    '});',
  ].join('\n')
  const res = options.prettyJs ? options.prettyJs(output) : output
  return res
}

export function compileComponent(text, source, options) {
  const asts = parseComponent(text, source, options)
  const code = genComponent(asts, source, options)
  return code
}

export function loadComponent(source, options) {
  return fetch(source).then(res => res.text()).then(text => compileComponent(text, source, options))
}
