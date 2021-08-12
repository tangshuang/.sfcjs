import { disableScriptTags, transform as transformJs, registerPlugin } from '@babel/standalone'
import { parse as parseCss } from 'css'
import { parseHtmlToAst, traverseAst } from 'abs-html'

disableScriptTags()

function compileComponent(text) {
  const html = text
    .replace(/<script.*?>([\w\W]*?)<\/script>\n?/gmi, (_, sourceCode) => {
      const { code, ast } = transformJs(sourceCode)
      return ''
    })
    .replace(/<style.*?>([\w\W]*?)<\/style>\n?/gmi, (_, sourceCode) => {
      const { stylesheet } = parseCss(sourceCode)
      return ''
    })
  const htmlAst = parseHtmlToAst(html)
  traverseAst(htmlAst, {
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
}

function loadComponent(src) {
  fetch(src).then(res => res.text()).then(compileComponent)
}

export const SFCJS = Object.freeze({
  modules: {},
  define(name, deps, fn) {
    this.modules[name] = {
      name,
      deps,
      fn,
    }
  },
  setup() {

  },
})
