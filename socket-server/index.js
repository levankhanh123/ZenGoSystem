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

    // Tham gia vào phòng chat dựa trên cuoc_tro_chuyen_id
    socket.on('join_room', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room: ${roomId}`);
    });

    // Nhận tin nhắn và phát lại cho các thành viên trong phòng
    socket.on('send_message', (data) => {
        // data cần có cuoc_tro_chuyen_id để biết phòng tương ứng
        io.to(data.cuoc_tro_chuyen_id).emit('receive_message', data);
        console.log(`Message sent to room ${data.cuoc_tro_chuyen_id}`, data);
    });

    // Lắng nghe sự kiện từ Laravel hoặc Client (thông báo chung)
    socket.on('send_notification', (data) => {
        io.emit('receive_notification', data); // Gửi tới tất cả client
    });

    socket.on('disconnect', () => {
        console.log('Người dùng ngắt kết nối:', socket.id);
    });
});

server.listen(3001, () => console.log('Socket Server chạy tại cổng 3001'));