
const socket = require('socket.io');

const rmArr=(arr,item,key='name')=>{
  let newArr=[];
  arr.map((v,k)=>{
    if(v[key]!=item){
      newArr.push(v);
    }
  });
  return newArr;
};

const addArr=(arr,item,key='name')=>{
  let hasItem=false;
  arr.map((v,k)=>{
    if(v[key]==item[key]){
      hasItem=true;
    }
  });
  if(hasItem){
    return null;
  }
  arr.push(item);
  return arr;
};

module.exports=function(server){
  const io = socket(server);
  let onlineUsers=[];
  io.on('connection',(socket)=>{
    let userInfo={
      id:socket.id,
      ip:socket.handshake.headers['x-forwarded-for']||socket.handshake.address.split(':')[3]||'QQ小冰',
      ua:socket.handshake.headers['user-agent'],
    };
    socket.on('get users',()=>{
      io.sockets.emit('get users',{
        users:onlineUsers,
      });
    });
    socket.on('new user',(name)=>{
      userInfo.name=name;
      const newArr=addArr(onlineUsers,userInfo);
      let msg=`[${name}] 已上线！`;
      let success=true;
      if(!newArr){
        msg=`用户名 [${name}] 已存在！`;
        success=false;
      }
      console.log(msg);
      onlineUsers=newArr||onlineUsers;
      socket.emit('user joined',{
        username:name||userInfo.ip,
        users:onlineUsers,
        success:success,
        msg:msg,
      });
      if(success){
        io.sockets.emit('msg tips',{
          msg:msg,
        });
      }
    });
    socket.on('disconnect',(name)=>{
      onlineUsers=rmArr(onlineUsers,userInfo.ip);
    });
    socket.on('logout',(name)=>{
      onlineUsers=rmArr(onlineUsers,name,'name');
      const msg=`[${name}] 已下线！`;
      console.log(msg);
      io.sockets.emit('user left',{
        username:name||userInfo.name,
        users:onlineUsers,
        msg:msg,
      });
    });
    socket.on('break out',(name)=>{
      onlineUsers=rmArr(onlineUsers,name,'name');
      const msg=`[${name}] 已被管理员踢除！`;
      console.log(msg);
      io.sockets.emit('user left',{
        username:name||userInfo.name,
        users:onlineUsers,
        msg:msg,
      });
      // io.sockets.emit('break out',name);
    });
    socket.on('new message',(msg)=>{
      io.sockets.emit('new message',{
        username:msg.name||userInfo.name,
        msg:msg.msg,
        img:msg.img,
      });
    });
  });
};













