import React, { useState, useEffect } from 'react';
import './CreateVoucher.css';
import api from '../../../api/axios';

const CreateVoucher = ({ shopId, editingVoucher, onCancel, onSuccess }) => {
  const isEditMode = !!editingVoucher;
  const status = editingVoucher?.trang_thai;
  
  const [discountType, setDiscountType] = useState('so_tien');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
      ten_voucher: '',
      ma_voucher_suffix: '', 
      thoi_gian_bat_dau: '',
      thoi_gian_ket_thuc: '',
      gia_tri_voucher: '',
      giam_toi_da: '',
      gia_tri_don_toi_thieu: '',
      so_luong_voucher: ''
  });

  useEffect(() => {
     if (isEditMode && editingVoucher) {
         setFormData({
             ten_voucher: editingVoucher.ten_voucher || '',
             ma_voucher_suffix: editingVoucher.ma_voucher?.replace('ZEN', '') || '',
             thoi_gian_bat_dau: editingVoucher.thoi_gian_bat_dau?.replace(' ', 'T').substring(0, 16) || '',
             thoi_gian_ket_thuc: editingVoucher.thoi_gian_ket_thuc?.replace(' ', 'T').substring(0, 16) || '',
             gia_tri_voucher: parseInt(editingVoucher.gia_tri_voucher) || '',
             giam_toi_da: parseInt(editingVoucher.giam_toi_da) || '',
             gia_tri_don_toi_thieu: parseInt(editingVoucher.gia_tri_don_toi_thieu) || '',
             so_luong_voucher: editingVoucher.so_luong_voucher || ''
         });
         setDiscountType(editingVoucher.kieu_giam_gia || 'so_tien');
     }
  }, [editingVoucher, isEditMode]);

  const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
          ...prev,
          [name]: value
      }));
  };

  const isFieldDisabled = (fieldName) => {
      if (!isEditMode) return false;
      if (status === 'Đã kết thúc') return true;
      
      // Nếu đang diễn ra hoặc tạm dừng
      if (status === 'Đang diễn ra' || status === 'Tạm dừng') {
          const restrictedFields = ['ma_voucher_suffix', 'thoi_gian_bat_dau', 'gia_tri_voucher', 'gia_tri_don_toi_thieu', 'giam_toi_da', 'discountType'];
          if (fieldName === 'discountType') return true;
          return restrictedFields.includes(fieldName);
      }
      
      return false; // Status 'Sắp diễn ra' cho sửa hết
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);

      const m_voucher = 'ZEN' + formData.ma_voucher_suffix;
      
      const payload = {
          cua_hang_id: shopId,
          loai: 'Shop',
          ten_voucher: formData.ten_voucher,
          ma_voucher: m_voucher,
          thoi_gian_bat_dau: formData.thoi_gian_bat_dau.replace('T', ' '),
          thoi_gian_ket_thuc: formData.thoi_gian_ket_thuc.replace('T', ' '),
          gia_tri_voucher: parseFloat(formData.gia_tri_voucher),
          kieu_giam_gia: discountType,
          giam_toi_da: discountType === 'phan_tram' ? parseFloat(formData.giam_toi_da || 0) : 0,
          gia_tri_don_toi_thieu: parseFloat(formData.gia_tri_don_toi_thieu),
          so_luong_voucher: parseInt(formData.so_luong_voucher, 10),
      };

      try {
          let response;
          if (isEditMode) {
              response = await api.put(`/vouchers/${editingVoucher.id}`, payload);
          } else {
              response = await api.post('/vouchers', payload);
          }

          if (response.status === 200 || response.status === 201) {
              alert(isEditMode ? 'Cập nhật thành công!' : 'Tạo mã thành công!');
              if (onSuccess) onSuccess();
          }
      } catch (error) {
          console.error("Error saving voucher:", error);
          const msg = error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.';
          alert('Lỗi: ' + msg);
      } finally {
          setIsSubmitting(false);
      }
  };

  return (
    <div className="create-voucher-wrapper">
      <div className="create-voucher-card">
        <div className="create-voucher-header">
          <button className="back-btn" onClick={onCancel} disabled={isSubmitting}>←</button>
          <h2>{isEditMode ? (status === 'Đã kết thúc' ? 'Chi tiết voucher' : 'Chỉnh sửa voucher') : 'Tạo mã giảm giá mới'}</h2>
        </div>

        <form className="voucher-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên chương trình giảm giá <span className="required">*</span></label>
            <input 
                type="text" 
                className="form-control" 
                name="ten_voucher" 
                value={formData.ten_voucher} 
                onChange={handleInputChange} 
                placeholder="Ví dụ: Khuyến mãi tết 2026" 
                required 
                disabled={isFieldDisabled('ten_voucher')}
            />
            <small style={{color: '#888', marginTop: '4px', display: 'block'}}>Tên chương trình không hiển thị cho người mua</small>
          </div>

          <div className="form-row">
            <div className="form-col">
              <div className="form-group">
                <label>Mã Voucher <span className="required">*</span></label>
                <div className="input-with-suffix">
                  <span style={{position: 'absolute', left: '14px', fontWeight: 'bold', color: '#555'}}>ZEN</span>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="ma_voucher_suffix" 
                    value={formData.ma_voucher_suffix} 
                    onChange={handleInputChange} 
                    style={{paddingLeft: '50px'}} 
                    placeholder="Nhập mã tối đa 5 ký tự" 
                    maxLength="5" 
                    required 
                    disabled={isFieldDisabled('ma_voucher_suffix')}
                  />
                </div>
                <small style={{color: '#888', marginTop: '4px', display: 'block'}}>Mã người mua nhập lúc thanh toán. Bắt đầu bằng ZEN</small>
              </div>
            </div>
            <div className="form-col">
               <div className="form-group">
                  <label>Thời gian sử dụng mã <span className="required">*</span></label>
                  <div className="date-picker-group">
                     <input 
                        type="datetime-local" 
                        className="form-control" 
                        name="thoi_gian_bat_dau" 
                        value={formData.thoi_gian_bat_dau} 
                        onChange={handleInputChange} 
                        required 
                        disabled={isFieldDisabled('thoi_gian_bat_dau')}
                     />
                     <span className="date-separator">-</span>
                     <input 
                        type="datetime-local" 
                        className="form-control" 
                        name="thoi_gian_ket_thuc" 
                        value={formData.thoi_gian_ket_thuc} 
                        onChange={handleInputChange} 
                        required 
                        disabled={isFieldDisabled('thoi_gian_ket_thuc')}
                     />
                  </div>
               </div>
            </div>
          </div>

          <div className="form-group">
             <label>Loại giảm giá | Mức giảm <span className="required">*</span></label>
             <div className="radio-group" style={{marginBottom: '16px'}}>
                <label className="radio-label">
                   <input type="radio" name="discountType" className="radio-input" 
                          checked={discountType === 'so_tien'} 
                          onChange={() => !isFieldDisabled('discountType') && setDiscountType('so_tien')}
                          disabled={isFieldDisabled('discountType')} />
                   Theo số tiền
                </label>
                <label className="radio-label">
                   <input type="radio" name="discountType" className="radio-input" 
                          checked={discountType === 'phan_tram'} 
                          onChange={() => !isFieldDisabled('discountType') && setDiscountType('phan_tram')}
                          disabled={isFieldDisabled('discountType')} />
                   Theo phần trăm
                </label>
             </div>
             
             <div className="form-row">
                <div className="form-col">
                   <div className="input-with-suffix">
                      <input 
                        type="number" 
                        className="form-control" 
                        name="gia_tri_voucher" 
                        value={formData.gia_tri_voucher} 
                        onChange={handleInputChange} 
                        placeholder="Nhập mức giảm" 
                        min="1" 
                        max={discountType === 'phan_tram' ? 100 : undefined} 
                        required 
                        disabled={isFieldDisabled('gia_tri_voucher')}
                      />
                      <span className="suffix-text">{discountType === 'so_tien' ? 'đ' : '%'}</span>
                   </div>
                </div>
                {discountType === 'phan_tram' && (
                  <div className="form-col">
                     <div className="input-with-suffix">
                        <input 
                            type="number" 
                            className="form-control" 
                            name="giam_toi_da" 
                            value={formData.giam_toi_da} 
                            onChange={handleInputChange} 
                            placeholder="Mức giảm tối đa" 
                            required 
                            disabled={isFieldDisabled('giam_toi_da')}
                        />
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
                      <input 
                        type="number" 
                        className="form-control" 
                        name="gia_tri_don_toi_thieu" 
                        value={formData.gia_tri_don_toi_thieu} 
                        onChange={handleInputChange} 
                        placeholder="Nhập giá trị" 
                        min="0" 
                        required 
                        disabled={isFieldDisabled('gia_tri_don_toi_thieu')}
                      />
                      <span className="suffix-text">đ</span>
                   </div>
                </div>
             </div>
             <div className="form-col">
                <div className="form-group">
                   <label>Tổng lượt sử dụng tối đa <span className="required">*</span> {isEditMode && status !== 'Sắp diễn ra' && <span style={{fontSize: '11px', color: '#ee4d2d'}}>(Chỉ cho phép tăng)</span>}</label>
                   <input 
                    type="number" 
                    className="form-control" 
                    name="so_luong_voucher" 
                    value={formData.so_luong_voucher} 
                    onChange={handleInputChange} 
                    placeholder="Nhập số lượng" 
                    min={isEditMode && status !== 'Sắp diễn ra' ? editingVoucher.so_luong_voucher : 1} 
                    required 
                    disabled={isFieldDisabled('so_luong_voucher')}
                   />
                </div>
             </div>
          </div>

          <div className="form-actions">
             <button type="button" className="btn-cancel" onClick={onCancel} disabled={isSubmitting}>Hủy</button>
             {status !== 'Đã kết thúc' && (
                 <button type="submit" className="btn-submit" disabled={isSubmitting}>
                     {isSubmitting ? 'Đang lưu...' : (isEditMode ? 'Cập nhật' : 'Lưu xác nhận')}
                 </button>
             )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateVoucher;
