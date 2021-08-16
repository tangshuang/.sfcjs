import { parseCss } from './css-parser'
import { parseJs } from './js-parser'
import { parseHtml } from './html-parser'
import { clearComments } from '../utils'

export function parseComponent(text, source, options = {}) {
  let jsSource = {}
  let cssCode = undefined

  const html = text
    .replace(/<script.*?>([\w\W]*?)<\/script>\n?/gmi, (_, sourceCode) => {
      sourceCode = clearComments(sourceCode)
      const jsSourceCode = options.prettyJs ? options.prettyJs(sourceCode) : sourceCode
      jsSource = parseJs(jsSourceCode)
      return ''
    })
    .replace(/<style>([\w\W]*?)<\/style>\n?/gmi, (_, sourceCode) => {
      sourceCode = clearComments(sourceCode)
      const cssSourceCode = options.prettyCss ? options.prettyCss(sourceCode) : sourceCode
      cssCode = parseCss(cssSourceCode, source)
      cssCode = options.prettyCss ? options.prettyCss(cssCode) : cssCode
      return ''
    })
    .trim()

  const { imports, deps, code: jsCode, components } = jsSource

  const htmlSource = options.prettyHtml ? options.prettyHtml(html) : html
  const htmlCode = htmlSource ? parseHtml(htmlSource, components) : undefined

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
    ...imports.map(([vars, src]) => `import ${vars} from "${src}";`),
    `SFCJS.define("${source}", [${deps.map(([, src]) => `"${src}"`).join(', ')}], async function(${deps.map(([name]) => `${name}`).join(', ')}) {`,
    jsCode,
    'return {',
    cssCode ? `style:${cssCode},` : '',
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
