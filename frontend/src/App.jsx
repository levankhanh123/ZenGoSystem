import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import SellerDashboard from './components/SellerDashboard/SellerDashboard';
import SellerRegistration from './components/SellerRegistration';
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

function App() {
    useEffect(() => {
        socket.on("receive_notification", (data) => {
            alert("Thông báo mới: " + data.message);
            // Cập nhật trạng thái đơn hàng hoặc tin nhắn tại đây
        });
        
        return () => {
             socket.off("receive_notification");
        };
    }, []);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/seller-dashboard" element={<SellerDashboard />} />
                <Route path="/seller-registration" element={<SellerRegistration />} />
                <Route path="*" element={<Navigate to="/seller-dashboard" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
