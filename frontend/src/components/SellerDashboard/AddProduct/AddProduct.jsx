import React, { useState, useEffect } from 'react';
import './AddProduct.css';
import api from '../../../api/axios';
import { useSellerSession } from '../../../contexts/SellerSessionContext';
import AddShopCategoryModal from './AddShopCategoryModal';
import { Image as ImageIcon, Film, Plus, X, UploadCloud, Info } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const AddProduct = () => {
    const { selectedShop } = useSellerSession();
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        price: '',
        stock: '',
        description: '',
        category_id: '',
        shop_category_id: '',
        coverImage: null,
        productImages: [],
        video: null
    });
    const [previews, setPreviews] = useState({
        cover: null,
        gallery: [],
        video: null
    });
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [shopCategories, setShopCategories] = useState([]);
    const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/categories');
                const data = Array.isArray(response.data) ? response.data : [];
                setCategories(data);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        const fetchShopCategories = async () => {
            if (!selectedShop?.id) return;
            try {
                const response = await api.get(`/seller/shop-categories?shop_id=${selectedShop.id}`);
                setShopCategories(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error("Error fetching shop categories:", error);
            }
        };

        fetchCategories();
        fetchShopCategories();
    }, [selectedShop?.id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDescriptionChange = (content) => {
        setFormData(prev => ({ ...prev, description: content }));
    };

    const handleCoverImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, coverImage: file }));
            setPreviews(prev => ({ ...prev, cover: URL.createObjectURL(file) }));
        }
    };

    const handleGalleryImagesChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setFormData(prev => ({ ...prev, productImages: [...prev.productImages, ...files] }));
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setPreviews(prev => ({ ...prev, gallery: [...prev.gallery, ...newPreviews] }));
        }
    };

    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, video: file }));
            setPreviews(prev => ({ ...prev, video: URL.createObjectURL(file) }));
        }
    };

    const removeGalleryImage = (index) => {
        setFormData(prev => ({
            ...prev,
            productImages: prev.productImages.filter((_, i) => i !== index)
        }));
        setPreviews(prev => ({
            ...prev,
            gallery: prev.gallery.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedShop?.id) {
            alert('Không tìm thấy thông tin cửa hàng. Vui lòng kiểm tra lại quyền truy cập hoặc liên hệ quản trị viên.');
            return;
        }

        setLoading(true);

        try {
            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('sku', formData.sku);
            submitData.append('price', formData.price);
            submitData.append('stock', formData.stock);
            submitData.append('description', formData.description);
            submitData.append('category_id', formData.category_id);
            if (formData.shop_category_id) {
                submitData.append('shop_category_id', formData.shop_category_id);
            }
            
            if (formData.coverImage) {
                submitData.append('image', formData.coverImage);
            }

            if (formData.productImages.length > 0) {
                formData.productImages.forEach((img) => {
                    submitData.append('product_images[]', img);
                });
            }

            if (formData.video) {
                submitData.append('video', formData.video);
            }
            
            submitData.append('shop_id', selectedShop.id);

            await api.post('/seller/products', submitData, {
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
                category_id: '',
                shop_category_id: '',
                coverImage: null,
                productImages: [],
                video: null
            });
            setPreviews({ cover: null, gallery: [], video: null });
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

    const handleAddCategorySuccess = (newCategory) => {
        setShopCategories(prev => [...prev, newCategory]);
        setFormData(prev => ({ ...prev, shop_category_id: newCategory.id }));
    };

    return (
        <div className="add-product-container">
            {!selectedShop && (
                <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '12px', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fee2e2' }}>
                    <strong>Cảnh báo:</strong> Không tìm thấy thông tin cửa hàng liên kết với tài khoản này. Vui lòng kiểm tra lại.
                </div>
            )}
            <div className="add-product-header">
                <h2>Thêm sản phẩm mới</h2>
                <p>Quản lý và thêm mới sản phẩm vào hệ thống của bạn</p>
            </div>

            <form className="add-product-form" onSubmit={handleSubmit}>
                <div className="form-section">
                    <h3 className="section-title">Thông tin cơ bản</h3>
                    
                    <div className="form-group">
                        <label>Phương tiện sản phẩm <span className="required">*</span></label>
                        <div className="media-upload-grid">
                            {/* Cover Image */}
                            <div className="media-item-box cover-box">
                                <input 
                                    type="file" id="cover-upload" accept="image/*" 
                                    onChange={handleCoverImageChange} style={{ display: 'none' }} 
                                />
                                <label htmlFor="cover-upload" className={`upload-minimal ${previews.cover ? 'has-preview' : ''}`}>
                                    {previews.cover ? (
                                        <img src={previews.cover} alt="Cover" />
                                    ) : (
                                        <div className="upload-placeholder">
                                            <ImageIcon strokeWidth={1.5} />
                                            <span>Ảnh bìa</span>
                                        </div>
                                    )}
                                </label>
                                {previews.cover && <button type="button" className="remove-media" onClick={() => {
                                    setFormData(p => ({ ...p, coverImage: null }));
                                    setPreviews(p => ({ ...p, cover: null }));
                                }}><X size={14} /></button>}
                            </div>

                            {/* Gallery Images */}
                            {previews.gallery.map((src, idx) => (
                                <div key={idx} className="media-item-box">
                                    <img src={src} alt={`Gallery ${idx}`} />
                                    <button type="button" className="remove-media" onClick={() => removeGalleryImage(idx)}>
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}

                            {/* Add More Images */}
                            {previews.gallery.length < 8 && (
                                <div className="media-item-box">
                                    <input 
                                        type="file" id="gallery-upload" accept="image/*" multiple
                                        onChange={handleGalleryImagesChange} style={{ display: 'none' }} 
                                    />
                                    <label htmlFor="gallery-upload" className="upload-minimal">
                                        <div className="upload-placeholder">
                                            <Plus strokeWidth={1.5} />
                                            <span>Thêm ảnh</span>
                                        </div>
                                    </label>
                                </div>
                            )}

                            {/* Video */}
                            <div className="media-item-box video-box">
                                <input 
                                    type="file" id="video-upload" accept="video/*" 
                                    onChange={handleVideoChange} style={{ display: 'none' }} 
                                />
                                <label htmlFor="video-upload" className={`upload-minimal ${previews.video ? 'has-preview' : ''}`}>
                                    {previews.video ? (
                                        <video src={previews.video} />
                                    ) : (
                                        <div className="upload-placeholder">
                                            <Film strokeWidth={1.5} />
                                            <span>Video</span>
                                        </div>
                                    )}
                                </label>
                                {previews.video && <button type="button" className="remove-media" onClick={() => {
                                    setFormData(p => ({ ...p, video: null }));
                                    setPreviews(p => ({ ...p, video: null }));
                                }}><X size={14} /></button>}
                            </div>
                        </div>
                        <p className="help-text">Ảnh bìa là bắt buộc. Bạn có thể thêm tối đa 8 ảnh phụ và 1 video (Max 20MB).</p>
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
                            <label htmlFor="category_id">Danh mục sàn <span className="required">*</span></label>
                            <select 
                                id="category_id" 
                                name="category_id" 
                                value={formData.category_id} 
                                onChange={handleInputChange} 
                                required
                            >
                                <option value="" disabled>Chọn danh mục sàn</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.ten_danh_muc}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group flex-1">
                            <label htmlFor="shop_category_id">Danh mục Shop</label>
                            <div className="select-with-add">
                                <select 
                                    id="shop_category_id" 
                                    name="shop_category_id" 
                                    value={formData.shop_category_id} 
                                    onChange={handleInputChange}
                                >
                                    <option value="">Chọn danh mục Shop</option>
                                    {shopCategories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.ten_danh_muc_shop}</option>
                                    ))}
                                </select>
                                <button 
                                    type="button" 
                                    className="btn-add-inline"
                                    onClick={() => setShowAddCategoryModal(true)}
                                    title="Thêm danh mục Shop mới"
                                >
                                    +
                                </button>
                            </div>
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
                        <div className="editor-container">
                            <ReactQuill 
                                theme="snow"
                                value={formData.description}
                                onChange={handleDescriptionChange}
                                placeholder="Nhập mô tả chi tiết về sản phẩm..."
                                modules={{
                                    toolbar: [
                                        [{ 'header': [1, 2, 3, false] }],
                                        ['bold', 'italic', 'underline', 'strike'],
                                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                        ['link', 'clean']
                                    ]
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" className="btn-cancel">Hủy</button>
                    <button type="submit" className="btn-submit" disabled={loading}>
                        {loading ? 'Đang lưu...' : 'Lưu sản phẩm'}
                    </button>
                </div>
            </form>

            {showAddCategoryModal && (
                <AddShopCategoryModal 
                    shopId={selectedShop?.id}
                    onClose={() => setShowAddCategoryModal(false)}
                    onSuccess={handleAddCategorySuccess}
                />
            )}
        </div>
    );
};

export default AddProduct;
