module.exports = {
  entry: "./src/CqlParser.ts",
  mode: 'development',
  output: {
    filename: "CqlParser.js",
    path: __dirname + "/browser",
    library: "GeoStylerCqlParser"
  },
  resolve: {
    extensions: [".ts", ".js", ".json"]
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        include: /src/,
        loader: "awesome-typescript-loader"
      }
    ]
  }
};
