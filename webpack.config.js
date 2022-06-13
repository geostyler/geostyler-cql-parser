module.exports = {
  entry: './src/CqlParser.ts',
  mode: 'development',
  output: {
    filename: 'CqlParser.js',
    path: __dirname + '/browser',
    library: 'GeoStylerCqlParser'
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    alias: {
      fs: path.resolve('node_modules/graceful-fs')
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        include: /src/,
        loader: 'ts-loader'
      }
    ]
  }
};
