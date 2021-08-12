// import { parse as parseJs } from '@babel/parser'
import parseCss from './css-parser'
import { parseHtmlToAst, traverseAst as traverseHtmlAst } from 'abs-html'
import { each } from './utils'

function parseJs(sourceCode) {
  // const imports = []
  // const declares = []
  // const scripts = []

  // const lines = sourceCode.split('\n')
  // for (let i = 0, len = lines.length; i < len; i ++) {
  //   const line = lines[i]
  //   const words = line.split(' ')
  //   const firstWord = words.find(item => !!item)
  //   const isImport = words.some(item => item === 'import' || /import\(.+?\)/.test(item))
  //   const isDeclare = ['var', 'let', 'const', 'function'].includes(firstWord)

  //   if (isImport) {
  //     imports.push(line)
  //   }
  // }

  const deps = []
  const code = sourceCode
    .replace(/import([\w\W]*?)from\s*?['"]sfc:(.+?)['"][;\n$]/gmi, (_, declares, src) => {
      deps.push([declares.trim(), src])
      return ''
    })
    .replace(/const (.+?)\s*?=\s*?await\s*?import\(['"]sfc:(.+?)['"]\)[;\n$]/gmi, (_, declares, src) => {
      deps.push([declares.trim(), src])
      return ''
    })

  console.log(code, deps)

}

export function parseComponent(text) {
  let jsAst = null
  let cssAst = null
  const html = text
    .replace(/<script.*?>([\w\W]*?)<\/script>\n?/gmi, (_, sourceCode) => {
      jsAst = parseJs(sourceCode, {
        sourceType: "module",
        plugins: [
          'topLevelAwait',
          'classStaticBlock',
        ],
      })
      return ''
    }).replace(/<style>([\w\W]*?)<\/style>\n?/gmi, (_, sourceCode) => {
      // console.log(sourceCode.split('\n').map((item, i) => (i + 1) + '\t' + item).join('\n'))
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

  const deps = {}
  // const scope = {}
  // const deepth = {}

  // let jsCode
  // const traverse = (ast) => {
  //   each(ast, (key, value) => {})
  // }
  // console.log(jsAst)

  return {
    deps,
    jsAst,
    cssAst,
    htmlAst,
  }
}

export function genComponent(asts) {
  return asts
}

export function compileComponent(text) {
  const asts = parseComponent(text)
  const code = genComponent(asts)
  console.log(code)
  return code
}

export function loadComponent(src) {
  return fetch(src).then(res => res.text()).then(text => compileComponent(text, src))
}
