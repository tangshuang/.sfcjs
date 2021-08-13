// import { parse as parseJs } from '@babel/parser'
import parseCssAst from './css-parser'
import { parseHtmlToAst, traverseAst as traverseHtmlAst } from 'abs-html'
import { clear } from './utils'

function parseJs(sourceCode) {
  const deps = []
  const imports = []
  const components = []
  const lines = sourceCode
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

  const words = scripts.split(/ |(?=\()|(?={)|(?=\n)/)
  const tokens = []
  const reactive = []
  const createReactive = () => {
    const code = reactive.join(' ')
    return code.replace(/let(.*?)=([\w\W]+?)$/, (_, name, value) => {
      return `let ${name.trim()} = SFCJS.reactive(${value.trim()}, () => ${name});\n`
    })
  }
  for (let i = 0, len = words.length; i < len; i ++) {
    const word = words[i]
    if (word === 'let') {
      reactive.push(word)
      i ++
      let next = words[i]
      while (1) {
        if (i >= len) {
          break
        }

        if (['let', 'const', 'async', 'function', 'var', 'if', 'for', ';'].includes(next)) {
          tokens.push(createReactive())
          reactive.length = 0
          i --
          break
        }

        reactive.push(next)
        i ++
        next = words[i]
      }
    }
    else {
      tokens.push(word)
    }
  }

  const code = tokens.join(' ')

  return {
    imports,
    deps,
    components,
    code,
  }
}

function parseCss(sourceCode, source) {
  const ast = parseCssAst(sourceCode, { source })
  console.log(ast)
  let code = 'function(r) {\n'
  code += '}'
  return code
}

function parseHtml(sourceCode, source) {
  const htmlAst = parseHtmlToAst(sourceCode.trim())

  let code = 'function(h) {\n'
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
  console.log(htmlAst)
  code += '}'

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
    `  return {\n    components,\n    css: ${cssCode},\n    dom: ${htmlCode}\n  }`,
    '});',
  ].join('\n')
  return output
}

export function compileComponent(text, source) {
  const asts = parseComponent(text, source)
  const code = genComponent(asts, source)
  console.log(code)
  return code
}

export function loadComponent(src) {
  return fetch(src).then(res => res.text()).then(text => compileComponent(text, src))
}
