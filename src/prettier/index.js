import prettier from 'prettier/standalone'
import babel from 'prettier/parser-babel'

export function prettyJsCode(code) {
  return prettier.format(code, {
    singleQuote: true,
    trailingComma: 'none',
    bracketSpacing: true,
    parser: 'babel',
    plugins: [babel],
  })
}
