// const WebSocket = require('ws');

// // 创建WebSocket服务器实例，监听3000端口
// const wss = new WebSocket.Server({ port: 3000 });

// // 监听连接事件
// wss.on('connection', function connection(ws) {
//   console.log('Client connected');

//   // 监听消息事件
//   ws.on('message', function incoming(message) {
//     console.log('received: %s', message);

//     // 收到消息后将其原样发送回客户端
//     ws.send(message);
//   });

//   // 监听关闭事件
//   ws.on('close', function close() {
//     console.log('Client disconnected');
//   });
// });

// console.log('WebSocket server running at ws://localhost:3000/');

// const WebSocket = require("ws");

// const wss = new WebSocket.Server({ port: 3000 });

// wss.on("connection", function connection(ws) {
//   console.log("Client connected");

//   ws.on("message", function incoming(message) {
//     console.log("received: %s", message);

//     // 解析消息
//     let parsedMessage;
//     try {
//       parsedMessage = JSON.parse(message);
//     } catch (error) {
//       console.error("Error parsing message:", error);
//       return;
//     }

//     // 处理消息（示例：如果收到的是心跳消息，则忽略）
//     if (parsedMessage.type === "heartbeat") {
//       console.log("Received heartbeat");
//       return;
//     }

//     // 发送消息给客户端
//     ws.send(JSON.stringify({ type: "chat", text: parsedMessage.text }));
//   });

//   ws.on("close", function close() {
//     console.log("Client disconnected");
//   });
// });

// console.log("WebSocket server running at ws://localhost:3000/");

const WebSocket = require("ws");

const HEARTBEAT_INTERVAL = 5000; // 心跳间隔（毫秒）
const CLIENT_TIMEOUT = 15000; // 客户端超时时间（毫秒）

const wss = new WebSocket.Server({ port: 3000 });

wss.on("connection", function connection(ws) {
  console.log("Client connected");

  let heartbeatInterval;

  let messageCounter = 0;
  const intervalId = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ type: "msg", text: messageCounter });
      ws.send(message);
      messageCounter++;
    } else {
      clearInterval(intervalId);
    }
  }, 2000); // 每2秒发送一条消息

  // 客户端心跳检测
  function heartbeat() {
    clearInterval(heartbeatInterval);
    heartbeatInterval = setInterval(() => {
      if (ws.isAlive === false) {
        // console.log("Client is not responding. Attempting to reconnect...");
        console.log("Client is not responding.");
        // 如果客户端由于网络，宕机等原因停止，服务端就停止wsocket连接
        return ws.terminate();
      } else {
        // 如果客户端仍然存活，发送心跳消息
        ws.isAlive = false;
        ws.ping();
        console.log("ping~~");
      }
    }, HEARTBEAT_INTERVAL);
  }

  ws.isAlive = true;

  // 监听来自客户端的消息
  ws.on("message", function incoming(message) {
    console.log("received: %s", message);

    // 解析消息
    let parsedMessage;
    try {
      parsedMessage = JSON.parse(message);
    } catch (error) {
      console.error("Error parsing message:", error);
      return;
    }

    // 处理消息（示例：如果收到的是心跳消息，则更新客户端状态）
    if (parsedMessage.type === "heartbeat") {
      // console.log("Received heartbeat");
      ws.isAlive = true;
      return;
    }

    // 发送消息给客户端
    ws.send(JSON.stringify({ type: "chat", text: parsedMessage.text }));
  });

  // 监听心跳消息
  ws.on("pong", function heartbeatResponse() {
    console.log("pong received");
    ws.isAlive = true;
  });

  // 启动心跳检测
  heartbeat();

  // 监听连接关闭事件
  ws.on("close", function close() {
    console.log("Client disconnected");
    clearInterval(heartbeatInterval);
    clearInterval(intervalId);
  });
});

console.log("WebSocket server running at ws://localhost:3000/");
