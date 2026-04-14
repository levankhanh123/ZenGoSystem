import React, { useState } from 'react';
import './HandoverOrders.css';

// Mock data representing orders that are "Đang chuẩn bị" and ready to be handed over
const initialHandoverOrders = [
  { id: 'ZG20191', customer: 'Lê Văn Khang', carrier: 'Giao Hàng Nhanh', products: 'Đồng hồ nam x1', date: '21/03/2026 08:30' },
  { id: 'ZG20192', customer: 'Trần Thị Thu', carrier: 'J&T Express', products: 'Giày thể thao x1', date: '21/03/2026 09:15' },
  { id: 'ZG20193', customer: 'Nguyễn Hữu A', carrier: 'Viettel Post', products: 'Ốp lưng iPhone x3', date: '21/03/2026 10:05' },
  { id: 'ZG20194', customer: 'Phạm Bình', carrier: 'Giao Hàng Nhanh', products: 'Túi xách nữ x1', date: '21/03/2026 11:20' },
];

const HandoverOrders = () => {
  const [orders, setOrders] = useState(initialHandoverOrders);
  const [selectedIds, setSelectedIds] = useState([]);

  // Handles checkbox selection
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(orders.map(o => o.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (e, id) => {
    if (e.target.checked) {
        setSelectedIds(prev => [...prev, id]);
    } else {
        setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  // Mock Action Functions
  const printPackingSlip = (idList) => {
    if(idList.length === 0) return alert('Vui lòng chọn ít nhất 1 đơn hàng!');
    alert(`Đang in phiếu đóng gói cho ${idList.length} đơn hàng:\n${idList.join(', ')}`);
  };

  const printShippingLabel = (idList) => {
    if(idList.length === 0) return alert('Vui lòng chọn ít nhất 1 đơn hàng!');
    alert(`Đang in vận đơn cho ${idList.length} đơn hàng:\n${idList.join(', ')}`);
  };

  const confirmHandover = (idList) => {
    if(idList.length === 0) return alert('Vui lòng chọn ít nhất 1 đơn hàng để bàn giao!');
    if(window.confirm(`Xác nhận đã bàn giao ${idList.length} đơn hàng này cho Shipper?`)) {
      setOrders(orders.filter(o => !idList.includes(o.id)));
      setSelectedIds([]);
      alert('Đã cập nhật trạng thái "Đang giao" thành công!');
    }
  };

  const isAllSelected = orders.length > 0 && selectedIds.length === orders.length;

  return (
    <div className="handover-container">
      <div className="handover-header">
        <h2 className="handover-title">Bàn giao đơn hàng</h2>
        <p className="handover-desc">Quản lý các đơn hàng đã đóng gói và chuẩn bị bàn giao cho đơn vị vận chuyển.</p>
      </div>

      {/* Batch Action Bar */}
      <div className="batch-action-bar">
         <div className="batch-left">
           <input 
             type="checkbox" 
             className="custom-checkbox" 
             checked={isAllSelected}
             onChange={handleSelectAll}
           />
           <span className="selected-count">Đã chọn <strong>{selectedIds.length}</strong> đơn hàng</span>
         </div>
         <div className="batch-right">
           <button 
              className="btn btn-outline" 
              onClick={() => printPackingSlip(selectedIds)}
              disabled={selectedIds.length === 0}
           >
              In phiếu đóng gói
           </button>
           <button 
              className="btn btn-outline" 
              onClick={() => printShippingLabel(selectedIds)}
              disabled={selectedIds.length === 0}
           >
              In vận đơn
           </button>
           <button 
              className="btn btn-primary" 
              onClick={() => confirmHandover(selectedIds)}
              disabled={selectedIds.length === 0}
           >
              Xác nhận bàn giao hàng loạt
           </button>
         </div>
      </div>

      {/* Orders Table */}
      <div className="handover-list-wrapper">
         <table className="handover-table">
            <thead>
               <tr>
                  <th width="40"></th>
                  <th>Mã đơn hàng</th>
                  <th>Khách hàng</th>
                  <th>Sản phẩm</th>
                  <th>Đơn vị vận chuyển</th>
                  <th>Thời gian duyệt</th>
                  <th>Thao tác</th>
               </tr>
            </thead>
            <tbody>
               {orders.length > 0 ? orders.map(order => (
                  <tr key={order.id} className={selectedIds.includes(order.id) ? 'row-selected' : ''}>
                     <td>
                        <input 
                           type="checkbox" 
                           className="custom-checkbox"
                           checked={selectedIds.includes(order.id)}
                           onChange={(e) => handleSelectOne(e, order.id)}
                        />
                     </td>
                     <td><span className="order-id">{order.id}</span></td>
                     <td>{order.customer}</td>
                     <td>{order.products}</td>
                     <td><span className="carrier-badge">{order.carrier}</span></td>
                     <td>{order.date}</td>
                     <td>
                        <div className="action-col">
                          <button className="text-btn" onClick={() => printPackingSlip([order.id])}>In phiếu</button>
                          <span className="divider">|</span>
                          <button className="text-btn" onClick={() => printShippingLabel([order.id])}>In vận đơn</button>
                          <span className="divider">|</span>
                          <button className="text-btn confirm-text-btn" onClick={() => confirmHandover([order.id])}>Bàn giao</button>
                        </div>
                     </td>
                  </tr>
               )) : (
                  <tr>
                     <td colSpan="7" className="no-data-handover">
                        <div className="empty-state">
                           <div className="empty-icon">📦</div>
                           <p>Không có đơn hàng nào chờ bàn giao</p>
                        </div>
                     </td>
                  </tr>
               )}
            </tbody>
         </table>
      </div>
    </div>
  );
};

export default HandoverOrders;
