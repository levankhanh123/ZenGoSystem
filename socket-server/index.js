const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "http://localhost:5173" } // Cổng của React Vite
});

io.on('connection', (socket) => {
    console.log('Người dùng kết nối:', socket.id);

    // Lắng nghe sự kiện từ Laravel hoặc Client
    socket.on('send_notification', (data) => {
        io.emit('receive_notification', data); // Gửi tới tất cả client
    });
});

server.listen(3001, () => console.log('Socket Server chạy tại cổng 3001'));