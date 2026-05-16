import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ShopInformation from './ShopInformation/ShopInformation';
import ShippingSettings from './ShippingSettings/ShippingSettings';
import api from '../api/axios';
import { useSellerSession } from '../contexts/SellerSessionContext';
import { useAuth } from '../contexts/Authcontext.jsx';
import './SellerRegistration.css';

const SellerRegistration = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { reloadSession } = useSellerSession();
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
    if (!user?.id) {
      const message = 'Bạn cần đăng nhập để thực hiện chức năng này.';
      setSubmitError(message);
      alert(message);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const formData = new FormData();
      formData.append('user_id', user.id);
      
      formData.append('shopName', shopData.shopName);
      formData.append('email', shopData.email);
      formData.append('phone', shopData.phone);
      formData.append('address', shopData.address);
      if (shopData.shopAvatar) {
        formData.append('shopAvatar', shopData.shopAvatar);
      }

      await api.post('/seller-registration', formData);
      await refreshUser();
      await reloadSession();
      setStep(3);
    } catch (error) {
      console.error('Lỗi khi đăng ký shop:', error);
      
      let errorMessage = 'Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại sau.';
      
      if (error.response?.data) {
        if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.errors) {
          // Xử lý lỗi validation từ Laravel
          const validationErrors = error.response.data.errors;
          errorMessage = Object.values(validationErrors).flat().join(' ');
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }

        if (error.response.data.details) {
          errorMessage += ` (Chi tiết: ${error.response.data.details})`;
        }
      }

      setSubmitError(errorMessage);
      alert(errorMessage);
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
        {submitError && step !== 3 && (
          <div style={{ marginTop: '16px', color: '#b91c1c', textAlign: 'center' }}>{submitError}</div>
        )}
      </div>
    </div>
  );
};

export default SellerRegistration;
