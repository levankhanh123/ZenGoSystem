import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ShopInformation from './ShopInformation/ShopInformation';
import ShippingSettings from './ShippingSettings/ShippingSettings';
import api from '../api/axios';
import './SellerRegistration.css';

const SellerRegistration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [shopData, setShopData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleShopInfoNext = (data) => {
    setShopData(data);
    setStep(2);
    setSubmitError(null);
  };

  const handleShippingComplete = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const formData = new FormData();
      // Temporarily mock user_id since there is no logged-in context yet
      formData.append('user_id', 1);
      
      formData.append('shopName', shopData.shopName);
      formData.append('email', shopData.email);
      formData.append('phone', shopData.phone);
      formData.append('address', shopData.address);
      if (shopData.shopAvatar) {
        formData.append('shopAvatar', shopData.shopAvatar);
      }

      await api.post('/seller-registration', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setStep(3);
    } catch (error) {
      console.error('Lỗi khi đăng ký shop:', error);
      setSubmitError(error.response?.data?.error || 'Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại sau.');
      alert(error.response?.data?.error || 'Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="seller-registration-wrapper">
      <header className="sr-header">
        <div className="sr-header-content">
          <h1 className="zengo-logo">ZENGO</h1>
          <span className="sr-header-title">Kênh Người Bán</span>
        </div>
      </header>

      <div className="sr-main-content">
        <div className="sr-stepper">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-indicator"></div>
            <div className="step-label">Thông tin Shop</div>
          </div>
          <div className="step-connector"></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-indicator"></div>
            <div className="step-label">Cài đặt vận chuyển</div>
          </div>
          <div className="step-connector"></div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-indicator"></div>
            <div className="step-label">Hoàn tất</div>
          </div>
        </div>

        {step === 1 && <ShopInformation onNext={handleShopInfoNext} />}
        {step === 2 && <ShippingSettings onBack={() => setStep(1)} onComplete={handleShippingComplete} isSubmitting={isSubmitting} />}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h2 style={{ color: '#ee4d2d', marginBottom: '16px' }}>Đăng ký thành công!</h2>
            <p style={{ marginTop: '16px', color: '#666', fontSize: '15px' }}>Bạn đã thiết lập thành công các thông tin. Hãy chờ hệ thống ZENGO duyệt gian hàng của bạn nhé.</p>
            <button 
              onClick={() => navigate('/seller-dashboard')}
              style={{
                marginTop: '32px',
                padding: '12px 32px',
                backgroundColor: '#ee4d2d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Đi tới Trang Quản Trị
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerRegistration;
