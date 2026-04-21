import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './NotificationBell.css';

const API_BASE_URL = 'http://localhost:8000/api';

const NotificationBell = ({ nguoiDungId }) => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (!nguoiDungId) return;

        const fetchNotifications = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/notifications/${nguoiDungId}`);
                if (response.data.success) {
                    setNotifications(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching notifications", error);
            }
        };

        fetchNotifications();
    }, [nguoiDungId]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => parseInt(n.da_doc) === 0 || !n.da_doc).length;

    const handleNotificationClick = async (notif) => {
        if (!notif.da_doc || parseInt(notif.da_doc) === 0) {
            try {
                const res = await axios.patch(`${API_BASE_URL}/notifications/${notif.id}/read`);
                if (res.data.success) {
                    setNotifications(prev => prev.map(n => 
                        n.id === notif.id ? { ...n, da_doc: 1 } : n
                    ));
                }
            } catch (error) {
                console.error("Error marking notification as read", error);
            }
        }
    };

    const toggleDropdown = () => setIsOpen(!isOpen);

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const d = new Date(timeStr);
        return d.toLocaleDateString('vi-VN') + ' ' + d.toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'});
    };

    return (
        <div className="notification-bell-container" ref={dropdownRef}>
            <div className="bell-icon-wrapper" onClick={toggleDropdown}>
                <span className="bell-icon">🔔</span>
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
            </div>
            
            {isOpen && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <h3>Thông báo mới nhận</h3>
                    </div>
                    <div className="notification-list">
                        {notifications.length === 0 ? (
                            <div className="notification-empty">Không có thông báo nào.</div>
                        ) : (
                            notifications.map(notif => {
                                const isRead = notif.da_doc && parseInt(notif.da_doc) === 1;
                                return (
                                    <div 
                                        key={notif.id} 
                                        className={`notification-item ${isRead ? 'read' : 'unread'}`}
                                        onClick={() => handleNotificationClick(notif)}
                                    >
                                        <div className="notification-icon">
                                            {notif.loai_thong_bao === 'don_hang' ? '📦' : '💬'}
                                        </div>
                                        <div className="notification-content">
                                            <p className="notification-title">{notif.tieu_de}</p>
                                            <p className="notification-body">{notif.noi_dung}</p>
                                            <span className="notification-time">{formatTime(notif.created_at)}</span>
                                        </div>
                                        {!isRead && <span className="unread-dot"></span>}
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
