import React, { useEffect, useState } from 'react';
import './ShopVouchers.css';
import CreateVoucher from './CreateVoucher';
import api from '../../../api/axios';
import { useSellerSession } from '../../../contexts/SellerSessionContext';

const TABS = ['Tất cả', 'Đang diễn ra', 'Sắp diễn ra', 'Đã kết thúc'];

const getStatusClass = (status) => {
   switch(status) {
      case 'Đang diễn ra': return 'status-active';
      case 'Đã kết thúc': return 'status-expired';
      default: return '';
   }
}

const ShopVouchers = () => {
   const { selectedShop } = useSellerSession();
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [isCreating, setIsCreating] = useState(false);
   const [vouchers, setVouchers] = useState([]);
   const [loading, setLoading] = useState(false);

   useEffect(() => {
      const fetchVouchers = async () => {
         if (!selectedShop?.id) {
            setVouchers([]);
            return;
         }

         try {
            setLoading(true);
            const response = await api.get('/seller/vouchers', {
               params: {
                  shop_id: selectedShop.id,
               },
            });

            setVouchers(response.data?.data || []);
         } catch (error) {
            console.error('Error fetching seller vouchers:', error);
            setVouchers([]);
         } finally {
            setLoading(false);
         }
      };

      fetchVouchers();
   }, [selectedShop?.id]);

   const filteredVouchers = vouchers.filter(voucher => {
    return activeTab === 'Tất cả' || voucher.status === activeTab;
  });

  if (isCreating) {
    return <CreateVoucher onCancel={() => setIsCreating(false)} />;
  }

  return (
    <div className="vouchers-container">
      <div className="vouchers-header">
        <h2>Chương trình giảm giá của Shop</h2>
            <button className="create-voucher-btn" onClick={() => setIsCreating(true)}>Thông tin tạo voucher</button>
      </div>

         {!selectedShop && <div className="no-data">Chưa có cửa hàng được chọn để tải voucher.</div>}

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
               {loading ? (
                  <tr>
                     <td colSpan="7" className="no-data">Đang tải voucher...</td>
                  </tr>
               ) : filteredVouchers.length > 0 ? filteredVouchers.map(voucher => (
                  <tr key={voucher.id}>
                     <td><span className="voucher-code">{voucher.code}</span></td>
                     <td>
                        <div style={{fontWeight: 500}}>{voucher.type}</div>
                        <div style={{color: '#d93025', marginTop: '4px'}}>{voucher.value}</div>
                        {voucher.registration_status_label && (
                          <div style={{ color: '#64748b', marginTop: '4px', fontSize: '12px' }}>
                            Trạng thái đăng ký: {voucher.registration_status_label}
                          </div>
                        )}
                     </td>
                     <td>{voucher.min_order}</td>
                     <td>{voucher.usage}</td>
                     <td>{voucher.expiry || 'Chưa xác định'}</td>
                     <td><span className={`status-badge ${getStatusClass(voucher.status)}`}>{voucher.status}</span></td>
                     <td>
                        <button className="action-btn" onClick={() => window.alert(voucher.note || 'Chưa có ghi chú thêm cho chiến dịch này.')}>Chi tiết</button>
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
