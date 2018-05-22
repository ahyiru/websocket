import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {Router} from 'yrui';
import 'font-awesome/css/font-awesome.css';
import 'yrui/lib/yrui.css';

import Test from './test';

const app={
  brand:{
    title:'websocket',
  },
  routers:[{
	  url:'/',
	  component:Test,
	  name:'websocket',
	  icon:'home',
	  // noMenu:true,
	  noFrame:true,
	}],
};

ReactDOM.render(<Router {...app} />, document.getElementById('phoenix'));


