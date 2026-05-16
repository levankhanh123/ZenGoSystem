import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../../services/axiosConfig';
import { getSellerSocketClient } from '../../../lib/socketClient';
import { useAuth } from '../../../contexts/Authcontext';
import { useSellerSession } from '../../../contexts/SellerSessionContext';

const QUICK_RESPONSES = [
    "ZenGo Shop chào bạn, sản phẩm này hiện vẫn còn hàng ạ!",
    "Dạ, bạn cần hỗ trợ thêm thông tin gì về sản phẩm ạ?",
    "Cảm ơn bạn đã quan tâm đến sản phẩm của shop. Đơn hàng sẽ được giao trong 2-3 ngày tới.",
    "Rất tiếc sản phẩm này hiện tại đã hết màu/size bạn chọn."
];

export default function SellerChat() {
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [filter, setFilter] = useState('all'); // all, unread
    const [socket, setSocket] = useState(null);
    const [socketConnected, setSocketConnected] = useState(false);
    const messagesEndRef = useRef(null);

    const { user: authUser } = useAuth();
    const { selectedUser } = useSellerSession();
    
    // Identify current seller robustly
    const currentUser = selectedUser || authUser || JSON.parse(localStorage.getItem('user'));
    const currentUserId = Number(currentUser?.id || currentUser?.nguoi_dung_id);
    
    const activeConversationRef = useRef(null);

    useEffect(() => {
        activeConversationRef.current = activeConversation;
    }, [activeConversation]);

    useEffect(() => {
        if (!currentUserId) return;

        fetchConversations();
        const s = getSellerSocketClient();
        setSocket(s);

        const onConnect = () => {
            console.log('Seller socket connected');
            setSocketConnected(true);
            s.emit('join_room', `user.${currentUserId}`);
        };

        const onDisconnect = () => {
            console.log('Seller socket disconnected');
            setSocketConnected(false);
        };

        const onReceiveMessage = (message) => {
            console.log('Seller received message via socket:', message);
            if (activeConversationRef.current && Number(message.hoi_thoai_id) === Number(activeConversationRef.current.id)) {
                setMessages(prev => {
                    if (prev.some(m => m.id === message.id)) return prev;
                    return [...prev, message];
                });
                setTimeout(scrollToBottom, 100);
            }
            fetchConversations();
        };

        const onConversationUpdated = (updatedConv) => {
            console.log('Seller received conversation update:', updatedConv);
            
            // 1. Update the conversation in the sidebar list
            setConversations(prev => prev.map(c => 
                Number(c.id) === Number(updatedConv.id) ? { ...c, ...updatedConv } : c
            ));

            // 2. If this is the active conversation, update its data (especially context_data)
            if (activeConversationRef.current && Number(updatedConv.id) === Number(activeConversationRef.current.id)) {
                setActiveConversation(prev => ({ ...prev, ...updatedConv }));
            }
        };

        s.on('connect', onConnect);
        s.on('disconnect', onDisconnect);
        s.on('receive_message', onReceiveMessage);
        s.on('conversation_updated', onConversationUpdated);

        if (!s.connected) {
            s.connect();
        } else {
            onConnect();
        }

        return () => {
            s.off('connect', onConnect);
            s.off('disconnect', onDisconnect);
            s.off('receive_message', onReceiveMessage);
            s.off('conversation_updated', onConversationUpdated);
        };
    }, [currentUserId]);

    useEffect(() => {
        if (activeConversation && socket) {
            socket.emit('join_room', activeConversation.id);
            fetchMessages(activeConversation.id);
            return () => {
                socket.emit('leave_room', activeConversation.id);
            };
        }
    }, [activeConversation, socket]);

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

    const handleSendMessage = async (e, text = newMessage) => {
        if (e) e.preventDefault();
        if (!text.trim() || !activeConversation) return;

        try {
            const res = await axiosInstance.post(`/chat/${activeConversation.id}/messages`, {
                noi_dung: text,
                loai_tin_nhan: 'text'
            });

            if (res.data.success) {
                const sentMessage = res.data.data;

                // Optimistic update
                setMessages(prev => {
                    const exists = prev.some(m => m.id === sentMessage.id);
                    if (exists) return prev;
                    return [...prev, sentMessage];
                });
                scrollToBottom();

                socket.emit('send_message', { 
                    ...sentMessage, 
                    members: activeConversation.members 
                });
                if (text === newMessage) setNewMessage('');
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleQuickResponse = (text) => {
        handleSendMessage(null, text);
    };

    return (
        <div className="flex h-[calc(100vh-120px)] w-full bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Left Sidebar - Chat List */}
            <div className="w-80 bg-white border-r border-slate-200 flex flex-col h-full min-h-0">
                <div className="p-4 border-b border-slate-200 bg-white">
                    <h2 className="text-lg font-semibold text-slate-800">Tin nhắn</h2>
                    <div className="flex gap-2 mt-3">
                        <button
                            className={`px-3 py-1.5 text-xs font-medium rounded-full ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            onClick={() => setFilter('all')}
                        >
                            Tất cả
                        </button>
                        <button
                            className={`px-3 py-1.5 text-xs font-medium rounded-full ${filter === 'unread' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            onClick={() => setFilter('unread')}
                        >
                            Chưa đọc
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0">
                    {conversations.map(conv => {
                        let otherMember = conv.members?.find(m => Number(m.nguoi_dung_id) !== currentUserId)?.user;
                        
                        // Fallback logic for self-chat testing cases
                        if (!otherMember && conv.members?.length > 0) {
                            // If chatting with self, show "Chính mình" or try to find the other member by record identity
                            const otherRecord = conv.members.find(m => m.vai_tro_tham_gia === 'creator');
                            otherMember = otherRecord?.user;
                        }
                        return (
                            <div
                                key={conv.id}
                                onClick={() => setActiveConversation(conv)}
                                className={`flex items-center gap-3 p-4 cursor-pointer border-b border-slate-100 transition ${activeConversation?.id === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-slate-50 border-l-4 border-l-transparent'}`}
                            >
                                <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold overflow-hidden">
                                    {otherMember?.anh_dai_dien ? (
                                        <img src={otherMember.anh_dai_dien} alt="avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        otherMember?.ho_ten?.charAt(0) || '?'
                                    )}
                                </div>
                                <div className="flex-1 truncate">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-semibold text-sm text-slate-800 truncate">
                                            {otherMember?.cuaHang?.ten_cua_hang || otherMember?.cua_hang?.ten_cua_hang || otherMember?.ho_ten || 'Khách hàng'}
                                        </h4>
                                    </div>
                                    <p className="text-xs text-slate-500 truncate mt-1">{conv.tin_nhan_cuoi || 'Bắt đầu trò chuyện'}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Middle - Chat Area */}
            <div className="flex-1 flex flex-col bg-slate-50 min-w-0 min-h-0">
                {activeConversation ? (
                    <>
                        <div className="bg-white p-4 border-b border-slate-200 flex justify-between items-center shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                {activeConversation.loai_hoi_thoai === 'giao_hang' && (
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-[10px] font-bold rounded">GIAO HÀNG</span>
                                )}
                                {activeConversation.loai_hoi_thoai === 'ho_tro' && (
                                    <span className="px-2 py-1 bg-red-100 text-red-800 text-[10px] font-bold rounded">HỖ TRỢ</span>
                                )}
                                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                    {(() => {
                                        const otherMember = activeConversation.members?.find(m => Number(m.nguoi_dung_id) !== currentUserId)?.user;
                                        const shopName = otherMember?.cuaHang?.ten_cua_hang || otherMember?.cua_hang?.ten_cua_hang;
                                        if (shopName) return shopName;
                                        if (otherMember) return otherMember.ho_ten;
                                        // Self-chat fallback
                                        const customerMember = activeConversation.members?.find(m => m.vai_tro_tham_gia === 'creator')?.user;
                                        return customerMember ? `${customerMember.ho_ten} (Buyer)` : 'Khách hàng';
                                    })()}
                                    <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`}></div>
                                </h3>
                            </div>
                        </div>

                        {/* Product Context */}
                        {activeConversation.context_data?.san_pham_id && (
                            <div className="bg-blue-50 border-b border-blue-100 p-3 flex gap-3 items-center shadow-inner">
                                <div className="w-14 h-14 bg-white rounded border border-blue-200 overflow-hidden shrink-0 shadow-sm">
                                    {activeConversation.context_data.san_pham_anh ? (
                                        <img 
                                            src={activeConversation.context_data.san_pham_anh} 
                                            alt="" 
                                            className="w-full h-full object-cover" 
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-100">
                                            <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-0.5">Khách đang hỏi về sản phẩm</div>
                                    <div className="text-sm font-semibold text-slate-800 truncate">
                                        {activeConversation.context_data.san_pham_ten || 'Sản phẩm này'}
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-medium">ID: #{activeConversation.context_data.san_pham_id}</div>
                                </div>
                                <a 
                                    href={`/product/${activeConversation.context_data.san_pham_id}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="px-3 py-1 bg-white border border-blue-200 text-blue-600 rounded-md text-[10px] font-bold hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                >
                                    XEM CHI TIẾT
                                </a>
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 min-h-0">
                             {messages.map(msg => {
                                const isMe = Number(msg.nguoi_gui_id) === currentUserId;
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white text-slate-800 border border-slate-200 rounded-tl-sm shadow-sm'}`}>
                                            {msg.noi_dung}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Responses */}
                        <div className="bg-slate-100 p-2 border-t border-slate-200 flex gap-2 overflow-x-auto no-scrollbar">
                            {QUICK_RESPONSES.map((qr, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleQuickResponse(qr)}
                                    className="whitespace-nowrap px-3 py-1.5 bg-white border border-slate-300 rounded-full text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition"
                                >
                                    {qr}
                                </button>
                            ))}
                        </div>

                        <div className="bg-white p-4 border-t border-slate-200">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Nhập tin nhắn..."
                                    className="flex-1 px-4 py-2 bg-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                                <button type="submit" disabled={!newMessage.trim()} className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center disabled:opacity-50">
                                    <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-400 flex-col">
                        <svg className="w-16 h-16 mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        <p>Chọn một cuộc trò chuyện để bắt đầu</p>
                    </div>
                )}
            </div>

            {/* Right Sidebar - Buyer Context */}
            {activeConversation && (
                <div className="w-80 bg-white border-l border-slate-200 hidden xl:block h-full overflow-y-auto">
                    <div className="p-4 border-b border-slate-200 bg-slate-50">
                        <h3 className="font-semibold text-sm text-slate-800 uppercase tracking-wide">Thông tin khách hàng</h3>
                    </div>
                    <div className="p-4 flex flex-col items-center border-b border-slate-100">
                        <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-xl text-slate-600 font-bold mb-3">
                            {(() => {
                                const otherMember = activeConversation.members?.find(m => Number(m.nguoi_dung_id) !== currentUserId)?.user;
                                return (otherMember?.cuaHang?.ten_cua_hang || otherMember?.cua_hang?.ten_cua_hang || otherMember?.ho_ten || activeConversation.members?.find(m => m.vai_tro_tham_gia === 'creator')?.user?.ho_ten || '?').charAt(0);
                            })()}
                        </div>
                        <h4 className="font-bold text-slate-800 text-center">
                            {(() => {
                                const otherMember = activeConversation.members?.find(m => Number(m.nguoi_dung_id) !== currentUserId)?.user;
                                const shopName = otherMember?.cuaHang?.ten_cua_hang || otherMember?.cua_hang?.ten_cua_hang;
                                if (shopName) return shopName;
                                if (otherMember) return otherMember.ho_ten;
                                const customerMember = activeConversation.members?.find(m => m.vai_tro_tham_gia === 'creator')?.user;
                                return customerMember ? `${customerMember.ho_ten} (Buyer)` : 'Khách hàng';
                            })()}
                        </h4>
                    </div>

                    <div className="p-4">
                        <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Lịch sử đơn hàng (Tại Shop)</h5>
                        <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600 border border-slate-100 text-center">
                            Tính năng đang được cập nhật...
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
