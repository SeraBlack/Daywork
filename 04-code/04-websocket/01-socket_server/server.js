// 引入web socket服务
import { WebSocketServer } from 'ws';
// 创建web socket服务
const wss = new WebSocketServer({
  port: 8080 // 监听8080端口
});
// 监听客户端连接事件
wss.on('connection', (ws) => {
  // ws就是连接上的客户端对象
  // 接收客户端发送的消息
  ws.on('message', data => { 
    console.log(data.toString()) // 显示客户端发送过来的消息
    ws.send('服务端向客户端发送消息')
  })
})
 console.log('服务端启动成功')