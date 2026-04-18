import React, { useState, useRef, useEffect, useMemo } from 'react';
import api from '../../../api/axios';
import { useSellerSession } from '../../../contexts/SellerSessionContext';
import { getSellerSocketClient } from '../../../lib/socketClient';
import './SellerChat.css';

const socket = getSellerSocketClient();

const getSupportConversationRoom = (chat) => {
    if (!chat || chat.conversationType !== 'support') {
        return null;
    }

    return `conversation.${chat.backendId}`;
};

const getTypingRoom = (chat) => {
    if (!chat) {
        return null;
    }

    if (chat.conversationType === 'support') {
        return `conversation.${chat.backendId}`;
    }

    if (chat.conversationType === 'customer') {
        return `customer.${chat.backendId}`;
    }

    return null;
};

const emitWhenConnected = (eventName, payload) => {
    const send = () => {
        socket.emit(eventName, payload);
    };

    if (socket.connected) {
        send();
        return;
    }

    const handleConnect = () => {
        socket.off('connect', handleConnect);
        send();
    };

    socket.on('connect', handleConnect);
    socket.connect();
};

const SellerChat = () => {
    const { selectedShop, selectedUser } = useSellerSession();
    const [chats, setChats] = useState([]);
    const [messagesByChat, setMessagesByChat] = useState({});
    const [activeChatId, setActiveChatId] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const [typingByChat, setTypingByChat] = useState({});
    const [chatFilters, setChatFilters] = useState({
        keyword: '',
        scope: '',
        unread: '',
    });
    const messagesEndRef = useRef(null);
    const stopTypingTimeoutRef = useRef(null);
    const clearTypingIndicatorTimeoutRef = useRef(null);
    const chatsRef = useRef([]);
    const activeChatIdRef = useRef(null);
    const activeChatRef = useRef(null);
    const selectedShopIdRef = useRef(null);
    const selectedUserIdRef = useRef(null);

    const activeChat = chats.find(chat => chat.id === activeChatId) || null;

    useEffect(() => {
        chatsRef.current = chats;
    }, [chats]);

    useEffect(() => {
        activeChatIdRef.current = activeChatId;
        activeChatRef.current = activeChat;
    }, [activeChat, activeChatId]);

    useEffect(() => {
        selectedShopIdRef.current = selectedShop?.id || null;
    }, [selectedShop?.id]);

    useEffect(() => {
        selectedUserIdRef.current = selectedUser?.id || null;
    }, [selectedUser?.id]);

    const emitChatTyping = (isTyping) => {
        if (!activeChat || !selectedUser?.id) {
            return;
        }

        const room = getTypingRoom(activeChat);

        if (!room) {
            return;
        }

        emitWhenConnected('conversation.typing', {
            room,
            conversationId: activeChat.backendId,
            conversationType: activeChat.conversationType,
            senderId: selectedUser.id,
            senderName: selectedUser.ho_ten || selectedUser.email || 'Seller',
            senderRole: selectedUser.vai_tro || 'nguoi_ban',
            isTyping,
        });
    };

    useEffect(() => {
        const handleReceiveMessage = (data) => {
            console.log('Received real-time message via socket:', data);
            const chatKey = `customer-${data.cuoc_tro_chuyen_id}`;
            const currentActiveChatId = activeChatIdRef.current;
            
            setMessagesByChat(prev => {
                const roomMessages = prev[chatKey] || [];

                if (roomMessages.find(m => m.id === data.id)) return prev;
                
                return {
                    ...prev,
                    [chatKey]: [...roomMessages, data]
                };
            });

            setChats(prevChats => prevChats.map(c => {
                if (c.id === chatKey) {
                    return { 
                        ...c, 
                        lastMessage: data.noi_dung, 
                        unread: (currentActiveChatId !== chatKey) ? (c.unread || 0) + 1 : 0 
                    };
                }
                return c;
            }));
        };

        const handleConversationUpdated = async (payload) => {
            const currentShopId = selectedShopIdRef.current;
            const currentChats = chatsRef.current;
            const currentActiveChatId = activeChatIdRef.current;
            const currentActiveChat = activeChatRef.current;

            if (!currentShopId) {
                return;
            }

            const supportChatId = `support-${payload.conversationId}`;
            const hasSupportChat = currentChats.some(chat => chat.id === supportChatId);

            if (!hasSupportChat && payload.shopId && Number(payload.shopId) !== Number(currentShopId)) {
                return;
            }

            await fetchConversations();

            if (currentActiveChatId === supportChatId || (currentActiveChat?.conversationType === 'support' && currentActiveChat.backendId === payload.conversationId)) {
                await fetchMessages(supportChatId);
            }
        };

        const handleConversationTyping = (payload) => {
            const currentChats = chatsRef.current;
            const currentSelectedUserId = selectedUserIdRef.current;

            if (!currentChats.length) {
                return;
            }

            const payloadRoom = String(
                payload?.room || payload?.conversationRoom || (payload?.conversationType === 'customer'
                    ? `customer.${payload?.conversationId || ''}`
                    : `conversation.${payload?.conversationId || ''}`)
            ).trim();

            const matchedChat = currentChats.find((chat) => getTypingRoom(chat) === payloadRoom);

            if (!matchedChat) {
                return;
            }

            if (Number(payload?.senderId) === Number(currentSelectedUserId)) {
                return;
            }

            if (!payload?.isTyping) {
                setTypingByChat((current) => {
                    const next = { ...current };
                    delete next[matchedChat.id];
                    return next;
                });

                if (clearTypingIndicatorTimeoutRef.current) {
                    clearTimeout(clearTypingIndicatorTimeoutRef.current);
                    clearTypingIndicatorTimeoutRef.current = null;
                }

                return;
            }

            const senderName = payload.senderName || (matchedChat.conversationType === 'support' ? 'Admin' : 'Khách hàng');
            setTypingByChat((current) => ({
                ...current,
                [matchedChat.id]: `${senderName} đang nhập tin nhắn`,
            }));

            if (clearTypingIndicatorTimeoutRef.current) {
                clearTimeout(clearTypingIndicatorTimeoutRef.current);
            }

            clearTypingIndicatorTimeoutRef.current = setTimeout(() => {
                setTypingByChat((current) => {
                    const next = { ...current };
                    delete next[matchedChat.id];
                    return next;
                });
                clearTypingIndicatorTimeoutRef.current = null;
            }, 1600);
        };

        socket.on('receive_message', handleReceiveMessage);
        socket.on('conversation.updated', handleConversationUpdated);
        socket.on('conversation.typing', handleConversationTyping);

        return () => {
            socket.off('receive_message', handleReceiveMessage);
            socket.off('conversation.updated', handleConversationUpdated);
            socket.off('conversation.typing', handleConversationTyping);
        };
    }, []);

    useEffect(() => {
        return () => {
            if (stopTypingTimeoutRef.current) {
                clearTimeout(stopTypingTimeoutRef.current);
            }

            if (clearTypingIndicatorTimeoutRef.current) {
                clearTimeout(clearTypingIndicatorTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        fetchConversations();
    }, [selectedShop?.id, selectedUser?.id]);

    useEffect(() => {
        if (!selectedShop?.id) {
            return undefined;
        }

        const rooms = Array.from(new Set([
            `seller.shop.${selectedShop.id}`,
            ...chats
                .filter((chat) => chat.conversationType === 'customer')
                .map((chat) => String(chat.backendId)),
            ...chats
                .map((chat) => getSupportConversationRoom(chat))
                .filter(Boolean),
            ...chats
                .map((chat) => getTypingRoom(chat))
                .filter(Boolean),
        ]));

        const joinRooms = () => {
            rooms.forEach((room) => socket.emit('join_room', room));
        };

        socket.connect();

        if (socket.connected) {
            joinRooms();
        }

        socket.on('connect', joinRooms);

        return () => {
            socket.off('connect', joinRooms);
            rooms.forEach((room) => socket.emit('leave_room', room));
        };
    }, [chats, selectedShop?.id]);

    const fetchConversations = async () => {
        try {
            if (!selectedShop?.id) {
                setChats([]);
                setActiveChatId(null);
                return;
            }

            const res = await api.get(`/chat/conversations/${selectedShop.id}`, {
                params: {
                    user_id: selectedUser?.id,
                },
            });
            const formattedChats = (res.data || []).map(c => ({
                id: c.id,
                backendId: c.backend_id,
                conversationType: c.conversation_type,
                name: c.name,
                isAdmin: Boolean(c.is_admin),
                lastMessage: c.last_message || 'Chưa có tin nhắn',
                unread: 0,
                avatar: c.avatar || 'C',
                time: c.updated_at ? new Date(c.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
            }));
            setChats(formattedChats);
            setActiveChatId(current => {
                if (current && formattedChats.some(chat => chat.id === current)) {
                    return current;
                }

                return formattedChats[0]?.id || null;
            });
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    };

    const fetchMessages = async (roomId) => {
        try {
            const res = await api.get(`/chat/messages/${roomId}`);
            setMessagesByChat(prev => ({
                ...prev,
                [roomId]: res.data || []
            }));
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleSelectChat = (roomId) => {
        setActiveChatId(roomId);

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
        emitChatTyping(false);

        if (stopTypingTimeoutRef.current) {
            clearTimeout(stopTypingTimeoutRef.current);
            stopTypingTimeoutRef.current = null;
        }

        try {
            if (!selectedUser?.id) {
                return;
            }

            const chat = chats.find(item => item.id === activeChatId);

            if (!chat) {
                return;
            }

            const res = await api.post(`/chat/message`, {
                conversation_id: chat.id,
                nguoi_gui_id: selectedUser.id,
                noi_dung: text,
                loai_tin_nhan: 'text'
            });

            const dbMessage = res.data.data;

            if (chat.conversationType === 'customer') {
                socket.emit('send_message', {
                    ...dbMessage,
                    cuoc_tro_chuyen_id: chat.backendId,
                });
            }

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

    const handleMessageInputChange = (event) => {
        const nextValue = event.target.value;
        setMessageInput(nextValue);

        if (!activeChat) {
            return;
        }

        emitChatTyping(Boolean(nextValue.trim()));

        if (stopTypingTimeoutRef.current) {
            clearTimeout(stopTypingTimeoutRef.current);
        }

        if (!nextValue.trim()) {
            stopTypingTimeoutRef.current = null;
            return;
        }

        stopTypingTimeoutRef.current = setTimeout(() => {
            emitChatTyping(false);
            stopTypingTimeoutRef.current = null;
        }, 1200);
    };

    const currentMessages = messagesByChat[activeChatId] || [];
    const isSupportChat = activeChat?.conversationType === 'support';
    const activeTypingLabel = activeChatId ? typingByChat[activeChatId] || '' : '';

    const sortedChats = useMemo(() => [...chats].sort((a, b) => {
        if (a.isAdmin) return -1;
        if (b.isAdmin) return 1;
        return 0;
    }), [chats]);

    const filteredChats = useMemo(() => {
        const keyword = chatFilters.keyword.trim().toLowerCase();

        return sortedChats.filter((chat) => {
            if (chatFilters.scope === 'support' && chat.conversationType !== 'support') {
                return false;
            }

            if (chatFilters.scope === 'customer' && chat.conversationType !== 'customer') {
                return false;
            }

            if (chatFilters.unread === 'unread' && !(chat.unread > 0)) {
                return false;
            }

            if (chatFilters.unread === 'read' && chat.unread > 0) {
                return false;
            }

            if (!keyword) {
                return true;
            }

            const searchTarget = [chat.name, chat.lastMessage, chat.id]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return searchTarget.includes(keyword);
        });
    }, [chatFilters, sortedChats]);

    const chatStats = useMemo(() => ({
        total: chats.length,
        support: chats.filter((chat) => chat.conversationType === 'support').length,
        unread: chats.filter((chat) => chat.unread > 0).length,
    }), [chats]);

    const hasActiveFilters = useMemo(() => {
        return Boolean(chatFilters.keyword.trim() || chatFilters.scope || chatFilters.unread);
    }, [chatFilters]);

    return (
        <div className="seller-chat-container">
            {!selectedShop && <div style={{padding: '12px 16px', marginBottom: '16px', borderRadius: '12px', background: '#fff4e5', color: '#9a3412'}}>Chưa có cửa hàng được chọn để mở chat khách hàng.</div>}
            <div className="chat-layout">
                {/* Left Sidebar - Conversation List */}
                <div className="chat-sidebar">
                    <div className="chat-sidebar-header">
                        <div className="chat-sidebar-title-row seller-inbox-heading">
                            <div>
                                <p className="seller-inbox-eyebrow">Seller inbox</p>
                                <h3>Tin nhắn</h3>
                                <p className="seller-inbox-caption">Theo dõi khách hàng và kênh hỗ trợ shop trong một hàng chờ.</p>
                            </div>
                            <span className="support-guide-pill">{chatStats.total} chat</span>
                        </div>

                        <div className="seller-chat-stats-grid">
                            <div className="seller-chat-stat-card">
                                <span>Tổng hội thoại</span>
                                <strong>{chatStats.total}</strong>
                            </div>
                            <div className="seller-chat-stat-card seller-chat-stat-card--support">
                                <span>Kênh hỗ trợ</span>
                                <strong>{chatStats.support}</strong>
                            </div>
                            <div className="seller-chat-stat-card seller-chat-stat-card--unread">
                                <span>Chưa đọc</span>
                                <strong>{chatStats.unread}</strong>
                            </div>
                        </div>

                        <div className="seller-chat-filter-panel">
                            <div className="chat-search">
                                <input
                                    type="text"
                                    placeholder="Tìm tài khoản, mã chat, nội dung..."
                                    value={chatFilters.keyword}
                                    onChange={(event) => setChatFilters((current) => ({ ...current, keyword: event.target.value }))}
                                />
                            </div>

                            <select
                                value={chatFilters.scope}
                                onChange={(event) => setChatFilters((current) => ({ ...current, scope: event.target.value }))}
                                className="seller-chat-filter-select"
                            >
                                <option value="">Tất cả loại chat</option>
                                <option value="support">Kênh hỗ trợ admin</option>
                                <option value="customer">Chat khách hàng</option>
                            </select>

                            <select
                                value={chatFilters.unread}
                                onChange={(event) => setChatFilters((current) => ({ ...current, unread: event.target.value }))}
                                className="seller-chat-filter-select"
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="unread">Ưu tiên chưa đọc</option>
                                <option value="read">Đã xử lý</option>
                            </select>

                            <div className="seller-chat-quick-filters">
                                <button
                                    type="button"
                                    className={`seller-chat-quick-filter ${!hasActiveFilters ? 'active' : ''}`}
                                    onClick={() => setChatFilters({ keyword: '', scope: '', unread: '' })}
                                >
                                    Tất cả
                                </button>
                                <button
                                    type="button"
                                    className={`seller-chat-quick-filter ${chatFilters.unread === 'unread' ? 'active' : ''}`}
                                    onClick={() => setChatFilters((current) => ({ ...current, unread: current.unread === 'unread' ? '' : 'unread' }))}
                                >
                                    Cần phản hồi
                                </button>
                                <button
                                    type="button"
                                    className={`seller-chat-quick-filter ${chatFilters.scope === 'support' ? 'active support' : ''}`}
                                    onClick={() => setChatFilters((current) => ({ ...current, scope: current.scope === 'support' ? '' : 'support' }))}
                                >
                                    Admin
                                </button>
                                <button
                                    type="button"
                                    className={`seller-chat-quick-filter ${chatFilters.scope === 'customer' ? 'active customer' : ''}`}
                                    onClick={() => setChatFilters((current) => ({ ...current, scope: current.scope === 'customer' ? '' : 'customer' }))}
                                >
                                    Khách
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="chat-list">
                        {sortedChats.length === 0 && <div className="seller-chat-loading-state">Đang tải cuộc trò chuyện...</div>}
                        {sortedChats.length > 0 && filteredChats.length === 0 && <div className="seller-chat-empty-state">Không có hội thoại phù hợp với bộ lọc hiện tại.</div>}
                        {filteredChats.map(chat => (
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
                                        <div className="chat-title-stack">
                                            <span className="chat-name">{chat.name}</span>
                                            {chat.conversationType === 'support' && <span className="chat-type-pill">Kênh hỗ trợ</span>}
                                        </div>
                                        <span className="chat-time">{chat.time || 'Vừa xong'}</span>
                                    </div>
                                    <div className="chat-item-bottom">
                                        <span className={`chat-last-msg ${typingByChat[chat.id] ? 'typing' : chat.unread > 0 ? 'unread' : ''}`}>
                                            {typingByChat[chat.id] || chat.lastMessage}
                                        </span>
                                        {chat.unread > 0 && <span className="chat-badge">{chat.unread}</span>}
                                    </div>
                                    <div className="chat-item-tags">
                                        <span className={`chat-meta-pill ${chat.conversationType === 'support' ? 'chat-meta-pill--support' : ''}`}>
                                            {chat.conversationType === 'support' ? 'Admin CSKH' : 'Khách hàng'}
                                        </span>
                                        <span className={`chat-meta-pill ${chat.unread > 0 ? 'chat-meta-pill--hot' : ''}`}>
                                            {chat.unread > 0 ? 'Cần phản hồi' : 'Ổn định'}
                                        </span>
                                    </div>
                                    <div className="chat-item-meta-row">
                                        <span>{chat.conversationType === 'support' ? 'Thread hỗ trợ trực tiếp' : 'Luồng chat khách hàng'}</span>
                                        <span className="chat-thread-id">#{chat.id}</span>
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
                                <div className="chat-main-header-primary">
                                    <div className="chat-avatar">
                                        {activeChat.isAdmin ? <span className="admin-icon">🛡️</span> : activeChat.avatar}
                                    </div>
                                    <div className="chat-header-info">
                                        <div className="chat-main-title-row">
                                            <h4>{activeChat.name}</h4>
                                            {isSupportChat && <span className="chat-type-pill header">Kênh dùng chung với admin</span>}
                                        </div>
                                        <span className="status">{isSupportChat ? 'Đồng bộ trực tiếp với complaints/chat của admin' : 'Đang hoạt động ổn định'}</span>
                                    </div>
                                </div>

                                <div className="chat-header-badges">
                                    <span className={`chat-header-badge-pill ${isSupportChat ? 'support' : 'customer'}`}>
                                        {isSupportChat ? 'Luồng admin' : 'Khách hàng'}
                                    </span>
                                    {activeChat.time && <span className="chat-header-badge-pill neutral">Cập nhật {activeChat.time}</span>}
                                    <span className={`chat-header-badge-pill ${activeTypingLabel ? 'live' : 'neutral'}`}>
                                        {activeTypingLabel ? 'Đang nhập realtime' : 'Socket.IO realtime'}
                                    </span>
                                </div>
                            </div>

                            {isSupportChat && (
                                <div className="support-chat-note">
                                    Đây là luồng chat hỗ trợ đồng bộ trực tiếp với hệ hội thoại admin. Tin nhắn từ seller và admin sẽ đi chung một thread.
                                </div>
                            )}

                            <div className="chat-messages-area">
                                {currentMessages.map(msg => {
                                    const isMe = String(msg.nguoi_gui_id) === String(selectedUser?.id);
                                    const msgTime = msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                    const senderLabel = isMe
                                        ? (selectedUser?.ho_ten || selectedUser?.email || 'Bạn')
                                        : (msg?.sender?.ho_ten || msg?.sender?.name || activeChat.name);
                                    const senderRole = isMe
                                        ? 'Shop'
                                        : (isSupportChat ? 'Admin CSKH' : 'Khách hàng');

                                    return (
                                        <div key={msg.id} className={`message-wrapper ${isMe ? 'message-right' : 'message-left'}`}>
                                            {!isMe && (
                                                <div className="msg-avatar">
                                                    {activeChat.isAdmin ? '🛡️' : activeChat.avatar}
                                                </div>
                                            )}
                                            <div className="message-content">
                                                <div className={`message-meta ${isMe ? 'message-meta-right' : ''}`}>
                                                    <span className="message-sender-name">{senderLabel}</span>
                                                    <span className={`message-role-pill ${isMe ? 'message-role-pill-shop' : isSupportChat ? 'message-role-pill-admin' : 'message-role-pill-customer'}`}>
                                                        {senderRole}
                                                    </span>
                                                    <span className="message-time-inline">{msgTime}</span>
                                                </div>
                                                <div className={`message-bubble ${isMe ? 'my-bubble' : 'their-bubble'} ${!isMe && isSupportChat ? 'admin-bubble' : ''}`}>
                                                    {msg.noi_dung}
                                                </div>
                                                <span className="message-time">{isMe ? 'Đã gửi' : 'Đã nhận'}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            <form className="chat-input-area" onSubmit={handleSendMessage}>
                                {activeTypingLabel && (
                                    <div className="chat-composer-typing">
                                        <span>{activeTypingLabel}</span>
                                        <span className="typing-dots" aria-hidden="true">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </span>
                                    </div>
                                )}
                                <button type="button" className="chat-action-btn">📎</button>
                                <button type="button" className="chat-action-btn">📷</button>
                                <input 
                                    type="text" 
                                    placeholder="Nhập tin nhắn của bạn..." 
                                    value={messageInput}
                                    onChange={handleMessageInputChange}
                                    onBlur={() => emitChatTyping(false)}
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
