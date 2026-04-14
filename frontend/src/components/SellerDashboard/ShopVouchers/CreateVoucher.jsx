import React, { useState } from 'react';
import './CreateVoucher.css';

const CreateVoucher = ({ onCancel }) => {
  const [discountType, setDiscountType] = useState('amount');

  return (
    <div className="create-voucher-wrapper">
      <div className="create-voucher-card">
        <div className="create-voucher-header">
          <button className="back-btn" onClick={onCancel}>←</button>
          <h2>Tạo mã giảm giá mới</h2>
        </div>

        <form className="voucher-form" onSubmit={(e) => { e.preventDefault(); alert('Đã tạo mã thành công!'); onCancel(); }}>
          <div className="form-group">
            <label>Tên chương trình giảm giá <span className="required">*</span></label>
            <input type="text" className="form-control" placeholder="Ví dụ: Khuyến mãi tết 2026" required />
            <small style={{color: '#888', marginTop: '4px', display: 'block'}}>Tên chương trình không hiển thị cho người mua</small>
          </div>

          <div className="form-row">
            <div className="form-col">
              <div className="form-group">
                <label>Mã Voucher <span className="required">*</span></label>
                <div className="input-with-suffix">
                  <span style={{position: 'absolute', left: '14px', fontWeight: 'bold', color: '#555'}}>ZEN</span>
                  <input type="text" className="form-control" style={{paddingLeft: '50px'}} placeholder="Nhập mã tối đa 5 ký tự" maxLength="5" required />
                </div>
                <small style={{color: '#888', marginTop: '4px', display: 'block'}}>Mã người mua nhập lúc thanh toán. Bắt đầu bằng ZEN</small>
              </div>
            </div>
            <div className="form-col">
               <div className="form-group">
                  <label>Thời gian sử dụng mã <span className="required">*</span></label>
                  <div className="date-picker-group">
                     <input type="datetime-local" className="form-control" required />
                     <span className="date-separator">-</span>
                     <input type="datetime-local" className="form-control" required />
                  </div>
               </div>
            </div>
          </div>

          <div className="form-group">
             <label>Loại giảm giá | Mức giảm <span className="required">*</span></label>
             <div className="radio-group" style={{marginBottom: '16px'}}>
                <label className="radio-label">
                   <input type="radio" name="discountType" className="radio-input" 
                          checked={discountType === 'amount'} 
                          onChange={() => setDiscountType('amount')} />
                   Theo số tiền
                </label>
                <label className="radio-label">
                   <input type="radio" name="discountType" className="radio-input" 
                          checked={discountType === 'percent'} 
                          onChange={() => setDiscountType('percent')} />
                   Theo phần trăm
                </label>
             </div>
             
             <div className="form-row">
                <div className="form-col">
                   <div className="input-with-suffix">
                      <input type="number" className="form-control" placeholder="Nhập mức giảm" required />
                      <span className="suffix-text">{discountType === 'amount' ? 'đ' : '%'}</span>
                   </div>
                </div>
                {discountType === 'percent' && (
                  <div className="form-col">
                     <div className="input-with-suffix">
                        <input type="number" className="form-control" placeholder="Mức giảm tối đa" required />
                        <span className="suffix-text">đ</span>
                     </div>
                  </div>
                )}
             </div>
          </div>

          <div className="form-row">
             <div className="form-col">
                <div className="form-group">
                   <label>Giá trị đơn hàng tối thiểu <span className="required">*</span></label>
                   <div className="input-with-suffix">
                      <input type="number" className="form-control" placeholder="Nhập giá trị" required />
                      <span className="suffix-text">đ</span>
                   </div>
                </div>
             </div>
             <div className="form-col">
                <div className="form-group">
                   <label>Tổng lượt sử dụng tối đa <span className="required">*</span></label>
                   <input type="number" className="form-control" placeholder="Nhập số lượng" required />
                </div>
             </div>
          </div>

          <div className="form-actions">
             <button type="button" className="btn-cancel" onClick={onCancel}>Hủy</button>
             <button type="submit" className="btn-submit">Lưu xác nhận</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateVoucher;
