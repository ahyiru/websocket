

import Test from './test';

const routers=[{
  url:'/',
  component:Test,
  name:'websocket',
  icon:'home',
}];

export const app={
  brand:{
    title:'websocket',
  },
  routers:routers,
};