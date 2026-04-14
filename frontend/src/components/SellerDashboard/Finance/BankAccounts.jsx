import React, { useState } from 'react';
import './Finance.css';

const BankAccounts = () => {
  const [isAdding, setIsAdding] = useState(false);
  
  // Mock data
  const [banks, setBanks] = useState([
    { id: 1, name: 'Vietcombank', branch: 'Chi nhánh hội sở', accountName: 'NGUYEN VAN A', accountNumber: '0123456789', isDefault: true },
    { id: 2, name: 'Techcombank', branch: 'Chi nhánh Ba Đình', accountName: 'NGUYEN VAN A', accountNumber: '1903456789012', isDefault: false },
  ]);

  if (isAdding) {
    return (
      <div className="finance-container">
        <div className="finance-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
             <button className="back-btn" onClick={() => setIsAdding(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>←</button>
             <h2>Thêm tài khoản ngân hàng</h2>
          </div>
        </div>
        <div className="finance-form-wrapper">
          <form onSubmit={(e) => { e.preventDefault(); alert('Thêm tài khoản thành công!'); setIsAdding(false); }}>
            <div className="form-group">
              <label>Ngân hàng</label>
              <select className="form-control" required>
                <option value="">Chọn ngân hàng</option>
                <option value="vcb">Vietcombank</option>
                <option value="tcb">Techcombank</option>
                <option value="mbb">MB Bank</option>
                <option value="vtb">VietinBank</option>
                <option value="bidv">BIDV</option>
              </select>
            </div>
            <div className="form-group">
              <label>Chi nhánh</label>
              <input type="text" className="form-control" placeholder="Nhập tên chi nhánh" required />
            </div>
            <div className="form-group">
              <label>Tên chủ tài khoản</label>
              <input type="text" className="form-control" placeholder="VIẾT HOA KHÔNG DẤU" required />
            </div>
            <div className="form-group">
              <label>Số tài khoản</label>
              <input type="number" className="form-control" placeholder="Nhập số tài khoản" required />
            </div>
            
            <div className="form-actions">
               <button type="button" className="btn-cancel" onClick={() => setIsAdding(false)}>Hủy</button>
               <button type="submit" className="finance-btn">Xác nhận</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="finance-container">
      <div className="finance-header">
        <h2>Tài khoản ngân hàng của tôi</h2>
        <button className="finance-btn" onClick={() => setIsAdding(true)}>+ Thêm tài khoản ngân hàng</button>
      </div>
      
      <div className="bank-cards-grid">
        {banks.map((bank) => (
          <div className={`bank-card ${bank.isDefault ? 'default' : ''}`} key={bank.id}>
            {bank.isDefault && <span className="default-badge">Mặc định</span>}
            <div className="bank-logo-placeholder">{bank.name.charAt(0)}</div>
            <div className="bank-info">
               <h3>{bank.name}</h3>
               <p style={{ fontWeight: 500 }}>{bank.accountNumber}</p>
               <p>{bank.accountName}</p>
               <p style={{ fontSize: '12px' }}>Chi nhánh: {bank.branch}</p>
            </div>
            <div className="bank-actions">
               <button className="btn-delete">Xóa tài khoản</button>
               {!bank.isDefault && <button className="btn-set-default">Đặt làm mặc định</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BankAccounts;
