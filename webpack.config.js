var webpack = require('webpack');
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  devtool: 'eval',
  entry: {
    app: [ './app.js','webpack-hot-middleware/client'],
    commons:['react','react-dom'],
  },
  output: {
    path: path.resolve(__dirname, '_dist'),
    publicPath: '/',
    filename: 'js/[name]_[hash:8].js',
    chunkFilename:'js/[name]_[chunkhash:8].chunk.js',
    libraryTarget:'umd',
  },
  resolve: {
    extensions: ['.js','.jsx'],
  },
  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      loader:'babel-loader',
      exclude: /node_modules/,
    },{
      test: /\.css$/,
      use: ['style-loader','css-loader'],
    },{
      test: /\.less$/,
      use: ['style-loader', 'css-loader', 'less-loader'],
    },{
      test: /\.(ttf|eot|svg|woff|woff2|otf)/,
      loader: 'file-loader?name=fonts/[hash:8].[ext]',
    },{
      test: /\.(jpe?g|png|gif|psd|bmp|ico)/i,
      loader: 'file-loader?name=img/img_[hash:8].[ext]',
    }],
  },

  mode:process.env.NODE_ENV === 'production' ? 'production' : 'development',
  optimization:{
    minimize:true,
  },

  plugins: [
    new HtmlWebpackPlugin({
      title:'websocket',
      template: './index.html',
      favicon: './favicon.ico',
      inject: true,
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.HotModuleReplacementPlugin(),
  ],

};
