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

   useEffect(() => {
      const fetchOrders = async () => {
         if (!selectedShop?.id) {
            setOrders([]);
            return;
         }

         try {
            setLoading(true);
            const response = await api.get('/orders', {
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
                        <button
                          className="action-btn view-btn"
                          onClick={() => window.alert(`Người nhận: ${order.recipient_name}\nSĐT: ${order.recipient_phone}\nĐịa chỉ: ${order.recipient_address}\nThanh toán: ${order.payment_status}`)}
                        >
                          Xem chi tiết
                        </button>
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
    </div>
  );
};

export default AllOrders;
