import React, { useState } from 'react';
import './ShopVouchers.css';
import CreateVoucher from './CreateVoucher';

// Mock data
const initialVouchers = [
  { id: 1, code: 'GIAM10K', type: 'Giảm số tiền', value: '10.000đ', minOrder: '100.000đ', usage: '45/100', status: 'Đang diễn ra', expiry: '31/12/2026' },
  { id: 2, code: 'SIEUSALE20', type: 'Giảm phần trăm', value: '20%', minOrder: '500.000đ', usage: '12/50', status: 'Đang diễn ra', expiry: '15/11/2026' },
  { id: 3, code: 'FREESHIP', type: 'Miễn phí vận chuyển', value: 'Tối đa 30k', minOrder: '200.000đ', usage: '100/100', status: 'Đã kết thúc', expiry: '01/10/2025' },
];

const TABS = ['Tất cả', 'Đang diễn ra', 'Sắp diễn ra', 'Đã kết thúc'];

const getStatusClass = (status) => {
   switch(status) {
      case 'Đang diễn ra': return 'status-active';
      case 'Đã kết thúc': return 'status-expired';
      default: return '';
   }
}

const ShopVouchers = () => {
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [isCreating, setIsCreating] = useState(false);

  const filteredVouchers = initialVouchers.filter(voucher => {
    return activeTab === 'Tất cả' || voucher.status === activeTab;
  });

  if (isCreating) {
    return <CreateVoucher onCancel={() => setIsCreating(false)} />;
  }

  return (
    <div className="vouchers-container">
      <div className="vouchers-header">
        <h2>Chương trình giảm giá của Shop</h2>
        <button className="create-voucher-btn" onClick={() => setIsCreating(true)}>+ Tạo mã giảm giá</button>
      </div>

      <div className="vouchers-tabs">
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

      <div className="vouchers-table-wrapper">
         <table className="vouchers-table">
            <thead>
               <tr>
                  <th>Mã Voucher</th>
                  <th>Loại giảm giá / Mức giảm</th>
                  <th>Đơn tối thiểu</th>
                  <th>Đã dùng / Tổng</th>
                  <th>Hạn sử dụng</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
               </tr>
            </thead>
            <tbody>
               {filteredVouchers.length > 0 ? filteredVouchers.map(voucher => (
                  <tr key={voucher.id}>
                     <td><span className="voucher-code">{voucher.code}</span></td>
                     <td>
                        <div style={{fontWeight: 500}}>{voucher.type}</div>
                        <div style={{color: '#d93025', marginTop: '4px'}}>{voucher.value}</div>
                     </td>
                     <td>{voucher.minOrder}</td>
                     <td>{voucher.usage}</td>
                     <td>{voucher.expiry}</td>
                     <td><span className={`status-badge ${getStatusClass(voucher.status)}`}>{voucher.status}</span></td>
                     <td>
                        <button className="action-btn">Chi tiết</button>
                     </td>
                  </tr>
               )) : (
                  <tr>
                     <td colSpan="7" className="no-data">Không tìm thấy mã giảm giá nào!</td>
                  </tr>
               )}
            </tbody>
         </table>
      </div>
    </div>
  );
};

export default ShopVouchers;
