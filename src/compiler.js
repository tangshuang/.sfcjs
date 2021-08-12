import { parse as parseJs } from '@babel/parser'
import travarseJsAst from '@babel/traverse'
import parseCss from './css-parser.js'
import { parseHtmlToAst, traverseAst as traverseHtmlAst } from 'abs-html'

export function parseComponent(text) {
  let jsAst = null
  let cssAst = null
  const html = text
    .replace(/<script.*?>([\w\W]*?)<\/script>\n?/gmi, (_, sourceCode) => {
      jsAst = parseJs(sourceCode, {
        sourceType: "module",
        plugins: [
          'typescript',
          'topLevelAwait',
          'classStaticBlock',
        ],
      })
      return ''
    }).replace(/<style>([\w\W]*?)<\/style>\n?/gmi, (_, sourceCode) => {
      console.log(sourceCode.split('\n').map((item, i) => (i + 1) + '\t' + item).join('\n'))
      cssAst = parseCss(sourceCode)
      return ''
    })
  const htmlAst = parseHtmlToAst(html.trim())

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

  // TODO
  const deps = {}
  travarseJsAst(jsAst, {
    enter() {},
    exit() {},
  })

  return {
    deps,
    jsAst,
    cssAst,
    htmlAst,
  }
}

export function genComponent(asts) {
  // TODO
  return asts
}

export function compileComponent(text) {
  const asts = parseComponent(text)
  const code = genComponent(asts)
  return code
}

export function loadComponent(src) {
  const url = window.location.href
  return fetch(src).then(res => res.text()).then(compileComponent)
}
