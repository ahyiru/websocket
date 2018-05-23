import * as React from 'react';

import './test.less';

import {Row,Col,Button,Input,tools} from 'yrui';

const {$storage,$notify,$fetch}=tools;

const displayName=$storage.get('displayName');

const socket = require('socket.io-client')('http://192.168.0.105:8000/');//本机IP地址

const imgUrl=`http://192.168.0.105:8008`;

const noty=(info,out=false)=>{
  let data={
    txt:info,
    pos:'bottom-right',
    color:'success',
  };
  if(out){
    data={
      txt:info,
      pos:'top-right',
      color:'danger',
    };
  }
  $notify.start(data);
};
const noty1=(data)=>{
  Notification.requestPermission().then(function(result){
    let n=new Notification('来自yiru的通知',{
      body:data.username+' 说:'+(data.msg||'图片'),
      icon:require('./img/usr.jpg'),
    }); 
  });
};

const hasItem=(arr,name)=>{
  let hasName=false;
  arr.map((v,k)=>{
    if(v['name']===name){
      hasName=true;
    }
  });
  return hasName;
};

export default class Demo10 extends React.Component {
  messages=[];
  displayname='';
  outName='';
  t=0;
  state={
    onlineUsers:[],
    username:'',
    msg:'',
    msgs:[],
    val:'',
    displayname:'',
    imgUrl:'',

    outName:'',
  };
  
  componentDidMount(){
    this.onEvents();
    if(displayName){
      socket.emit('new user',displayName);
      socket.emit('get users');
    }
  }
  onEvents=()=>{
    socket.on('get users',(data)=>{
      this.setState({
        onlineUsers:data.users,
      });
    });
    socket.on('user joined',(data)=>{
      if(!displayName){
        if(data.success){
          $storage.set('displayName',data.username);
          location.reload();
          // noty(data.msg);
        }else{
          noty(data.msg,true);
        }
      }
    });
    socket.on('new message',(data)=>{
      noty1(data);
      this.messages.push(data);
      this.setState({
        msgs:this.messages,
      });
      let msgDiv:any=this.refs.msg;
      msgDiv.scrollTop=msgDiv.scrollHeight;
    });
    socket.on('user left',(data)=>{
      console.log('data',data);
      noty(data.msg,true);
      noty1(data);
      this.setState({
        onlineUsers:data.users,
      });
      if(displayName==data.username){
        $storage.rm('displayName');
        location.reload();
      }
    });
    socket.on('msg tips',(data)=>{
      console.log(data)
      noty(data.msg);
      noty1(data);
    });
  };
  componentWillUnmount(){
    clearTimeout(this.t);
    socket.disconnect();
    this.setState=(state,callback)=>{
      return;
    };
  }
  change=(v)=>{
    this.setState({
      val:v.target.value,
    });
  };
  submit=()=>{
    socket.emit('new message',this.state.val);
  }
  enter=(e)=>{
    if(e.keyCode===13){
      if(this.state.val){
        socket.emit('new message',{
          msg:this.state.val,
          name:displayName,
        });
        this.setState({
          val:'',
        });
      }else{
        noty('请输入文本!',true);
      }
    }
  };
  send=(e)=>{
    if(this.state.val){
      socket.emit('new message',{
        msg:this.state.val,
        name:displayName,
      });
      this.setState({
        val:'',
      });
    }else{
      noty('请输入文本!',true);
    }
  };
  enterName=()=>{
    if(this.displayname){
      socket.emit('new user',this.displayname);
    }else{
      noty('昵称不能为空!',true);
    }
  };
  setName=(v)=>{
    this.displayname=v.target.value;
  };
  logout=()=>{
    socket.emit('logout',displayName);
    $storage.rm('displayName');
    location.reload();
    // window.location.href=window.location.href.split('?')[0]+'?time='+((new Date()).getTime());
  };

  breakOut=()=>{
    socket.emit('break out',this.outName);
  };
  changeName=(v)=>{
    this.outName=v.target.value;
  };

  selectImg=()=>{
    const fl:any=this.refs.imgUp;
    const file=fl.files[0];
    if(file){
      if(!/image\/\w+/.test(file.type)){
        alert('只能发图片，滚。');
        this.setState({
          imgUrl:null,
        });
        return false;
      }
      if(file.size>10*1024*1024){
        alert('文件太大，滚。');
        this.setState({
          imgUrl:null,
        });
        return false;
      }
      let reader=new FileReader();
      reader.readAsDataURL(file);
      reader.onload=(e)=>{
        let data:any=e.target; 
        this.setState({
          imgUrl:data.result,
          imgName:file.name,
          imgType:file.type,
        });
      };
    }
  };
  sendImg=()=>{
    $fetch.post('/fileup',{
      data:JSON.stringify({
        imgUrl:this.state.imgUrl,
        imgName:this.state.imgName,
      }),
    }).then((data)=>{
      // console.log(data);
      socket.emit('new message',{
        img:imgUrl+'/'+data.result,
        name:displayName,
      });
      this.setState({
        val:'',
      });
    }).catch((err)=>{
      // console.log(err);
      socket.emit('new message',{
        img:imgUrl+'/'+err.result,
        name:displayName,
      });
      this.setState({
        val:'',
      });
    });
  };

  render() {
    const {onlineUsers,username,msg,msgs,val,outName,imgUrl}=this.state;
    const showMsgs=(data)=>{
      return data.map((v,k)=>{
        const cls=v.username==displayName?'current':'';
        return <h4 className={cls} key={`msg-${k}`}><b>{v.username}</b>
          {v.msg&&<span>{v.msg}</span>}
          {v.img&&<img src={v.img} />}
        </h4>;
      });
    };
    return (
      <div className="test">
        {
          displayName?
          <Row gutter={8}>
            <Col span={8}>
            {displayName==='huy'&&<div className="mb"><Input placeholder="踢除昵称" pright="踢除" prClick={this.breakOut} value={outName} change={this.changeName} /></div>}
              <div className="msg-panel">
                <h2>聊天窗口</h2>
                <div ref="msg" className="msg-content">
                  {showMsgs(msgs)}
                </div>
              </div>
              <Input placeholder="请输入..." pright="发送" prClick={this.send} onKeyUp={this.enter} value={val} change={this.change} />
              <div className="upload">
                <div className="select-img">
                  <input ref="imgUp" type="file" onChange={this.selectImg} />
                  <Button text="发送图片" color="info" />
                </div>
                {
                  imgUrl&&<div className="send-img">
                    <img src={imgUrl} />
                    <Button text="发送" color="success" pullRight click={this.sendImg} />
                  </div>
                }
              </div>
              {msg&&<h4><b>{username}</b>:{msg}</h4>}
            </Col>
            <Col span={1} />
            <Col span={3}>
              <div className="mb"><Button text="退出" color="warning" click={this.logout} /></div>
              <div className="users">
                <h4>在线用户</h4>
                <p>在线人数: 
                  <b className="danger"> {onlineUsers.length} 人</b>
                </p>
                {
                  onlineUsers.map((v,k)=>{
                    if(v.name==='huy'){
                      return <p key={`online${k}`} className="green"><img src={require('./img/usr.jpg')} />{v.name}</p>;
                    }
                    return <p key={`online${k}`} className="green">{v.name}</p>;
                  })
                }
              </div>
            </Col>
          </Row>
          :
          <Row gutter={8}>
            <Col span={4} offset={4}>
              <Input placeholder="输入昵称" change={this.setName} />
            </Col>
            <Col span={4} offset={4}>
              <Button text="进入" color="info" block click={this.enterName} />
            </Col>
          </Row>
        }
      </div>
    );
  }
}
