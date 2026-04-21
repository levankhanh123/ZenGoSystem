import React, { useState, useEffect } from 'react';
import './ShopVouchers.css';
import CreateVoucher from './CreateVoucher';
import api from '../../../api/axios';
import { useSellerSession } from '../../../contexts/SellerSessionContext';

const TABS = ['Tất cả', 'Đang diễn ra', 'Sắp diễn ra', 'Tạm dừng', 'Đã kết thúc'];

const getStatusClass = (status) => {
   switch(status) {
      case 'Đang diễn ra': return 'status-active';
      case 'Đã kết thúc': return 'status-expired';
      case 'Sắp diễn ra': return 'status-upcoming';
      case 'Tạm dừng': return 'status-paused';
      default: return '';
   }
}

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};

const formatCurrency = (amount) => {
    if (!amount) return '0đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const ShopVouchers = () => {
    const { selectedShop } = useSellerSession();
    const [activeTab, setActiveTab] = useState('Tất cả');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingVoucher, setEditingVoucher] = useState(null);
    const [vouchers, setVouchers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchVouchers = async () => {
        if (!selectedShop?.id) {
            setVouchers([]);
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.get('/seller/vouchers', {
                params: { shop_id: selectedShop.id }
            });
            setVouchers(response.data?.data || response.data || []);
        } catch (error) {
            console.error('Failed to fetch vouchers', error);
            setVouchers([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchVouchers();
    }, [selectedShop?.id]);

    const handleCreateNew = () => {
        setEditingVoucher(null);
        setIsFormOpen(true);
    };

    const handleEdit = (voucher) => {
        setEditingVoucher(voucher);
        setIsFormOpen(true);
    };

    const handleTogglePause = async (id) => {
        try {
            await api.patch(`/seller/vouchers/${id}/toggle-pause`);
            fetchVouchers();
        } catch (error) {
            alert('Không thể cập nhật trạng thái: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleEndEarly = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn kết thúc sớm voucher này?')) {
            try {
                await api.patch(`/seller/vouchers/${id}/end-early`);
                fetchVouchers();
            } catch (error) {
                alert('Lỗi: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    const handleFormSuccess = () => {
        setIsFormOpen(false);
        fetchVouchers();
    };

    const filteredVouchers = vouchers.filter(voucher => {
        return activeTab === 'Tất cả' || voucher.trang_thai === activeTab;
    });

  if (isFormOpen) {
    return (
        <CreateVoucher 
            shopId={selectedShop?.id} 
            editingVoucher={editingVoucher}
            onCancel={() => setIsFormOpen(false)} 
            onSuccess={handleFormSuccess} 
        />
    );
  }

  return (
    <div className="vouchers-container">
      <div className="vouchers-header">
        <h2>Chương trình giảm giá của Shop</h2>
        <button 
           className="create-voucher-btn" 
           onClick={handleCreateNew}
           disabled={!selectedShop}
        >
            + Tạo mã giảm giá
        </button>
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
         {isLoading ? (
             <div style={{ padding: '20px', textAlign: 'center' }}>Đang tải dữ liệu...</div>
         ) : (
             <table className="vouchers-table">
                <thead>
                   <tr>
                      <th>Mã Voucher</th>
                      <th>Thuộc tính / Mức giảm</th>
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
                         <td><span className="voucher-code">{voucher.ma_voucher}</span></td>
                         <td>
                            <div style={{fontWeight: 500}}>{voucher.loai === 'Shop' ? 'Voucher Shop' : 'Voucher Sàn'}</div>
                            <div style={{color: '#d93025', marginTop: '4px'}}>
                                Giảm {voucher.kieu_giam_gia === 'phan_tram' ? `${parseInt(voucher.gia_tri_voucher)}%` : formatCurrency(voucher.gia_tri_voucher)}
                            </div>
                            {voucher.kieu_giam_gia === 'phan_tram' && voucher.giam_toi_da > 0 && (
                                <div style={{fontSize: '12px', color: '#666', marginTop: '4px'}}>Tối đa {formatCurrency(voucher.giam_toi_da)}</div>
                            )}
                         </td>
                         <td>{formatCurrency(voucher.gia_tri_don_toi_thieu)}</td>
                         <td>{voucher.so_luong_da_dung} / {voucher.so_luong_voucher}</td>
                         <td>
                             <div style={{fontSize: '13px'}}>{formatDate(voucher.thoi_gian_bat_dau)}</div>
                             <div style={{fontSize: '13px', color: '#888'}}>Đến {formatDate(voucher.thoi_gian_ket_thuc)}</div>
                         </td>
                         <td><span className={`status-badge ${getStatusClass(voucher.trang_thai)}`}>{voucher.trang_thai}</span></td>
                         <td>
                             <div className="actions-cell">
                                {voucher.trang_thai !== 'Đã kết thúc' && (
                                    <>
                                        <button className="action-btn" onClick={() => handleEdit(voucher)}>Sửa</button>
                                        <button className="action-btn" onClick={() => handleTogglePause(voucher.id)}>
                                            {voucher.trang_thai === 'Tạm dừng' ? 'Khôi phục' : 'Tạm dừng'}
                                        </button>
                                        <button className="action-btn end-btn" onClick={() => handleEndEarly(voucher.id)}>Kết thúc</button>
                                    </>
                                )}
                                {voucher.trang_thai === 'Đã kết thúc' && (
                                    <button className="action-btn" onClick={() => handleEdit(voucher)}>Chi tiết</button>
                                )}
                             </div>
                         </td>
                      </tr>
                   )) : (
                      <tr>
                         <td colSpan="7" className="no-data">Không tìm thấy mã giảm giá nào!</td>
                      </tr>
                   )}
                </tbody>
             </table>
         )}
      </div>
    </div>
  );
};

export default ShopVouchers;
