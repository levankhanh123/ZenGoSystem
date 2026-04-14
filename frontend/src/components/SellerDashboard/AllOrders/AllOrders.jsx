import React, { useState } from 'react';
import './AllOrders.css';

// Mock data
const initialOrders = [
  { id: 'ZG10293', customer: 'Nguyễn Văn A', products: 'Áo thun nam x1', total: '150.000đ', status: 'Chờ xác nhận' },
  { id: 'ZG10294', customer: 'Lê Thị B', products: 'Quần jean nữ x2', total: '450.000đ', status: 'Đang chuẩn bị' },
  { id: 'ZG10295', customer: 'Trần C', products: 'Giày sneaker x1', total: '300.000đ', status: 'Đang giao' },
  { id: 'ZG10296', customer: 'Hoàng D', products: 'Mũ lưỡi trai x1', total: '80.000đ', status: 'Đã giao' },
  { id: 'ZG10297', customer: 'Phạm E', products: 'Áo khoác x1', total: '250.000đ', status: 'Đã hủy' },
];

const TABS = ['Tất cả', 'Chờ xác nhận', 'Đang chuẩn bị', 'Đang giao', 'Đã giao', 'Đã hủy'];

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
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = initialOrders.filter(order => {
    const matchStatus = activeTab === 'Tất cả' || order.status === activeTab;
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = order.id.toLowerCase().includes(searchLower) || order.customer.toLowerCase().includes(searchLower);
    return matchStatus && matchSearch;
  });

  return (
    <div className="all-orders-container">
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
               {filteredOrders.length > 0 ? filteredOrders.map(order => (
                  <tr key={order.id}>
                     <td><span className="order-id">{order.id}</span></td>
                     <td>{order.customer}</td>
                     <td>{order.products}</td>
                     <td><span className="order-total">{order.total}</span></td>
                     <td><span className={`status-badge ${getStatusClass(order.status)}`}>{order.status}</span></td>
                     <td>
                        <button className="action-btn view-btn">Xem chi tiết</button>
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
