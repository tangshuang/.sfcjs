const { DefinePlugin } = require('webpack')

module.exports = {
  mode: 'none',
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
}
