
var express = require('express');
var webpack = require('webpack');
var webpackConfig = require('./webpack.config');

var webpackDevMiddleware=require('webpack-dev-middleware');
var webpackHotMiddleware=require('webpack-hot-middleware');

var app = express();
var compiler = webpack(webpackConfig);

app.use(webpackDevMiddleware(compiler, {
  hot: true,
  compress: true, 
  noInfo: true,
  stats: {
    colors: true,
  },
}));

app.use(webpackHotMiddleware(compiler));

const server=app.listen(8000);

require('./socket')(server);

