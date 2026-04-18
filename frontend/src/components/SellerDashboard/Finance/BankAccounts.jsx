import React from 'react';
import './Finance.css';
import { useSellerSession } from '../../../contexts/SellerSessionContext';

const BankAccounts = () => {
  const { selectedShop, selectedUser } = useSellerSession();

  return (
    <div className="finance-container">
      <div className="finance-header">
        <h2>Tài khoản ngân hàng của tôi</h2>
        <button className="finance-btn" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>Chưa hỗ trợ thêm tài khoản</button>
      </div>

      <div className="finance-form-wrapper" style={{ maxWidth: '100%' }}>
        <div style={{ marginBottom: '20px', padding: '16px', borderRadius: '8px', background: '#fff7ed', color: '#9a3412' }}>
          Backend hien tai chua co bang du lieu tai khoan ngan hang rieng cho seller. Man hinh nay da bo du lieu mock va chi hien thi thong tin shop that dang duoc gan voi seller session.
        </div>

        <div className="bank-cards-grid">
          <div className="bank-card default">
            <span className="default-badge">Shop hiện tại</span>
            <div className="bank-logo-placeholder">{(selectedShop?.ten_cua_hang || 'S').charAt(0).toUpperCase()}</div>
            <div className="bank-info">
              <h3>{selectedShop?.ten_cua_hang || 'Chưa chọn cửa hàng'}</h3>
              <p style={{ fontWeight: 500 }}>{selectedUser?.ho_ten || 'Chưa chọn tài khoản seller'}</p>
              <p>{selectedShop?.email || selectedUser?.email || 'Chưa có email'}</p>
              <p>{selectedShop?.so_dien_thoai || selectedUser?.so_dien_thoai || 'Chưa có số điện thoại'}</p>
              <p style={{ fontSize: '12px' }}>Địa chỉ lấy hàng: {selectedShop?.dia_chi_lay_hang || 'Chưa có dữ liệu'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankAccounts;
