const path = require('path')
const slsw = require('serverless-webpack')

module.exports = {
  entry: './src/index.js',
  // entry: slsw.lib.entries,
  output: {
    libraryTarget: 'commonjs',
    path: path.resolve(__dirname, 'dist/src'),
    filename: 'index.js'
  },
  mode: 'production',
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist')
    },
    port: 8080,
    hot: true
  }
}
