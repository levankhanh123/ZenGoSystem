import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { io } from "socket.io-client";
const socket = io("http://localhost:3001");

function App() {
    useEffect(() => {
        socket.on("receive_notification", (data) => {
            alert("Thông báo mới: " + data.message);
            // Cập nhật trạng thái đơn hàng hoặc tin nhắn tại đây
        });
    }, []);
}

export default App;
