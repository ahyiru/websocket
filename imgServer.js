var express = require('express');
var path=require('path');
var cors=require('cors');
var logger=require('morgan');
var bodyParser=require('body-parser');
var app = express();
// app.use(cors());
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
app.all('*',function(req,res,next){
  // res.header('Access-Control-Allow-Origin','*');
  res.header('Access-Control-Allow-Origin',req.headers.origin);
  res.header('Access-Control-Allow-Credentials','true');
  res.header('Access-Control-Allow-Headers','X-Requested-With,Authorization,Accept,Origin,Content-Type');
  res.header('Access-Control-Allow-Methods','PUT,POST,GET,DELETE,OPTIONS');
  res.header('X-Powered-By','3.2.1');
  res.header('Content-Type','application/json;charset=utf-8');
  if(req.method==='OPTIONS'){
    res.status(200).end();
  }else{
    next();
  }
});
app.use(express.static(path.join(__dirname, './img')));
app.listen(8008,(err)=>{
  if (err) {
    console.log(err);
  }
  console.log('图片服务已启动！');
});

