const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { 
        origin: "*",
        methods: ["GET", "POST"]
    },
    transports: ['websocket', 'polling']
});

io.on('connection', (socket) => {
    console.log(`[${new Date().toLocaleTimeString()}] Client connected: ${socket.id}`);

    socket.on('join_room', (roomId) => {
        const room = String(roomId);
        socket.join(room);
        console.log(`[${socket.id}] Joined room: ${room}`);
    });

    socket.on('leave_room', (roomId) => {
        const room = String(roomId);
        socket.leave(room);
        console.log(`[${socket.id}] Left room: ${room}`);
    });

    socket.on('send_message', (data) => {
        const room = String(data.hoi_thoai_id);
        
        // Broadcast to conversation room
        socket.to(room).emit('receive_message', data);
        
        // Also emit to individual user rooms for notifications
        if (Array.isArray(data.members)) {
            data.members.forEach(m => {
                const userRoom = `user.${m.nguoi_dung_id}`;
                io.to(userRoom).emit('receive_message', data);
            });
        }
        
        console.log(`[${socket.id}] Message in ${room}`);
    });

    socket.on('error', (error) => {
        console.error(`[${socket.id}] Socket Error:`, error);
    });

    socket.on('disconnect', (reason) => {
        console.log(`[${new Date().toLocaleTimeString()}] Client disconnected: ${socket.id} (${reason})`);
    });
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`=============================================`);
    console.log(`   SOCKET SERVER IS RUNNING ON PORT ${PORT}   `);
    console.log(`=============================================`);
});