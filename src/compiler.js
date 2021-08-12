// import { parse as parseJs } from '@babel/parser'
import parseCssAst from './css-parser'
import { parseHtmlToAst, traverseAst as traverseHtmlAst } from 'abs-html'
import { clear } from './utils'

function parseJs(sourceCode) {
  const deps = []
  const imports = []
  const components = []
  const scripts = sourceCode
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

  const lines = scripts.split('\n').reduce((lines, current) => {
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
  }, [])

  let code = ''
  let reactive = ''

  const genReactive = () => {
    code += reactive.replace(/let\s+?(\w+?)\s*?=([\W\w]+?)[;\n$]/gmi, (_, name, value) => {
      return `let ${name} = SFCJS.reactive(${value.trim()}, () => ${name})`
    })
    code += '\n'
  }

  for (let i = 0, len = lines.length; i < len; i ++) {
    const line = lines[i]

    if (/^let\s+?\w+?\s*?=.*?;/.test(line.trim())) {
      code += line.replace(/let\s+?(\w+?)\s*?=(.*?);/, (_, name, value) => {
        return `let ${name} = SFCJS.reactive(${value.trim()}, () => ${name});`
      })
      code += '\n'
      continue
    }

    if (/^let\s+?\w+?\s*?=.*?$/.test(line.trim())) {
      reactive += line + '\n'

      for (++ i; i < len; i ++) {
        const nextLine = lines[i]
        const str = clear(nextLine)

        if (['let ', 'const ', 'var ', 'function', '[', '(', ';', 'async '].some(item => str.indexOf(item) === 0)) {
          genReactive()
          i --
          break
        }

        reactive += nextLine + '\n'

        if ([';', '}', ')'].includes(str[str.length - 1])) {
          genReactive()
          break
        }
      }
      console.log(reactive)

      continue
    }

    code += line + '\n'
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
