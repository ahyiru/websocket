var path=require('path');
var fs=require('fs');
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

var cors=require('cors');
var logger=require('morgan');
var bodyParser=require('body-parser');
app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json({limit:'5mb'}));
app.use(bodyParser.urlencoded({limit:'5mb',extended:true}));
var compression=require('compression');
app.use(compression());
if(app.get('env')==='production'){
  app.use(function(req,res,next) {
    var protocol=req.get('x-forwarded-proto');
    protocol=='https'?next():res.redirect('https://'+req.hostname+req.url);
  });
}

const server=app.listen(8000);

require('./imgServer');
require('./socket')(server);
app.post('/fileup',function(req,res){
  let img=req.body.imgUrl;
  let name=req.body.imgName;
  let base64Data=img.replace(/^data:image\/\w+;base64,/,'');
  let dataBuffer=new Buffer(base64Data,'base64');
  let filename=path.join(__dirname,'./img/'+name);
  fs.writeFile(filename,dataBuffer,function(err){
    if(err){
      // return res.send({result:path.join(__dirname,'./img/usr.jpg')});
      return res.send({result:name});
    }
    console.log('保存成功！')
    res.send({result:name});
  });
});
