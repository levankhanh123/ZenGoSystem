import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import api from '../../api/axios';
import { useSellerSession } from '../../contexts/SellerSessionContext';
import { getSellerSocketClient } from '../../lib/socketClient';
import './SellerDashboard.css';
import { Bell } from 'lucide-react';

function formatNotificationTime(value) {
  if (!value) {
    return '--';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '--';
  }

  return date.toLocaleString('vi-VN');
}

const SellerDashboard = () => {
  const navigate = useNavigate();
  const {
    loading,
    error,
    selectedUser,
    selectedShop,
  } = useSellerSession();
  // State to manage expanded/collapsed sidebar menus
  const [openMenus, setOpenMenus] = useState({
    orders: true, // Open by default as per request details mostly focus on it
    products: false,
    customerService: false,
    finance: false,
    data: false,
  });

  const location = useLocation();
  const currentPath = location.pathname;

  // Helper to check if a sub-path is active
  const isPathActive = (path) => {
    if (path === '/seller-dashboard' && currentPath === '/seller-dashboard') return true;
    return currentPath === `/seller-dashboard/${path}`;
  };

  const [showLogout, setShowLogout] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationError, setNotificationError] = useState('');
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  const toggleMenu = (menuKey) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const handleSubMenuClick = (path) => {
    navigate(`/seller-dashboard/${path}`);
  };



  useEffect(() => {
    if (!selectedUser?.id) {
      setNotifications([]);
      setUnreadNotificationCount(0);
      return;
    }

    let cancelled = false;

    const fetchNotifications = async () => {
      setNotificationsLoading(true);
      setNotificationError('');

      try {
        const response = await api.get('/seller/notifications', {
          params: { user_id: selectedUser.id },
        });

        if (cancelled) {
          return;
        }

        setNotifications(response.data?.data || []);
        setUnreadNotificationCount(response.data?.unread_count || 0);
      } catch (requestError) {
        if (!cancelled) {
          setNotificationError(requestError.response?.data?.message || 'Không thể tải thông báo.');
        }
      } finally {
        if (!cancelled) {
          setNotificationsLoading(false);
        }
      }
    };

    fetchNotifications();

    return () => {
      cancelled = true;
    };
  }, [selectedUser?.id]);

  useEffect(() => {
    if (!selectedUser?.id) {
      return undefined;
    }

    const socket = getSellerSocketClient();
    const room = `user.${selectedUser.id}`;

    const applyNotificationList = (updater) => {
      setNotifications((current) => {
        const next = updater(current);
        setUnreadNotificationCount(next.filter((item) => !item.da_doc).length);
        return next.slice(0, 20);
      });
    };

    const handleCreated = (payload) => {
      const notification = payload?.notification;

      if (!notification || Number(notification.nguoi_dung_id) !== Number(selectedUser.id)) {
        return;
      }

      applyNotificationList((current) => [
        notification,
        ...current.filter((item) => item.id !== notification.id),
      ]);
    };

    const handleUpdated = (payload) => {
      const notification = payload?.notification;

      if (!notification || Number(notification.nguoi_dung_id) !== Number(selectedUser.id)) {
        return;
      }

      applyNotificationList((current) =>
        current.map((item) => (item.id === notification.id ? notification : item))
      );
    };

    const handleDeleted = (payload) => {
      if (Number(payload?.user_id) !== Number(selectedUser.id)) {
        return;
      }

      applyNotificationList((current) => current.filter((item) => item.id !== payload?.notification_id));
    };

    socket.connect();
    socket.emit('join_room', room);
    socket.on('notification.created', handleCreated);
    socket.on('notification.updated', handleUpdated);
    socket.on('notification.deleted', handleDeleted);

    return () => {
      socket.emit('leave_room', room);
      socket.off('notification.created', handleCreated);
      socket.off('notification.updated', handleUpdated);
      socket.off('notification.deleted', handleDeleted);
    };
  }, [selectedUser?.id]);

  const handleMarkNotificationAsRead = async (notificationId) => {
    if (!selectedUser?.id) {
      return;
    }

    try {
      const response = await api.put(`/seller/notifications/${notificationId}/read`, {
        user_id: selectedUser.id,
      });
      const updatedNotification = response.data?.data;

      if (!updatedNotification) {
        return;
      }

      setNotifications((current) => {
        const next = current.map((item) => (item.id === updatedNotification.id ? updatedNotification : item));
        setUnreadNotificationCount(next.filter((item) => !item.da_doc).length);
        return next;
      });
    } catch (requestError) {
      setNotificationError(requestError.response?.data?.message || 'Không thể đánh dấu đã đọc.');
    }
  };

  if (loading) {
    return <div className="dashboard-wrapper" style={{ padding: '32px', color: '#64748b' }}>Đang tải ngữ cảnh người bán...</div>;
  }

  return (
    <div className="dashboard-wrapper">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="zengo-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>ZENGO</h1>
          <span className="header-divider">|</span>
          <span className="header-title">Kênh Người Bán</span>
          <span className="header-divider">|</span>
          <button 
            onClick={() => navigate('/')}
            className="buyer-channel-link"
            style={{
              background: 'none',
              border: 'none',
              color: '#666',
              fontSize: '14px',
              cursor: 'pointer',
              marginLeft: '10px',
              hover: { color: '#ee4d2d' }
            }}
          >
            Kênh người mua
          </button>
        </div>
        <div className="header-right" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {/* Context selectors removed as per user request */}


          <div className="seller-notifications">
            <button
              type="button"
              className="seller-notification-button"
              onClick={() => setShowNotifications((current) => !current)}
            >
              <Bell size={20} strokeWidth={1.5} className="seller-notification-icon" />
              {unreadNotificationCount > 0 && (
                <span className="seller-notification-badge">{unreadNotificationCount}</span>
              )}
            </button>

            {showNotifications && (
              <div className="seller-notification-panel">
                <div className="seller-notification-panel-header">
                  <div>
                    <strong>Thông báo</strong>
                    <p>{unreadNotificationCount} chưa đọc</p>
                  </div>
                </div>

                {notificationError && <div className="seller-notification-error">{notificationError}</div>}

                {notificationsLoading ? (
                  <div className="seller-notification-empty">Đang tải thông báo...</div>
                ) : notifications.length === 0 ? (
                  <div className="seller-notification-empty">Chưa có thông báo nào.</div>
                ) : (
                  <div className="seller-notification-list">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`seller-notification-item ${notification.da_doc ? 'is-read' : 'is-unread'}`}
                      >
                        <div className="seller-notification-item-head">
                          <strong>{notification.tieu_de}</strong>
                          <span>{formatNotificationTime(notification.created_at)}</span>
                        </div>
                        <p>{notification.noi_dung}</p>
                        {!notification.da_doc && (
                          <button
                            type="button"
                            className="seller-notification-read-button"
                            onClick={() => handleMarkNotificationAsRead(notification.id)}
                          >
                            Đánh dấu đã đọc
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div 
             className="user-profile-section"
             onClick={() => setShowLogout(!showLogout)}
             style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}
          >
            <div className="shop-avatar-placeholder">{(selectedShop?.ten_cua_hang || selectedUser?.ho_ten || 'S').charAt(0).toUpperCase()}</div>
            <span className="shop-name-display">{selectedShop?.ten_cua_hang || selectedUser?.ho_ten || 'Seller'}</span>
          </div>

          {showLogout && (
            <div className="logout-dropdown" style={{
               position: 'absolute',
               top: '100%',
               right: '0',
               marginTop: '8px',
               backgroundColor: 'white',
               border: '1px solid #e5e5e5',
               borderRadius: '4px',
               boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
               padding: '8px',
               zIndex: 1000,
               minWidth: '150px'
            }}>
              <button 
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('zengo.seller.session');
                  navigate('/login');
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#fff',
                  color: '#ee4d2d',
                  border: '1px solid #ee4d2d',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  textAlign: 'center'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#ee4d2d';
                  e.target.style.color = '#fff';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#fff';
                  e.target.style.color = '#ee4d2d';
                }}
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </header>

      {error && (
        <div style={{ margin: '16px 24px 0', padding: '12px 16px', borderRadius: '12px', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fee2e2' }}>
          <strong>Lỗi kết nối:</strong> {error}
        </div>
      )}

      {/* Main Layout */}
      <div className="dashboard-main">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <nav className="sidebar-nav">
            
            {/* Quản lý đơn hàng */}
            <div className="menu-group">
              <div 
                className={`menu-header ${openMenus.orders ? 'open' : ''}`} 
                onClick={() => toggleMenu('orders')}
              >
                <div className="menu-title">
                  <span className="menu-icon"></span>
                  Quản lý đơn hàng
                </div>
                <span className="chevron">{openMenus.orders ? '▲' : '▼'}</span>
              </div>
              
              <div className={`submenu-list ${openMenus.orders ? 'expanded' : ''}`}>
                 <div 
                    className={`submenu-item ${isPathActive('orders') ? 'active' : ''}`}
                    onClick={() => handleSubMenuClick('orders')}
                 >
                    Tất cả
                 </div>
                 <div 
                    className={`submenu-item ${isPathActive('handover') ? 'active' : ''}`}
                    onClick={() => handleSubMenuClick('handover')}
                 >
                    Bàn giao đơn hàng
                 </div>
                 <div 
                    className={`submenu-item ${isPathActive('returns') ? 'active' : ''}`}
                    onClick={() => handleSubMenuClick('returns')}
                 >
                    Đơn trả hàng/ hoàn tiền hoặc đơn hủy
                 </div>
                 <div 
                    className={`submenu-item ${isPathActive('campaigns') ? 'active' : ''}`}
                    onClick={() => handleSubMenuClick('campaigns')}
                 >
                    Đăng ký chiến dịch
                 </div>
                 <div 
                    className={`submenu-item ${isPathActive('vouchers') ? 'active' : ''}`}
                    onClick={() => handleSubMenuClick('vouchers')}
                 >
                    Kho voucher
                 </div>
              </div>
            </div>

            {/* Quản lý sản phẩm */}
            <div className="menu-group">
              <div 
                className={`menu-header ${openMenus.products ? 'open' : ''}`} 
                onClick={() => toggleMenu('products')}
              >
                <div className="menu-title">
                  <span className="menu-icon"></span>
                  Quản lý sản phẩm
                </div>
                <span className="chevron">{openMenus.products ? '▲' : '▼'}</span>
              </div>
              <div className={`submenu-list ${openMenus.products ? 'expanded' : ''}`}>
                 <div 
                    className={`submenu-item ${isPathActive('products') ? 'active' : ''}`}
                    onClick={() => handleSubMenuClick('products')}
                 >
                    Tất cả sản phẩm
                 </div>
                 <div 
                    className={`submenu-item ${isPathActive('add-product') ? 'active' : ''}`}
                    onClick={() => handleSubMenuClick('add-product')}
                 >
                    Thêm sản phẩm mới
                 </div>
              </div>
            </div>

            {/* Chăm sóc khách hàng */}
            <div className="menu-group">
              <div 
                className={`menu-header ${openMenus.customerService ? 'open' : ''}`} 
                onClick={() => toggleMenu('customerService')}
              >
                <div className="menu-title">
                  <span className="menu-icon"></span>
                  Chăm sóc khách hàng
                </div>
                <span className="chevron">{openMenus.customerService ? '▲' : '▼'}</span>
              </div>
              <div className={`submenu-list ${openMenus.customerService ? 'expanded' : ''}`}>
                 <div 
                    className={`submenu-item ${isPathActive('chat') ? 'active' : ''}`}
                    onClick={() => handleSubMenuClick('chat')}
                 >
                    Quản lý chat
                 </div>
                 <div 
                    className={`submenu-item ${isPathActive('reviews') ? 'active' : ''}`}
                    onClick={() => handleSubMenuClick('reviews')}
                 >
                    Quản lý đánh giá
                 </div>
              </div>
            </div>

            {/* Tài chính */}
            <div className="menu-group">
              <div 
                className={`menu-header ${openMenus.finance ? 'open' : ''}`} 
                onClick={() => toggleMenu('finance')}
              >
                <div className="menu-title">
                  <span className="menu-icon"></span>
                  Tài chính
                </div>
                <span className="chevron">{openMenus.finance ? '▲' : '▼'}</span>
              </div>
              <div className={`submenu-list ${openMenus.finance ? 'expanded' : ''}`}>
                 <div 
                    className={`submenu-item ${isPathActive('revenue') ? 'active' : ''}`}
                    onClick={() => handleSubMenuClick('revenue')}
                 >
                    Doanh thu
                 </div>
                 <div 
                    className={`submenu-item ${isPathActive('withdrawals') ? 'active' : ''}`}
                    onClick={() => handleSubMenuClick('withdrawals')}
                 >
                    Yêu cầu rút tiền
                 </div>
                 <div 
                    className={`submenu-item ${isPathActive('bank-accounts') ? 'active' : ''}`}
                    onClick={() => handleSubMenuClick('bank-accounts')}
                 >
                    Tài khoản ngân hàng
                 </div>
              </div>
            </div>

            {/* Dữ liệu */}
            <div className="menu-group">
              <div 
                className={`menu-header ${openMenus.data ? 'open' : ''}`} 
                onClick={() => toggleMenu('data')}
              >
                <div className="menu-title">
                  <span className="menu-icon"></span>
                  Dữ liệu
                </div>
                <span className="chevron">{openMenus.data ? '▲' : '▼'}</span>
              </div>
              <div className={`submenu-list ${openMenus.data ? 'expanded' : ''}`}>
                 <div 
                    className={`submenu-item ${isPathActive('statistics') ? 'active' : ''}`}
                    onClick={() => handleSubMenuClick('statistics')}
                 >
                    Thống kê
                 </div>
              </div>
            </div>
          </nav>
        </aside>

        {/* Boarding Content Area */}
        <main className="dashboard-content">
          <Outlet />
        </main>








      </div>
    </div>
  );
};

export default SellerDashboard;
