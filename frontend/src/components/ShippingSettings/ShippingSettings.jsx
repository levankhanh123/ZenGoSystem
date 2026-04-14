import React from 'react';
import './ShippingSettings.css';

const ShippingSettings = ({ onBack, onComplete, isSubmitting }) => {
  return (
    <div className="shipping-settings-container">
      <div className="shipping-form-section">
        <h3 className="section-title">Phương thức vận chuyển</h3>
        <div className="shipping-option selected">
          <input type="radio" checked readOnly className="radio-input" />
          <div className="shipping-option-details">
            <span className="shipping-option-name">Giao hàng nhanh</span>
            <span className="shipping-option-desc">Mặc định được hỗ trợ bởi đối tác vận chuyển của ZENGO</span>
          </div>
        </div>
      </div>

      <div className="sr-bottom-bar-wrapper">
        <div className="sr-bottom-bar">
          <button className="btn-save" onClick={onBack} disabled={isSubmitting}>Quay lại</button>
          <button className="btn-next" onClick={onComplete} disabled={isSubmitting}>
            {isSubmitting ? 'Đang xử lý...' : 'Hoàn tất'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShippingSettings;
