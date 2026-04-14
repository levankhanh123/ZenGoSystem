import React, { useState, useEffect } from 'react';
import './AddProduct.css';
import api from '../../../api/axios';

const AddProduct = () => {
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        price: '',
        stock: '',
        description: '',
        category_id: '',
        image: null
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/categories');
                setCategories(response.data);
                if (response.data.length > 0) {
                    setFormData(prev => ({ ...prev, category_id: response.data[0].id }));
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, image: file }));
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('sku', formData.sku);
            submitData.append('price', formData.price);
            submitData.append('stock', formData.stock);
            submitData.append('description', formData.description);
            submitData.append('category_id', formData.category_id);
            if (formData.image) {
                submitData.append('image', formData.image);
            }
            
            // Tạm thời truyền shop_id=1. Cần thay thế bằng thực tế khi có Auth Context.
            submitData.append('shop_id', 1);

            await api.post('/products', submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            alert('Đã thêm sản phẩm thành công!');
            
            // Reset form
            setFormData({
                name: '',
                sku: '',
                price: '',
                stock: '',
                description: '',
                category_id: categories.length > 0 ? categories[0].id : '',
                image: null
            });
            setImagePreview(null);
        } catch (error) {
            console.error('Error adding product:', error);
            if (error.response && error.response.data && error.response.data.errors) {
                const errorMessages = Object.values(error.response.data.errors).flat().join('\n');
                alert('Có lỗi xảy ra:\n' + errorMessages);
            } else {
                alert('Có lỗi xảy ra khi thêm sản phẩm. Vui lòng kiểm tra lại!');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-product-container">
            <div className="add-product-header">
                <h2>Thêm sản phẩm mới</h2>
                <p>Quản lý và thêm mới sản phẩm vào hệ thống của bạn</p>
            </div>

            <form className="add-product-form" onSubmit={handleSubmit}>
                <div className="form-section">
                    <h3 className="section-title">Thông tin cơ bản</h3>
                    
                    <div className="form-group">
                        <label>Hình ảnh/Video sản phẩm <span className="required">*</span></label>
                        <div className="media-upload-area">
                            <input 
                                type="file" 
                                id="image-upload" 
                                accept="image/*" 
                                onChange={handleImageChange} 
                                style={{ display: 'none' }} 
                            />
                            <label htmlFor="image-upload" className="upload-box main-box" style={{ cursor: 'pointer', overflow: 'hidden', padding: imagePreview ? '0' : '2rem 1rem' }}>
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <>
                                        <span className="upload-icon">📷</span>
                                        <span className="upload-text">Thêm ảnh bìa</span>
                                    </>
                                )}
                            </label>
                            
                            {/* Các placeholder tĩnh theo thiết kế cũ */}
                            <div className="upload-box">
                                <span className="upload-icon">➕</span>
                                <span className="upload-text">Thêm ảnh</span>
                            </div>
                            <div className="upload-box">
                                <span className="upload-icon">➕</span>
                                <span className="upload-text">Thêm ảnh</span>
                            </div>
                            <div className="upload-box">
                                <span className="upload-icon">🎥</span>
                                <span className="upload-text">Thêm video</span>
                            </div>
                        </div>
                        <p className="help-text">Bạn có thể tải lên 1 ảnh bìa chính. Hỗ trợ định dạng JPG, PNG, GIF (Max 2MB).</p>
                    </div>

                    <div className="form-row">
                        <div className="form-group flex-1">
                            <label htmlFor="name">Tên sản phẩm <span className="required">*</span></label>
                            <input 
                                type="text" 
                                id="name" 
                                name="name" 
                                value={formData.name} 
                                onChange={handleInputChange} 
                                placeholder="Nhập tên sản phẩm" 
                                required 
                            />
                        </div>
                        <div className="form-group flex-1">
                            <label htmlFor="category_id">Danh mục <span className="required">*</span></label>
                            <select 
                                id="category_id" 
                                name="category_id" 
                                value={formData.category_id} 
                                onChange={handleInputChange} 
                                required
                            >
                                <option value="" disabled>Chọn danh mục</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.ten_danh_muc}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group flex-1">
                            <label htmlFor="sku">Mã sản phẩm (SKU) <span className="required">*</span></label>
                            <input 
                                type="text" 
                                id="sku" 
                                name="sku" 
                                value={formData.sku} 
                                onChange={handleInputChange} 
                                placeholder="VD: SP001" 
                                required 
                            />
                        </div>
                        <div className="form-group flex-1">
                            <label htmlFor="price">Giá bán (VNĐ) <span className="required">*</span></label>
                            <input 
                                type="number" 
                                id="price" 
                                name="price" 
                                value={formData.price} 
                                onChange={handleInputChange} 
                                placeholder="0" 
                                required 
                                min="0"
                            />
                        </div>
                        <div className="form-group flex-1">
                            <label htmlFor="stock">Tồn kho <span className="required">*</span></label>
                            <input 
                                type="number" 
                                id="stock" 
                                name="stock" 
                                value={formData.stock} 
                                onChange={handleInputChange} 
                                placeholder="0" 
                                required 
                                min="0"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3 className="section-title">Chi tiết sản phẩm</h3>
                    <div className="form-group">
                        <label htmlFor="description">Mô tả sản phẩm <span className="required">*</span></label>
                        <textarea 
                            id="description" 
                            name="description" 
                            value={formData.description} 
                            onChange={handleInputChange} 
                            placeholder="Mô tả chi tiết về sản phẩm..." 
                            rows="6"
                            required
                        ></textarea>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" className="btn-cancel">Hủy</button>
                    <button type="submit" className="btn-submit" disabled={loading}>
                        {loading ? 'Đang lưu...' : 'Lưu sản phẩm'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddProduct;
