import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { getSocketClient } from '../../lib/socketClient';

const QUICK_MESSAGES = [
    "Tôi đang đến lấy hàng.",
    "Tôi đã đến nơi, bạn vui lòng ra nhận hàng.",
    "Bạn có thể chờ tôi khoảng 5 phút được không?",
    "Xin lỗi, tôi không liên lạc được với bạn."
];

export default function ShipperChatModal({ isOpen, onClose, targetUserId, orderId, shopId, targetName }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [conversation, setConversation] = useState(null);
    const [socket, setSocket] = useState(null);
    const messagesEndRef = useRef(null);

    const currentUser = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (isOpen && (targetUserId || shopId)) {
            initiateChat();
            const s = getSocketClient();
            s.connect();
            setSocket(s);

            s.on('receive_message', (message) => {
                setMessages(prev => [...prev, message]);
                scrollToBottom();
            });

            return () => {
                s.off('receive_message');
                if (conversation) {
                    s.emit('leave_room', conversation.id);
                }
            };
        }
    }, [isOpen, targetUserId, shopId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const initiateChat = async () => {
        try {
            const payload = {
                loai_hoi_thoai: 'giao_hang',
                don_hang_id: orderId
            };
            if (shopId) payload.cua_hang_id = shopId;
            else payload.target_user_id = targetUserId;

            const res = await axios.post('/api/chat/initiate', payload, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            if (res.data.success) {
                const conv = res.data.data;
                setConversation(conv);
                fetchMessages(conv.id);
                
                // Gia nhập phòng socket
                const s = getSocketClient();
                s.emit('join_room', conv.id);
            }
        } catch (error) {
            console.error('Error initiating chat:', error);
            if (error.response?.status === 403) {
                alert('Không thể chat. Đơn hàng này đã hoàn thành hoặc thất bại quá 24h.');
                onClose();
            }
        }
    };

    const fetchMessages = async (id) => {
        try {
            const res = await axios.get(`/api/chat/${id}/messages`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.data.success) {
                setMessages(res.data.data);
                scrollToBottom();
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleSendMessage = async (text) => {
        if (!text.trim() || !conversation) return;

        try {
            const res = await axios.post(`/api/chat/${conversation.id}/messages`, {
                noi_dung: text,
                loai_tin_nhan: 'text'
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            if (res.data.success) {
                const sentMessage = res.data.data;
                socket.emit('send_message', sentMessage);
                setNewMessage('');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            if (error.response?.status === 403) {
                alert('Hội thoại này đã bị khóa do đơn hàng đã kết thúc.');
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-end justify-center sm:items-center p-0 sm:p-4 transition-all duration-300">
            <div className="bg-slate-50 w-full sm:w-[400px] h-[85vh] sm:h-[600px] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
                {/* Header */}
                <div className="bg-yellow-500 text-white p-4 flex items-center justify-between shadow-sm z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center font-bold border-2 border-yellow-300">
                            {targetName ? targetName.charAt(0) : '?'}
                        </div>
                        <div>
                            <h3 className="font-bold text-sm leading-tight">{targetName}</h3>
                            <p className="text-[10px] text-yellow-100 font-medium">Chat giao hàng (Mã ĐH: #{orderId})</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-yellow-600 rounded-full hover:bg-yellow-700 transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-slate-50">
                    {!conversation ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        messages.map(msg => {
                            const isMe = msg.nguoi_gui_id === currentUser?.id;
                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] p-3 rounded-2xl text-sm shadow-sm ${isMe ? 'bg-yellow-500 text-white rounded-br-sm' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm'}`}>
                                        {msg.noi_dung}
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Messages */}
                <div className="bg-slate-100 p-2 border-t border-slate-200 flex gap-2 overflow-x-auto no-scrollbar">
                    {QUICK_MESSAGES.map((qm, idx) => (
                        <button 
                            key={idx}
                            onClick={() => handleSendMessage(qm)}
                            className="whitespace-nowrap px-4 py-2 bg-white border border-slate-300 rounded-full text-xs font-medium text-slate-700 active:bg-yellow-50 active:text-yellow-700 shadow-sm"
                        >
                            {qm}
                        </button>
                    ))}
                </div>

                {/* Input Area */}
                <div className="bg-white p-3 sm:p-4 border-t border-slate-200">
                    <form 
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSendMessage(newMessage);
                        }} 
                        className="flex gap-2"
                    >
                        <input 
                            type="text" 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Nhập tin nhắn..." 
                            className="flex-1 px-4 py-3 bg-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                        />
                        <button 
                            type="submit" 
                            disabled={!newMessage.trim()} 
                            className="w-12 h-12 bg-yellow-500 text-white rounded-full flex items-center justify-center disabled:opacity-50 shadow-md active:scale-95 transition"
                        >
                            <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
