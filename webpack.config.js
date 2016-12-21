var path = require('path');

module.exports = {
  entry: './app/js/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist/'),
    publicPath: "/dist/"
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: "babel-loader",
      query: {
        presets: ['es2015']
      }
    }, {
      test: /\.css$/,
      loader: "style-loader!css-loader"
    }, {
      test: /\.scss$/,
      loaders: ["style", "css", "sass"]
    }, {
      test: /\.(woff|woff2|eot|ttf|svg)$/,
      loader: "url"
    }]
  },
};
