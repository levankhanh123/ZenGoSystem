import React, { useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import './SellerChat.css';

const SOCKET_URL = 'http://localhost:3001';
const API_BASE_URL = 'http://localhost:8000/api';
// Giả định Shop ID = 1 (Seller ID)
const SHOP_ID = 1;

// Khởi tạo socket connection (tránh bị re-render liên tục)
const socket = io(SOCKET_URL);

const SellerChat = () => {
    const [chats, setChats] = useState([]);
    const [messagesByChat, setMessagesByChat] = useState({});
    const [activeChatId, setActiveChatId] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const messagesEndRef = useRef(null);

    // Fetch initial chat data
    useEffect(() => {
        fetchConversations();

        // Listen for incoming incoming messages over Socket
        const handleReceiveMessage = (data) => {
            console.log('Received real-time message via socket:', data);
            
            setMessagesByChat(prev => {
                const roomMessages = prev[data.cuoc_tro_chuyen_id] || [];
                // Check dupes (so we don't render our own message twice if socket bounces back to sender)
                if (roomMessages.find(m => m.id === data.id)) return prev;
                
                return {
                    ...prev,
                    [data.cuoc_tro_chuyen_id]: [...roomMessages, data]
                };
            });

            setChats(prevChats => prevChats.map(c => {
                if (c.id === data.cuoc_tro_chuyen_id) {
                    return { 
                        ...c, 
                        lastMessage: data.noi_dung, 
                        unread: (activeChatId !== data.cuoc_tro_chuyen_id) ? (c.unread || 0) + 1 : 0 
                    };
                }
                return c;
            }));
        };

        socket.on('receive_message', handleReceiveMessage);

        return () => {
            socket.off('receive_message', handleReceiveMessage);
        };
    }, [activeChatId]);

    const fetchConversations = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/chat/conversations/${SHOP_ID}`);
            const formattedChats = res.data.map(c => ({
                id: c.id,
                name: c.nguoi_nhan_vai_tro === 'admin' ? 'Hỗ trợ Zengo (Admin)' : (c.nguoi_nhan_ten || `Khách hàng (ID: ${c.nguoi_mua_id})`),
                isAdmin: c.nguoi_nhan_vai_tro === 'admin',
                lastMessage: c.tin_nhan && c.tin_nhan.length > 0 ? c.tin_nhan[0].noi_dung : 'Chưa có tin nhắn',
                unread: 0,
                avatar: c.nguoi_nhan_ten ? c.nguoi_nhan_ten.charAt(0) : 'C'
            }));
            setChats(formattedChats);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    };

    const fetchMessages = async (roomId) => {
        try {
            const res = await axios.get(`${API_BASE_URL}/chat/messages/${roomId}`);
            setMessagesByChat(prev => ({
                ...prev,
                [roomId]: res.data
            }));
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleSelectChat = (roomId) => {
        setActiveChatId(roomId);
        
        // Gắn room vào socket server
        socket.emit('join_room', roomId);
        
        // Đánh dấu đã đọc
        setChats(prevChats => prevChats.map(c => 
            c.id === roomId ? { ...c, unread: 0 } : c
        ));

        // Fetch tin nhắn nếu chưa từng load
        if (!messagesByChat[roomId] || messagesByChat[roomId].length === 0) {
            fetchMessages(roomId);
        }
    };

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messagesByChat, activeChatId]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageInput.trim() || !activeChatId) return;

        const text = messageInput.trim();
        setMessageInput(''); // Xoá input ngay lập tức cho mượt UI

        try {
            // Bước 1: Lưu vào Database (Laravel)
            const res = await axios.post(`${API_BASE_URL}/chat/message`, {
                cuoc_tro_chuyen_id: activeChatId,
                nguoi_gui_id: SHOP_ID,
                noi_dung: text,
                loai_tin_nhan: 'text'
            });

            const dbMessage = res.data.data;

            // Bước 2: Emit Socket - Hiển thị realtime phía người nhận
            socket.emit('send_message', dbMessage);

            // Bước 3: Update UI Người Gửi (thêm vào context)
            setMessagesByChat(prev => ({
                ...prev,
                [activeChatId]: [...(prev[activeChatId] || []), dbMessage]
            }));

            // Cập nhật last message trong list view panel trái
            setChats(prevChats => prevChats.map(c => 
                c.id === activeChatId ? { ...c, lastMessage: text } : c
            ));

        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const activeChat = chats.find(c => c.id === activeChatId);
    const currentMessages = messagesByChat[activeChatId] || [];

    const sortedChats = [...chats].sort((a, b) => {
        if (a.isAdmin) return -1;
        if (b.isAdmin) return 1;
        return 0;
    });

    return (
        <div className="seller-chat-container">
            <div className="chat-layout">
                {/* Left Sidebar - Conversation List */}
                <div className="chat-sidebar">
                    <div className="chat-sidebar-header">
                        <h3>Tin nhắn</h3>
                        <div className="chat-search">
                            <input type="text" placeholder="Tìm kiếm tài khoản..." />
                        </div>
                    </div>
                    
                    <div className="chat-list">
                        {sortedChats.length === 0 && <div style={{padding: '20px', textAlign: 'center'}}>Đang tải cuộc trò chuyện...</div>}
                        {sortedChats.map(chat => (
                            <div 
                                key={chat.id} 
                                className={`chat-item ${activeChatId === chat.id ? 'active' : ''} ${chat.isAdmin ? 'admin-chat' : ''}`}
                                onClick={() => handleSelectChat(chat.id)}
                            >
                                <div className="chat-avatar">
                                    {chat.isAdmin ? <span className="admin-icon">🛡️</span> : chat.avatar}
                                </div>
                                <div className="chat-item-content">
                                    <div className="chat-item-header">
                                        <span className="chat-name">{chat.name}</span>
                                        {chat.time && <span className="chat-time">{chat.time}</span>}
                                    </div>
                                    <div className="chat-item-bottom">
                                        <span className={`chat-last-msg ${chat.unread > 0 ? 'unread' : ''}`}>
                                            {chat.lastMessage}
                                        </span>
                                        {chat.unread > 0 && <span className="chat-badge">{chat.unread}</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Area - Chat Window */}
                <div className="chat-main">
                    {activeChat ? (
                        <>
                            <div className="chat-main-header">
                                <div className="chat-avatar">
                                    {activeChat.isAdmin ? <span className="admin-icon">🛡️</span> : activeChat.avatar}
                                </div>
                                <div className="chat-header-info">
                                    <h4>{activeChat.name}</h4>
                                    <span className="status">Đang hoạt động</span>
                                </div>
                            </div>
                            
                            <div className="chat-messages-area">
                                {currentMessages.map(msg => {
                                    // Shop gửi (1) thì display right
                                    const isMe = String(msg.nguoi_gui_id) === String(SHOP_ID);
                                    
                                    // Formats the timestamp for display
                                    const msgTime = msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                                    return (
                                        <div key={msg.id} className={`message-wrapper ${isMe ? 'message-right' : 'message-left'}`}>
                                            {!isMe && (
                                                <div className="msg-avatar">
                                                    {activeChat.isAdmin ? '🛡️' : activeChat.avatar}
                                                </div>
                                            )}
                                            <div className="message-content">
                                                <div className={`message-bubble ${isMe ? 'my-bubble' : 'their-bubble'}`}>
                                                    {msg.noi_dung}
                                                </div>
                                                <span className="message-time">{msgTime}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            <form className="chat-input-area" onSubmit={handleSendMessage}>
                                <button type="button" className="chat-action-btn">📎</button>
                                <button type="button" className="chat-action-btn">📷</button>
                                <input 
                                    type="text" 
                                    placeholder="Nhập tin nhắn của bạn..." 
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                />
                                <button type="submit" className="chat-send-btn" disabled={!messageInput.trim()}>Gửi</button>
                            </form>
                        </>
                    ) : (
                        <div className="no-chat-selected">
                            <div className="no-chat-icon">💬</div>
                            <p>Chọn một cuộc trò chuyện để bắt đầu</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SellerChat;
