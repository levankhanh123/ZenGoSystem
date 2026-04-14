import React, { useState } from 'react';

const ShopInformation = ({ onNext }) => {
  const [shopName, setShopName] = useState('hieuzk123');
  const [shopAvatar, setShopAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [email, setEmail] = useState('hleunguyendoan8@gmail.com');
  const [phone, setPhone] = useState('0812234219');
  const [address, setAddress] = useState('Tổ 6 ấp tân hòa, xã Tân Phú, huyện Tân Châu, Tây Ninh');
  
  const [errors, setErrors] = useState({});

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setShopAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
      if (errors.shopAvatar) setErrors({ ...errors, shopAvatar: null });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!shopName.trim()) {
      newErrors.shopName = 'Tên shop không được để trống.';
    } else if (shopName.length > 30) {
      newErrors.shopName = 'Tên shop không được vượt quá 30 kí tự.';
    }

    if (!address.trim()) {
      newErrors.address = 'Địa chỉ không được để trống.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email không được để trống.';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Email không đúng định dạng.';
    }

    const phoneRegex = /^\d{10}$/;
    if (!phone.trim()) {
      newErrors.phone = 'Số điện thoại không được để trống.';
    } else if (!phoneRegex.test(phone)) {
      newErrors.phone = 'Số điện thoại phải đúng 10 chữ số.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validate()) {
      onNext({ shopName, shopAvatar, email, phone, address });
    }
  };

  return (
    <>
      <div className="sr-form-container">
        <form className="sr-form" noValidate>

          <div className={`sr-form-group align-top ${errors.shopAvatar ? 'has-error' : ''}`}>
            <label className="form-label" htmlFor="shop-logo-input">
              Hình đại diện
            </label>
            <div className="input-container-outer">
              <div 
                className="shop-logo-upload-wrapper" 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '8px', 
                  marginBottom: '12px',
                  minHeight: '100px'
                }}
              >
                <label 
                  htmlFor="shop-logo-input" 
                  style={{
                    width: '100px',
                    height: '100px',
                    border: '2px dashed #ee4d2d',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    backgroundColor: '#fff4f2',
                    boxSizing: 'border-box'
                  }}
                >
                  <input 
                    type="file" 
                    id="shop-logo-input" 
                    name="shopAvatar"
                    accept="image/*" 
                    onChange={handleAvatarChange} 
                    style={{ display: 'none' }} 
                  />
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Shop Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <>
                      <span style={{ fontSize: '28px', color: '#ee4d2d', lineHeight: '1' }}>+</span>
                      <span style={{ fontSize: '12px', color: '#ee4d2d', marginTop: '4px', fontWeight: '500' }}>Tải ảnh</span>
                    </>
                  )}
                </label>
              </div>
              {errors.shopAvatar && <div className="error-text" style={{ color: '#ee4d2d', fontSize: '12px', marginTop: '0', marginBottom: '4px' }}>{errors.shopAvatar}</div>}
              <div className="shop-logo-help" style={{ fontSize: '12px', color: '#999' }}>
                Kích thước tối đa: 2MB. Định dạng: JPEG, PNG
              </div>
            </div>
          </div>
          
          <div className={`sr-form-group ${errors.shopName ? 'has-error' : ''}`}>
            <label className="form-label" htmlFor="shopName">
              <span className="required">*</span> Tên Shop
            </label>
            <div className="input-container-outer">
              <div className="input-container">
                <input 
                  type="text" 
                  id="shopName"
                  name="shopName"
                  className="form-input" 
                  value={shopName}
                  onChange={(e) => { setShopName(e.target.value); if(errors.shopName) setErrors({...errors, shopName: null}); }}
                  maxLength={30}
                  placeholder="Nhập tên shop"
                />
                <span className="char-count">{shopName.length}/30</span>
              </div>
              {errors.shopName && <div className="error-text">{errors.shopName}</div>}
            </div>
          </div>

          <div className={`sr-form-group align-top ${errors.address ? 'has-error' : ''}`}>
            <label className="form-label" htmlFor="address">
              <span className="required">*</span> Địa chỉ lấy hàng
            </label>
            <div className="input-container-outer">
               <textarea 
                  id="address"
                  name="address"
                  className="form-input address-input" 
                  value={address}
                  onChange={(e) => { setAddress(e.target.value); if(errors.address) setErrors({...errors, address: null}); }}
                  rows={4}
                  placeholder="Nhập địa chỉ lấy hàng"
               />
               {errors.address && <div className="error-text">{errors.address}</div>}
            </div>
          </div>

          <div className={`sr-form-group ${errors.email ? 'has-error' : ''}`}>
            <label className="form-label" htmlFor="email">
              <span className="required">*</span> Email
            </label>
            <div className="input-container-outer">
              <div className="input-container">
                <input 
                  type="email" 
                  id="email"
                  name="email"
                  className="form-input" 
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if(errors.email) setErrors({...errors, email: null}); }}
                  placeholder="Nhập email"
                />
              </div>
              {errors.email && <div className="error-text">{errors.email}</div>}
            </div>
          </div>

          <div className={`sr-form-group ${errors.phone ? 'has-error' : ''}`}>
            <label className="form-label" htmlFor="phone">
              <span className="required">*</span> Số điện thoại
            </label>
            <div className="input-container-outer">
              <div className="input-container phone-container">
                <input 
                  type="tel" 
                  id="phone"
                  name="phone"
                  className="form-input" 
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); if(errors.phone) setErrors({...errors, phone: null}); }}
                  placeholder="Nhập số điện thoại"
                  maxLength={10}
                />
              </div>
              {errors.phone && <div className="error-text">{errors.phone}</div>}
            </div>
          </div>

        </form>
      </div>

      <div className="sr-bottom-bar-wrapper">
        <div className="sr-bottom-bar">
          <button className="btn-save" onClick={(e) => e.preventDefault()}>Lưu</button>
          <button className="btn-next" onClick={handleNext}>Tiếp theo</button>
        </div>
      </div>
    </>
  );
};

export default ShopInformation;
