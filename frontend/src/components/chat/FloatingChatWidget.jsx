import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../services/axiosConfig';
import { getSocketClient } from '../../lib/socketClient';

const FloatingChatWidget = ({ user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const [isInitiating, setIsInitiating] = useState(false);
    const [socketConnected, setSocketConnected] = useState(false);
    const messagesEndRef = useRef(null);
    const activeConversationRef = useRef(null);

    useEffect(() => {
        activeConversationRef.current = activeConversation;
    }, [activeConversation]);

    useEffect(() => {
        if (!isOpen) return;

        const s = getSocketClient();
        setSocket(s);
        
        const onConnect = () => {
            console.log('Socket connected successfully');
            setSocketConnected(true);
            const currentId = user?.id || user?.nguoi_dung_id;
            if (currentId) {
                s.emit('join_room', `user.${currentId}`);
            }
        };

        const onDisconnect = () => {
            console.log('Socket disconnected');
            setSocketConnected(false);
        };

        const onReceiveMessage = (message) => {
            console.log('Received message via socket:', message);
            const activeId = activeConversationRef.current?.id;
            if (activeId && Number(message.hoi_thoai_id) === Number(activeId)) {
                setMessages(prev => {
                    if (prev.some(m => m.id === message.id)) return prev;
                    return [...prev, message];
                });
                setTimeout(scrollToBottom, 100);
            }
            fetchConversations();
        };

        s.on('connect', onConnect);
        s.on('disconnect', onDisconnect);
        s.on('receive_message', onReceiveMessage);

        if (!s.connected) {
            s.connect();
        } else {
            onConnect();
        }

        return () => {
            s.off('connect', onConnect);
            s.off('disconnect', onDisconnect);
            s.off('receive_message', onReceiveMessage);
        };
    }, [isOpen, user?.id, user?.nguoi_dung_id]);

    useEffect(() => {
        if (user) {
            fetchConversations();
        }
    }, [user]);

    useEffect(() => {
        if (activeConversation && socket) {
            socket.emit('join_room', activeConversation.id);
            fetchMessages(activeConversation.id);
            return () => {
                socket.emit('leave_room', activeConversation.id);
            };
        }
    }, [activeConversation, socket]);

    useEffect(() => {
        const handleOpenChat = (event) => {
            const { shopId, targetUserId, productId, loai = 'tu_van', productName, productImage } = event.detail;
            console.log('Received open-chat event:', event.detail);
            setIsOpen(true);
            if (shopId || targetUserId) {
                // Use a small timeout to ensure state transitions don't conflict
                setTimeout(() => {
                    initiateChat({ shopId, targetUserId, productId, loai, productName, productImage });
                }, 100);
            }
        };
        window.addEventListener('open-chat', handleOpenChat);
        return () => window.removeEventListener('open-chat', handleOpenChat);
    }, []); // Run once on mount

    const initiateChat = async ({ shopId, targetUserId, productId, loai, productName, productImage }) => {
        if (isInitiating) return;
        
        console.log('--- Initiate Chat Start ---');
        setIsInitiating(true);
        setIsOpen(true);
        setActiveConversation(null); 

        try {
            const context_data = productId ? { 
                san_pham_id: Number(productId),
                san_pham_ten: productName,
                san_pham_anh: productImage
            } : {};
            
            const payload = {
                loai_hoi_thoai: loai || 'tu_van',
                context_data
            };

            if (shopId) payload.cua_hang_id = Number(shopId);
            if (targetUserId) payload.target_user_id = Number(targetUserId);
            
            console.log('Sending initiate payload:', payload);
            
            const res = await axiosInstance.post('/chat/initiate', payload);

            console.log('Initiate response:', res.data);

            if (res.data.success) {
                const conv = res.data.data;
                console.log('Setting active conversation:', conv);
                setActiveConversation(conv);
                // Also fetch messages immediately to be sure
                if (conv.id) {
                    fetchMessages(conv.id);
                }
                fetchConversations(); 
                
                // Realtime sync for shop
                if (socket && conv.id) {
                    console.log('Emitting conversation_updated for shop:', conv.id);
                    socket.emit('conversation_updated', {
                        ...conv,
                        members: conv.members
                    });
                }
            } else {
                console.error('Failed to initiate chat:', res.data.message);
                alert('Không thể khởi tạo cuộc trò chuyện: ' + (res.data.message || 'Lỗi không xác định'));
            }
        } catch (error) {
            console.error('Error initiating chat:', error.response?.data || error.message);
            const errorMsg = error.response?.data?.message || error.message;
            alert('Lỗi khi kết nối với Shop: ' + errorMsg);
        } finally {
            console.log('--- Initiate Chat End ---');
            setIsInitiating(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchConversations = async () => {
        try {
            const res = await axiosInstance.get('/chat/conversations');
            if (res.data.success) {
                setConversations(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    };

    const fetchMessages = async (id) => {
        try {
            const res = await axiosInstance.get(`/chat/${id}/messages`);
            if (res.data.success) {
                setMessages(res.data.data);
                scrollToBottom();
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation) return;

        try {
            const res = await axiosInstance.post(`/chat/${activeConversation.id}/messages`, {
                noi_dung: newMessage,
                loai_tin_nhan: 'text'
            });

            if (res.data.success) {
                const sentMessage = res.data.data;
                
                // Thêm vào UI ngay lập tức (optimistic update)
                setMessages(prev => {
                    const exists = prev.some(m => m.id === sentMessage.id);
                    if (exists) return prev;
                    return [...prev, sentMessage];
                });
                scrollToBottom();

                // Phát message qua socket
                socket.emit('send_message', { 
                    ...sentMessage, 
                    members: activeConversation.members 
                });
                setNewMessage('');
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const currentId = Number(user?.id || user?.nguoi_dung_id);
    const convOtherMember = activeConversation?.members?.find(m => Number(m.nguoi_dung_id) !== currentId);

    if (!user) return null;

    return (
        <div className="fixed" style={{ bottom: '2rem', right: '2rem', zIndex: 9999, top: 'auto' }}>
            {/* Chat Button */}
            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                </button>
            )}

            {/* Chat Panel */}
            {isOpen && (
                <div className="bg-white rounded-2xl shadow-2xl w-80 md:w-96 flex flex-col overflow-hidden border border-slate-200" style={{ height: '500px' }}>
                    {/* Header */}
                    <div className="bg-blue-600 text-white p-4 flex items-center shadow-md">
                        {activeConversation && (
                            <button 
                                onClick={() => setActiveConversation(null)} 
                                className="mr-3 hover:text-blue-200 transition-colors p-1 -ml-1"
                                title="Quay lại"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        )}
                        <h3 className="font-semibold flex items-center gap-2 overflow-hidden flex-1">
                            {activeConversation ? (
                                <div className="flex items-center gap-2 truncate">
                                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border border-white/30 overflow-hidden">
                                        {(convOtherMember?.user?.cuaHang?.logo || convOtherMember?.user?.cua_hang?.logo) ? (
                                            <img src={convOtherMember?.user?.cuaHang?.logo || convOtherMember?.user?.cua_hang?.logo} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            (convOtherMember?.user?.cuaHang?.ten_cua_hang || convOtherMember?.user?.cua_hang?.ten_cua_hang || convOtherMember?.user?.ho_ten || 'S').charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <span className="truncate text-sm font-medium">{convOtherMember?.user?.cuaHang?.ten_cua_hang || convOtherMember?.user?.cua_hang?.ten_cua_hang || convOtherMember?.user?.ho_ten || 'Cửa hàng'}</span>
                                    <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-400' : 'bg-red-400'} shadow-[0_0_8px_rgba(74,222,128,0.5)]`}></div>
                                </div>
                            ) : (
                                <span className="text-base">Tin nhắn</span>
                            )}
                        </h3>
                        <button onClick={() => setIsOpen(false)} className="hover:text-blue-200 transition-colors p-1">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto bg-slate-50 flex flex-col">
                        {(() => {
                            if (isInitiating) {
                                return (
                                    <div className="flex-1 flex flex-col items-center justify-center p-4 text-slate-500">
                                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                                        <p className="text-sm">Đang kết nối với Shop...</p>
                                    </div>
                                );
                            }
                            
                            if (!activeConversation) {
                                return (
                                    <div className="p-2 space-y-1">
                                        {conversations
                                            .filter(conv => {
                                                const other = conv.members?.find(m => Number(m.nguoi_dung_id) !== currentId)?.user;
                                                return other?.cuaHang || other?.cua_hang;
                                            })
                                            .map(conv => {
                                                const otherUser = conv.members?.find(m => Number(m.nguoi_dung_id) !== currentId)?.user;
                                                const shop = otherUser?.cuaHang || otherUser?.cua_hang;
                                                
                                                return (
                                                    <div 
                                                        key={conv.id} 
                                                        onClick={() => setActiveConversation(conv)}
                                                        className="flex items-center gap-3 p-3 bg-white rounded-xl cursor-pointer hover:bg-slate-100 transition border border-slate-100"
                                                    >
                                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold shrink-0 overflow-hidden">
                                                            {shop?.logo ? (
                                                                <img src={shop.logo} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                (shop?.ten_cua_hang || otherUser?.ho_ten || '?').charAt(0).toUpperCase()
                                                            )}
                                                        </div>
                                                        <div className="flex-1 truncate">
                                                            <div className="font-medium text-sm text-slate-800">{shop?.ten_cua_hang || otherUser?.ho_ten || 'Cửa hàng'}</div>
                                                            <div className="text-xs text-slate-500 truncate">{conv.tin_nhan_cuoi || 'Bắt đầu trò chuyện'}</div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        {conversations.filter(conv => {
                                            const other = conv.members?.find(m => Number(m.nguoi_dung_id) !== currentId)?.user;
                                            return other?.cuaHang || other?.cua_hang;
                                        }).length === 0 && (
                                            <div className="text-center text-slate-500 text-sm mt-10 p-4">
                                                <div className="mb-2">📭</div>
                                                Bạn chưa có cuộc hội thoại nào với Shop
                                            </div>
                                        )}
                                    </div>
                                );
                            }

                            return (
                                <div className="flex flex-col p-4 gap-3">
                                    {/* Product Context Block (If available) */}
                                    {activeConversation.context_data?.san_pham_id && (
                                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-2 flex gap-2 items-center text-xs mb-2">
                                            {activeConversation.context_data.san_pham_anh ? (
                                                <img 
                                                    src={activeConversation.context_data.san_pham_anh} 
                                                    alt="" 
                                                    className="w-10 h-10 rounded object-cover" 
                                                />
                                            ) : (
                                                <div className="w-10 h-10 bg-slate-200 rounded flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-blue-800">Đang hỏi về sản phẩm</p>
                                                <p className="text-slate-600 truncate">{activeConversation.context_data.san_pham_ten || 'Sản phẩm này'}</p>
                                            </div>
                                        </div>
                                    )}

                                    {messages.map(msg => {
                                        const isMe = Number(msg.nguoi_gui_id) === currentId;
                                        return (
                                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${isMe ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm shadow-sm'}`}>
                                                    {msg.noi_dung}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>
                            );
                        })()}
                    </div>

                    {/* Input Area */}
                    {activeConversation && (
                        <div className="p-3 bg-white border-t border-slate-200">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Nhập tin nhắn..." 
                                    className="flex-1 px-4 py-2 rounded-full border border-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                                />
                                <button type="submit" disabled={!newMessage.trim()} className="bg-blue-600 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center disabled:opacity-50">
                                    <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FloatingChatWidget;
