import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AllOrders from './AllOrders/AllOrders';
import HandoverOrders from './HandoverOrders/HandoverOrders';
import AllProducts from './AllProducts/AllProducts';
import AddProduct from './AddProduct/AddProduct';
import SellerChat from './SellerChat/SellerChat';
import ReviewManagement from './ReviewManagement/ReviewManagement';
import CampaignRegistration from './CampaignRegistration/CampaignRegistration';
import ShopVouchers from './ShopVouchers/ShopVouchers';
import BankAccounts from './Finance/BankAccounts';
import WithdrawalRequests from './Finance/WithdrawalRequests';
import RevenueDashboard from './Finance/RevenueDashboard';
import StatisticsDashboard from './Data/StatisticsDashboard';
import api from '../../api/axios';
import { useSellerSession } from '../../contexts/SellerSessionContext';
import { getSellerSocketClient } from '../../lib/socketClient';
import './SellerDashboard.css';

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
    availableUsers,
    availableShops,
    updateSelection,
  } = useSellerSession();
  // State to manage expanded/collapsed sidebar menus
  const [openMenus, setOpenMenus] = useState({
    orders: true, // Open by default as per request details mostly focus on it
    products: false,
    customerService: false,
    finance: false,
    data: false,
  });

  const [activeTab, setActiveTab] = useState('Tuyển dụng ZENGO'); // Just a placeholder active tab
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

  const handleSubMenuClick = (tabName) => {
    setActiveTab(tabName);
  };

  const handleChangeUser = async (event) => {
    await updateSelection({ userId: event.target.value, shopId: '' });
  };

  const handleChangeShop = async (event) => {
    await updateSelection({ userId: selectedUser?.id, shopId: event.target.value });
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
          setNotificationError(requestError.response?.data?.message || 'Không thể tải thông báo realtime.');
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
          <h1 className="zengo-logo">ZENGO</h1>
          <span className="header-title">Kênh Người Bán</span>
        </div>
        <div className="header-right" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginRight: '12px' }}>
            <select
              value={selectedUser?.id || ''}
              onChange={handleChangeUser}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', minWidth: '180px' }}
            >
              <option value="">Chọn tài khoản seller</option>
              {availableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.ho_ten}
                </option>
              ))}
            </select>

            <select
              value={selectedShop?.id || ''}
              onChange={handleChangeShop}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', minWidth: '220px' }}
            >
              <option value="">Chọn cửa hàng</option>
              {availableShops.map((shop) => (
                <option key={shop.id} value={shop.id}>
                  {shop.ten_cua_hang}
                </option>
              ))}
            </select>
          </div>

          <div className="seller-notifications">
            <button
              type="button"
              className="seller-notification-button"
              onClick={() => setShowNotifications((current) => !current)}
            >
              <span className="seller-notification-icon">🔔</span>
              {unreadNotificationCount > 0 && (
                <span className="seller-notification-badge">{unreadNotificationCount}</span>
              )}
            </button>

            {showNotifications && (
              <div className="seller-notification-panel">
                <div className="seller-notification-panel-header">
                  <div>
                    <strong>Thông báo realtime</strong>
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
                onClick={() => navigate('/seller-registration')}
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

      {/* Main Layout */}
      <div className="dashboard-main">
        {error && (
          <div style={{ margin: '16px 24px 0', padding: '12px 16px', borderRadius: '12px', background: '#fef2f2', color: '#b91c1c' }}>
            {error}
          </div>
        )}
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
                    className={`submenu-item ${activeTab === 'Tất cả đơn hàng' ? 'active' : ''}`}
                    onClick={() => handleSubMenuClick('Tất cả đơn hàng')}
                 >
                    Tất cả
                 </div>
                 <div 
                    className={`submenu-item ${activeTab === 'Bàn giao đơn hàng' ? 'active' : ''}`}
                    onClick={() => handleSubMenuClick('Bàn giao đơn hàng')}
                 >
                    Bàn giao đơn hàng
                 </div>
                 <div 
                    className={`submenu-item ${activeTab === 'Đơn trả hàng / hủy' ? 'active' : ''}`}
                    onClick={() => handleSubMenuClick('Đơn trả hàng / hủy')}
                 >
                    Đơn trả hàng/ hoàn tiền hoặc đơn hủy
                 </div>
                 <div 
                    className={`submenu-item ${activeTab === 'Đăng ký chiến dịch' ? 'active' : ''}`}
                    onClick={() => handleSubMenuClick('Đăng ký chiến dịch')}
                 >
                    Đăng ký chiến dịch
                 </div>
                 <div 
                    className={`submenu-item ${activeTab === 'Cài đặt vận chuyển' ? 'active' : ''}`}
                    onClick={() => handleSubMenuClick('Cài đặt vận chuyển')}
                 >
                    Cài đặt vận chuyển
                 </div>
                 <div 
                    className={`submenu-item ${activeTab === 'Kho voucher' ? 'active' : ''}`}
                    onClick={() => handleSubMenuClick('Kho voucher')}
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
                    className={`submenu-item ${activeTab === 'Tất cả sản phẩm' ? 'active' : ''}`}
                    onClick={() => handleSubMenuClick('Tất cả sản phẩm')}
                 >
                    Tất cả sản phẩm
                 </div>
                 <div 
                    className={`submenu-item ${activeTab === 'Thêm sản phẩm' ? 'active' : ''}`}
                    onClick={() => handleSubMenuClick('Thêm sản phẩm')}
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
                    className={`submenu-item ${activeTab === 'Chat với khách' ? 'active' : ''}`}
                    onClick={() => handleSubMenuClick('Chat với khách')}
                 >
                    Quản lý chat
                 </div>
                 <div 
                    className={`submenu-item ${activeTab === 'Đánh giá shop' ? 'active' : ''}`}
                    onClick={() => handleSubMenuClick('Đánh giá shop')}
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
                    className={`submenu-item ${activeTab === 'Doanh thu' ? 'active' : ''}`}
                    onClick={() => handleSubMenuClick('Doanh thu')}
                 >
                    Doanh thu
                 </div>
                 <div 
                    className={`submenu-item ${activeTab === 'Yêu cầu rút tiền' ? 'active' : ''}`}
                    onClick={() => handleSubMenuClick('Yêu cầu rút tiền')}
                 >
                    Yêu cầu rút tiền
                 </div>
                 <div 
                    className={`submenu-item ${activeTab === 'Tài khoản ngân hàng' ? 'active' : ''}`}
                    onClick={() => handleSubMenuClick('Tài khoản ngân hàng')}
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
                    className={`submenu-item ${activeTab === 'Thống kê' ? 'active' : ''}`}
                    onClick={() => handleSubMenuClick('Thống kê')}
                 >
                    Thống kê
                 </div>
              </div>
            </div>
          </nav>
        </aside>

        {/* Boarding Content Area */}
        <main className="dashboard-content">
          {activeTab === 'Tất cả đơn hàng' ? (
             <AllOrders />
          ) : activeTab === 'Bàn giao đơn hàng' ? (
             <HandoverOrders />
          ) : activeTab === 'Tất cả sản phẩm' ? (
             <AllProducts onAddProduct={() => setActiveTab('Thêm sản phẩm')} />
          ) : activeTab === 'Thêm sản phẩm' ? (
             <AddProduct />
          ) : activeTab === 'Đăng ký chiến dịch' ? (
             <CampaignRegistration />
          ) : activeTab === 'Chat với khách' ? (
             <SellerChat />
          ) : activeTab === 'Kho voucher' ? (
             <ShopVouchers />
          ) : activeTab === 'Doanh thu' ? (
             <RevenueDashboard />
          ) : activeTab === 'Yêu cầu rút tiền' ? (
             <WithdrawalRequests />
          ) : activeTab === 'Tài khoản ngân hàng' ? (
             <BankAccounts />
          ) : activeTab === 'Thống kê' ? (
             <StatisticsDashboard />
           ) : activeTab === 'Đánh giá shop' ? (
              <ReviewManagement />
          ) : (
             <div className="content-panel">
               <h2>{activeTab || 'Chào mừng đến với Kênh Người Bán'}</h2>
               <div className="panel-body">
                 <p>Đây là khu vực quản lý chức năng: <strong>{activeTab}</strong>. Tính năng đang trong quá trình phát triển.</p>
               </div>
             </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SellerDashboard;
