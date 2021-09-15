import { parse, generate } from '../babel'

export function prettyJs(code) {
  const ast = parse(code, {
    tokens: true,
    sourceType: 'module',
  })
  const output = generate(ast, {}, code)
  return output.code
}
