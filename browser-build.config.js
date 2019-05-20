const TerserPlugin = require('terser-webpack-plugin');
require("@babel/polyfill");

module.exports = {
  entry: [
    "@babel/polyfill",
    "./src/CqlParser.ts"
  ],
  mode: 'production',
  output: {
    filename: "CqlParser.js",
    path: __dirname + "/browser",
    library: "CqlParser"
  },
  resolve: {
    // Add '.ts' as resolvable extensions.
    extensions: [".ts", ".js", ".json"]
  },
  optimization: {
    minimizer: [
      new TerserPlugin()
    ]
  },
  module: {
    rules: [
      // All files with a '.ts'
      {
        test: /\.ts$/,
        include: __dirname + '/src',
        use: [
          {
            loader: require.resolve('ts-loader'),
          },
        ],
      }
    ]
  }
};
