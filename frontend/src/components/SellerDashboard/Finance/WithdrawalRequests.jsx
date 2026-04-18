import React, { useEffect, useState } from 'react';
import './Finance.css';
import api from '../../../api/axios';
import { useSellerSession } from '../../../contexts/SellerSessionContext';

const WithdrawalRequests = () => {
  const { selectedShop } = useSellerSession();
  const [wallet, setWallet] = useState({ available_formatted: '0đ' });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFinance = async () => {
      if (!selectedShop?.id) {
        setWallet({ available_formatted: '0đ' });
        setHistory([]);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get('/seller/finance', {
          params: {
            shop_id: selectedShop.id,
          },
        });

        const data = response.data?.data || {};
        setWallet(data.wallet || { available_formatted: '0đ' });
        setHistory(data.settlements || []);
      } catch (error) {
        console.error('Error fetching withdrawal history:', error);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFinance();
  }, [selectedShop?.id]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Hoàn thành': return '#1e8e3e';
      case 'Đang xử lý': return '#fca120';
      case 'Từ chối': return '#d93025';
      default: return '#333';
    }
  }

  return (
    <div className="finance-container">
      <div className="finance-header">
        <div>
           <h2>Số dư khả dụng: <span style={{ color: '#fca120', fontSize: '24px', marginLeft: '8px' }}>{wallet.available_formatted}</span></h2>
           <p style={{ color: '#666', marginTop: '4px', fontSize: '14px' }}>Lịch sử đang lấy từ dữ liệu đối soát shop hiện có.</p>
        </div>
        <button className="finance-btn" disabled title="Chưa có schema yêu cầu rút tiền riêng trong backend hiện tại" style={{ opacity: 0.6, cursor: 'not-allowed' }}>Chưa hỗ trợ tạo yêu cầu rút</button>
      </div>

      <div className="finance-form-wrapper" style={{ marginBottom: '24px', maxWidth: '100%' }}>
        Chức năng gửi yêu cầu rút tiền riêng chưa được backend hiện tại hỗ trợ bằng bảng dữ liệu độc lập. Bên dưới là lịch sử đối soát và chuyển khoản thực tế từ hệ thống.
      </div>

      <div style={{ marginTop: '32px' }}>
         <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Lịch sử rút tiền</h3>
         <div style={{ overflowX: 'auto', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
               <thead>
                  <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #eee' }}>
                     <th style={{ padding: '16px', fontWeight: 600, color: '#333' }}>Mã GD</th>
                     <th style={{ padding: '16px', fontWeight: 600, color: '#333' }}>Ngày yêu cầu</th>
                     <th style={{ padding: '16px', fontWeight: 600, color: '#333' }}>Tài khoản nhận</th>
                     <th style={{ padding: '16px', fontWeight: 600, color: '#333' }}>Số tiền</th>
                     <th style={{ padding: '16px', fontWeight: 600, color: '#333' }}>Trạng thái</th>
                  </tr>
               </thead>
               <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#888' }}>Đang tải lịch sử đối soát...</td>
                  </tr>
                ) : history.length > 0 ? history.map((item) => (
                     <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '16px', fontFamily: 'monospace', fontWeight: 'bold' }}>{item.id}</td>
                        <td style={{ padding: '16px' }}>{item.date}</td>
                    <td style={{ padding: '16px' }}>{item.period || 'Đối soát shop'}</td>
                        <td style={{ padding: '16px', fontWeight: 'bold' }}>{item.amount}</td>
                        <td style={{ padding: '16px', color: getStatusColor(item.status), fontWeight: 500 }}>{item.status}</td>
                     </tr>
                )) : (
                  <tr>
                    <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#888' }}>Chưa có phiên đối soát nào cho shop này.</td>
                  </tr>
                )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default WithdrawalRequests;
