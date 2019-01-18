const baseConfig = require('./webpack.config');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  ...baseConfig,
  mode: 'production',
  entry: ["./src/CqlParser.ts"],
  plugins: [
    new UglifyJsPlugin()
  ]
};
