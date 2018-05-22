import * as React from 'react';

import './test.less';

import {Row,Col,Button,Input,tools} from 'yrui';

const {$storage,$notify}=tools;

const displayName=$storage.get('displayName');

const socket = require('socket.io-client')('http://localhost:8000');

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

export default class Demo10 extends React.Component {
  messages=[];
  t=0;
  state={
    join:'',
    left:'',
    onlineUsers:[],
    username:'',
    msg:'',
    msgs:[],
    val:'',
    displayname:'',

    outName:'',
  };
  
  componentDidMount(){
    if(displayName){
      socket.emit('new user',displayName);
      this.onEvents();
    }
  }
  onEvents=()=>{
    socket.on('user joined',(data)=>{
      noty(data.username+' 已上线！');
      this.setState({
        join:data.username,
        onlineUsers:data.users,
      });
    });
    socket.on('new message',(data)=>{
      this.messages.push(data);
      this.setState({
        msgs:this.messages,
      });
      let msgDiv:any=this.refs.msg;
      msgDiv.scrollTop=msgDiv.scrollHeight;
    });
    socket.on('user left',(data)=>{
      console.log('data',data);
      noty(data.username+' 已下线！',true);
      this.setState({
        left:data.username,
        onlineUsers:data.users,
      });
      if(displayName==data.username){
        $storage.rm('displayName');
        location.reload();
      }
    });
    socket.on('break out',(name)=>{
      noty(name+' 已被管理员踢除！',true);
      if(displayName==name){
        $storage.rm('displayName');
        location.reload();
      }
    });

    socket.on('test111',(data)=>{
      console.log(data);
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
        alert('请输入文本!');
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
      alert('请输入文本!');
    }
  };
  enterName=()=>{
    const {displayname}=this.state;
    if(displayname&&displayname!=='huy1'){
      $storage.set('displayName',displayname);
      location.reload();
      // window.location.href=window.location.href.split('?')[0]+'?time='+((new Date()).getTime());
    }else{
      alert('昵称不合法！');
    }
  };
  setName=(v)=>{
    this.setState({
      displayname:v.target.value,
    });
  };
  logout=()=>{
    socket.emit('logout',displayName);
    $storage.rm('displayName');
    location.reload();
    // window.location.href=window.location.href.split('?')[0]+'?time='+((new Date()).getTime());
  };

  breakOut=()=>{
    const {outName}=this.state;
    socket.emit('break out',outName);
  };
  changeName=(v)=>{
    this.setState({
      outName:v.target.value,
    });
  };

  render() {
    const {join,left,onlineUsers,username,msg,msgs,val,displayname,outName}=this.state;
    const showMsgs=(data)=>{
      return data.map((v,k)=>{
        return <h4 key={`msg-${k}`}><b>{v.username}:</b>
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
              <div className="msg-panel">
                <h2>聊天窗口</h2>
                <div ref="msg" className="msg-content">
                  {showMsgs(msgs)}
                </div>
              </div>
              <Input placeholder="请输入..." pright="发送" prClick={this.send} onKeyUp={this.enter} value={val} change={this.change} />
              {msg&&<h4><b>{username}</b>:{msg}</h4>}
            </Col>
            <Col span={2} />
            <Col span={2}>
              <Button text="退出" color="warning" click={this.logout} />
              {displayName==='huy'&&<Input placeholder="踢除昵称" pright="踢除" prClick={this.breakOut} value={outName} change={this.changeName} />}
              <div className="users">
                <h4>在线用户</h4>
                <p>在线人数: 
                  <b className="danger"> {onlineUsers.length} 人</b>
                </p>
                {
                  onlineUsers.map((v,k)=>{
                    return <p key={`online${k}`} className="green">{v.name}</p>;
                  })
                }
              </div>
            </Col>
          </Row>
          :
          <Row gutter={8}>
            <Col span={4} offset={4}>
              <Input placeholder="输入昵称" value={displayname} change={this.setName} />
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
