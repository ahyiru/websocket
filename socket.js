
const socket = require('socket.io');

const rmArr=(arr,item,key='ip')=>{
  let newArr=[];
  arr.map((v,k)=>{
    if(v[key]!==item){
      newArr.push(v);
    }
  });
  return newArr;
};

const addArr=(arr,item)=>{
  let hasIp=false;
  arr.map((v,k)=>{
    if(v.ip===item.ip){
      hasIp=true;
    }
  });
  !hasIp&&(arr.push(item));
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

    socket.on('new user',(name)=>{
      console.log(`[${name}] 已上线！`);
      userInfo.name=name;
      onlineUsers=addArr(onlineUsers,userInfo);
      io.sockets.emit('user joined',{
        username:name||userInfo.ip,
        users:onlineUsers,
      });
    });
    socket.on('disconnect',(name)=>{
      onlineUsers=rmArr(onlineUsers,userInfo.ip);
    });
    socket.on('logout',(name)=>{
      onlineUsers=rmArr(onlineUsers,name,'name');
      console.log(`[${name}] 已下线！`);
      io.sockets.emit('user left',{
        username:name||userInfo.name,
        users:onlineUsers,
      });
    });
    socket.on('break out',(name)=>{
      onlineUsers=rmArr(onlineUsers,name,'name');
      console.log(`[${name}] 已被剔除！`);
      io.sockets.emit('user left',{
        username:name||userInfo.name,
        users:onlineUsers,
      });
      io.sockets.emit('break out',name);
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













