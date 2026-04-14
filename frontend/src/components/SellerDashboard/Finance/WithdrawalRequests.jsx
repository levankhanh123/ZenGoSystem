import React, { useState } from 'react';
import './Finance.css';

const WithdrawalRequests = () => {
  const [isRequesting, setIsRequesting] = useState(false);
  const currentBalance = "15.500.000";

  // Mock data
  const [history, setHistory] = useState([
    { id: 'WD001', date: '25/03/2026', amount: '5.000.000đ', bank: 'Vietcombank (...6789)', status: 'Hoàn thành' },
    { id: 'WD002', date: '28/03/2026', amount: '2.500.000đ', bank: 'Techcombank (...9012)', status: 'Đang xử lý' },
    { id: 'WD003', date: '10/02/2026', amount: '10.000.000đ', bank: 'Vietcombank (...6789)', status: 'Từ chối' },
  ]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Hoàn thành': return '#1e8e3e';
      case 'Đang xử lý': return '#fca120';
      case 'Từ chối': return '#d93025';
      default: return '#333';
    }
  }

  if (isRequesting) {
    return (
      <div className="finance-container">
        <div className="finance-header">
           <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button className="back-btn" onClick={() => setIsRequesting(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>←</button>
              <h2>Tạo yêu cầu rút tiền</h2>
           </div>
        </div>
        <div className="finance-form-wrapper">
          <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#e6f4ea', borderRadius: '8px', color: '#1e8e3e' }}>
             <strong>Số dư khả dụng:</strong> <span style={{ fontSize: '18px' }}>{currentBalance} VNĐ</span>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); alert('Đã gửi yêu cầu rút tiền. Vui lòng chờ Admin duyệt!'); setIsRequesting(false); }}>
            <div className="form-group">
              <label>Rút về tài khoản ngân hàng</label>
              <select className="form-control" required>
                <option value="1">Vietcombank - NGUYEN VAN A - 0123456789 (Mặc định)</option>
                <option value="2">Techcombank - NGUYEN VAN A - 1903456789012</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Số tiền cần rút</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                 <input type="number" className="form-control" placeholder="Nhập số tiền muốn rút" max="15500000" min="50000" required />
                 <span style={{ position: 'absolute', right: '14px', color: '#666' }}>VNĐ</span>
              </div>
              <small style={{ color: '#888', marginTop: '4px', display: 'block' }}>Tối thiểu 50.000đ</small>
            </div>

            <div className="form-group" style={{ marginTop: '24px' }}>
               <label>Mật khẩu thanh toán (hoặc Mã PIN)</label>
               <input type="password" className="form-control" placeholder="Xác thực trước khi rút" required />
            </div>

            <div className="form-actions">
               <button type="button" className="btn-cancel" onClick={() => setIsRequesting(false)}>Hủy</button>
               <button type="submit" className="finance-btn">Gửi yêu cầu rút tiền</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="finance-container">
      <div className="finance-header">
        <div>
           <h2>Số dư khả dụng: <span style={{ color: '#fca120', fontSize: '24px', marginLeft: '8px' }}>{currentBalance}</span> đ</h2>
           <p style={{ color: '#666', marginTop: '4px', fontSize: '14px' }}>Cập nhật lần cuối: Hôm nay</p>
        </div>
        <button className="finance-btn" onClick={() => setIsRequesting(true)}>Tạo yêu cầu rút tiền</button>
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
                  {history.map((item) => (
                     <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '16px', fontFamily: 'monospace', fontWeight: 'bold' }}>{item.id}</td>
                        <td style={{ padding: '16px' }}>{item.date}</td>
                        <td style={{ padding: '16px' }}>{item.bank}</td>
                        <td style={{ padding: '16px', fontWeight: 'bold' }}>{item.amount}</td>
                        <td style={{ padding: '16px', color: getStatusColor(item.status), fontWeight: 500 }}>{item.status}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default WithdrawalRequests;
