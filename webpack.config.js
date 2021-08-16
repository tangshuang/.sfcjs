const { DefinePlugin } = require('webpack')

const mode = process.env.NODE_ENV === 'production' ? 'production' : 'none'
const devtool = mode === 'production' ? 'source-map' : undefined

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
    plugins: [
      new DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      }),
    ],
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
    plugins: [
      new DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      }),
    ],
  },
]
