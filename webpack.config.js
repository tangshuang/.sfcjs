const { DefinePlugin } = require('webpack')

const mode = process.env.NODE_ENV === 'production' ? 'production' : 'none'
const devtool = mode === 'production' ? 'source-map' : undefined
const alias = {
  'ts-fns': __dirname + '/node_modules/ts-fns/es',
}
const defines = new DefinePlugin({
  'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
})
const fallback = {
}
const optimization = {
  usedExports: true,
  sideEffects: true,
}

module.exports = [
  {
    mode,
    devtool,
    target: 'web',
    entry: __dirname + '/src/index.js',
    output: {
      path: __dirname + '/dist',
      filename: 'index.js',
      library: 'SFCJS',
      libraryTarget: 'umd',
    },
    resolve: {
      alias,
      fallback,
    },
    plugins: [
      defines,
    ],
    optimization,
  },
  {
    mode,
    devtool,
    target: 'webworker',
    entry: __dirname + '/src/worker.js',
    output: {
      path: __dirname + '/dist',
      filename: 'worker.js',
    },
    resolve: {
      alias,
      fallback,
    },
    plugins: [
      defines,
    ],
    optimization,
  },
  {
    mode,
    devtool,
    target: 'webworker',
    entry: __dirname + '/src/tools.js',
    output: {
      path: __dirname + '/dist',
      filename: 'tools.js',
      library: 'Tools',
      libraryTarget: 'assign-properties',
    },
    resolve: {
      alias,
      fallback,
    },
    plugins: [
      defines,
    ],
    optimization,
  },
]
