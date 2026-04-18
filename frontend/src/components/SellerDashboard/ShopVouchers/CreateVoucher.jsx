import React from 'react';
import './CreateVoucher.css';

const CreateVoucher = ({ onCancel }) => {
  return (
    <div className="create-voucher-wrapper">
      <div className="create-voucher-card">
        <div className="create-voucher-header">
          <button className="back-btn" onClick={onCancel}>←</button>
          <h2>Tạo mã giảm giá mới</h2>
        </div>

        <div className="finance-form-wrapper" style={{ boxShadow: 'none', padding: 0, maxWidth: '100%' }}>
          <div style={{ padding: '20px', borderRadius: '8px', background: '#fff7ed', color: '#9a3412', marginBottom: '20px' }}>
            Schema hien tai cua he thong dang quan ly voucher theo campaign do admin tao va shop dang ky tham gia. Seller chua co bang du lieu rieng de tu tao voucher doc lap.
          </div>

          <div className="form-group">
            <label>Huong xu ly hien tai</label>
            <div className="form-control" style={{ background: '#f8fafc' }}>
              1. Xem danh sach campaign tai man hinh voucher.
              <br />
              2. Theo doi trang thai dang ky cua tung campaign.
              <br />
              3. Neu can mo luong seller tao voucher rieng, backend can them schema va API moi.
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onCancel}>Quay lại</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateVoucher;
