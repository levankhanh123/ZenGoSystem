import React, { useState } from 'react';
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
import NotificationBell from '../NotificationBell/NotificationBell';
import './SellerDashboard.css';

const SellerDashboard = () => {
  const navigate = useNavigate();
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

  const toggleMenu = (menuKey) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const handleSubMenuClick = (tabName) => {
    setActiveTab(tabName);
  };

  return (
    <div className="dashboard-wrapper">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="zengo-logo">ZENGO</h1>
          <span className="header-title">Kênh Người Bán</span>
        </div>
        <div className="header-right" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <NotificationBell nguoiDungId={1} />
          
          <div 
             className="user-profile-section"
             onClick={() => setShowLogout(!showLogout)}
             style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}
          >
            <div className="shop-avatar-placeholder">H</div>
            <span className="shop-name-display">hieuzk123</span>
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
