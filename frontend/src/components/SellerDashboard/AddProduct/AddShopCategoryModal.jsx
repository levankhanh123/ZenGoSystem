import React, { useState } from 'react';
import api from '../../../api/axios';
import './AddProduct.css'; // Reusing styles or adding modal styles here

const AddShopCategoryModal = ({ shopId, onClose, onSuccess }) => {
    const [categoryName, setCategoryName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!categoryName.trim()) return;

        setIsSubmitting(true);
        setError('');

        try {
            const response = await api.post('/seller/shop-categories', {
                ten_danh_muc_shop: categoryName,
                cua_hang_id: shopId
            });
            
            onSuccess(response.data);
            onClose();
        } catch (err) {
            console.error('Error creating shop category:', err);
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo danh mục.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Thêm danh mục Shop mới</h3>
                    <button className="btn-close" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label htmlFor="new_cat_name">Tên danh mục <span className="required">*</span></label>
                            <input 
                                type="text" 
                                id="new_cat_name"
                                value={categoryName}
                                onChange={(e) => setCategoryName(e.target.value)}
                                placeholder="VD: Bộ sưu tập mùa hè"
                                required
                                autoFocus
                            />
                            {error && <p className="error-text">{error}</p>}
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>Hủy</button>
                        <button type="submit" className="btn-submit" disabled={isSubmitting || !categoryName.trim()}>
                            {isSubmitting ? 'Đang xử lý...' : 'Lưu danh mục'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddShopCategoryModal;
