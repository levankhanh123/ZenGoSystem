import React, { useEffect, useState } from 'react';
import './AllOrders.css';
import api from '../../../api/axios';
import { useSellerSession } from '../../../contexts/SellerSessionContext';

const TABS = ['Tất cả', 'Chờ xác nhận', 'Đang chuẩn bị', 'Đang giao', 'Đã giao', 'Đã hủy'];

const STATUS_TO_CODE = {
   'Chờ xác nhận': ['cho_xac_nhan', 'cho_he_thong_xac_nhan'],
   'Đang chuẩn bị': ['da_xac_nhan', 'dang_xu_ly', 'cho_lay_hang', 'dang_dong_goi'],
   'Đang giao': ['dang_giao'],
   'Đã giao': ['da_giao'],
   'Đã hủy': ['da_huy'],
};

const getStatusClass = (status) => {
   switch(status) {
      case 'Chờ xác nhận': return 'status-pending';
      case 'Đang chuẩn bị': return 'status-preparing';
      case 'Đang giao': return 'status-shipping';
      case 'Đã giao': return 'status-delivered';
      case 'Đã hủy': return 'status-cancelled';
      default: return '';
   }
}

const AllOrders = () => {
   const { selectedShop } = useSellerSession();
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [searchTerm, setSearchTerm] = useState('');
   const [orders, setOrders] = useState([]);
   const [loading, setLoading] = useState(false);
   const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

   useEffect(() => {
      const fetchOrders = async () => {
         if (!selectedShop?.id) {
            setOrders([]);
            return;
         }

         try {
            setLoading(true);
            const response = await api.get('/seller/orders', {
               params: {
                  shop_id: selectedShop.id,
               },
            });

            setOrders(response.data?.data || []);
         } catch (error) {
            console.error('Error fetching seller orders:', error);
            setOrders([]);
         } finally {
            setLoading(false);
         }
      };

      fetchOrders();
   }, [selectedShop?.id]);

   const handleConfirmOrder = async (orderId) => {
      try {
         await api.patch(`/seller/orders/${orderId}/status`, {
            shop_id: selectedShop.id,
            status: 'dang_xu_ly'
         });
         
         setOrders(prevOrders => 
            prevOrders.map(order => 
               order.id === orderId 
                  ? { ...order, status_code: 'dang_xu_ly', status: 'Đang chuẩn bị' }
                  : order
            )
         );
      } catch (error) {
         console.error('Lỗi khi xác nhận đơn:', error);
         alert('Xác nhận đơn thất bại. Vui lòng thử lại.');
      }
   };

   const handleCancelOrder = async (orderId) => {
      const reason = window.prompt('Vui lòng nhập lý do hủy đơn:');
      if (reason === null) return; // User cancelled
      if (!reason.trim()) {
         alert('Vui lòng nhập lý do hủy để thông báo cho khách hàng.');
         return;
      }
      
      try {
         await api.patch(`/seller/orders/${orderId}/status`, {
            shop_id: selectedShop.id,
            status: 'da_huy',
            ly_do_huy: reason
         });
         
         setOrders(prevOrders => 
            prevOrders.map(order => 
               order.id === orderId 
                  ? { ...order, status_code: 'da_huy', status: 'Đã hủy', ly_do_huy: reason }
                  : order
            )
         );
      } catch (error) {
         console.error('Lỗi khi hủy đơn:', error);
         alert('Hủy đơn thất bại. Vui lòng thử lại.');
      }
   };

   const filteredOrders = orders.filter(order => {
      const matchStatus = activeTab === 'Tất cả' || STATUS_TO_CODE[activeTab]?.includes(order.status_code) || order.status === activeTab;
    const searchLower = searchTerm.toLowerCase();
      const matchSearch = order.code.toLowerCase().includes(searchLower) || order.customer.toLowerCase().includes(searchLower);
    return matchStatus && matchSearch;
  });

  return (
    <div className="all-orders-container">
         {!selectedShop && <div className="no-data">Chưa có cửa hàng được chọn để tải đơn hàng.</div>}
      <div className="orders-tabs">
        {TABS.map(tab => (
           <button 
             key={tab} 
             className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
             onClick={() => setActiveTab(tab)}
           >
             {tab}
           </button>
        ))}
      </div>

      <div className="orders-search-bar">
         <input 
           type="text" 
           placeholder="Mã đơn hàng, Tên khách hàng..." 
           className="search-input"
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
         />
         <button className="search-btn">Tìm kiếm</button>
      </div>

      <div className="orders-table-wrapper">
         <table className="orders-table">
            <thead>
               <tr>
                  <th>Mã đơn hàng</th>
                  <th>Khách hàng</th>
                  <th>Sản phẩm</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
               </tr>
            </thead>
            <tbody>
               {loading ? (
                  <tr>
                     <td colSpan="6" className="no-data">Đang tải đơn hàng...</td>
                  </tr>
               ) : filteredOrders.length > 0 ? filteredOrders.map(order => (
                  <tr key={order.id}>
                     <td><span className="order-id">{order.code}</span></td>
                     <td>{order.customer}</td>
                     <td>{order.products}</td>
                     <td><span className="order-total">{order.total_formatted}</span></td>
                     <td><span className={`status-badge ${getStatusClass(order.status)}`}>{order.status}</span></td>
                     <td>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                           {(order.status_code === 'cho_xac_nhan' || order.status_code === 'cho_he_thong_xac_nhan') && (
                              <>
                                 <button
                                   title="Xác nhận đơn"
                                   className="action-btn"
                                   style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                   onClick={() => handleConfirmOrder(order.id)}
                                 >
                                   Xác nhận
                                 </button>
                                 <button
                                   title="Hủy đơn"
                                   className="action-btn"
                                   style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                   onClick={() => handleCancelOrder(order.id)}
                                 >
                                   Hủy đơn
                                 </button>
                              </>
                           )}
                           <button
                             title="Xem chi tiết"
                             className="action-btn view-btn"
                             style={{ padding: '6px 10px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
                             onClick={() => setSelectedOrderDetails(order)}
                           >
                             Xem
                           </button>
                        </div>
                     </td>
                  </tr>
               )) : (
                  <tr>
                     <td colSpan="6" className="no-data">Không tìm thấy đơn hàng nào!</td>
                  </tr>
               )}
            </tbody>
         </table>
      </div>

      {/* Order Details Modal */}
      {selectedOrderDetails && (
         <div className="order-details-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="order-details-modal-content" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', width: '500px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '12px', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>Chi tiết đơn hàng {selectedOrderDetails.code}</h3>
                  <button onClick={() => setSelectedOrderDetails(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', lineHeight: '1' }}>&times;</button>
               </div>
               
               <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: '15px', color: '#374151' }}>Thông tin giao hàng</h4>
                  <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Người nhận:</strong> {selectedOrderDetails.recipient_name}</p>
                  <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Số điện thoại:</strong> {selectedOrderDetails.recipient_phone}</p>
                  <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Địa chỉ:</strong> {selectedOrderDetails.recipient_address}</p>
                  <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Thanh toán:</strong> {selectedOrderDetails.payment_status}</p>
                  {selectedOrderDetails.ly_do_huy && (
                     <p style={{ margin: '4px 0', fontSize: '14px', color: '#ef4444' }}><strong>Lý do hủy:</strong> {selectedOrderDetails.ly_do_huy}</p>
                  )}
               </div>

               <div>
                  <h4 style={{ margin: '0 0 8px', fontSize: '15px', color: '#374151' }}>Sản phẩm</h4>
                  <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '14px' }}>
                     {selectedOrderDetails.products?.split(', ').map((prod, idx) => (
                        <li key={idx} style={{ marginBottom: '4px' }}>{prod}</li>
                     ))}
                  </ul>
               </div>
               
               <div style={{ marginTop: '24px', textAlign: 'right' }}>
                  <button 
                     onClick={() => setSelectedOrderDetails(null)}
                     style={{ padding: '8px 16px', background: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
                  >
                     Đóng
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default AllOrders;
