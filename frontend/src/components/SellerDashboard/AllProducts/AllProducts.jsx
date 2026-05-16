import React, { useState, useEffect } from 'react';
import './AllProducts.css';
import api from '../../../api/axios';
import { useSellerSession } from '../../../contexts/SellerSessionContext';
import { useNavigate } from 'react-router-dom';
import { 
  Edit3, 
  Box, 
  Eye, 
  EyeOff, 
  Plus, 
  Search, 
  Filter,
  X,
  Save,
  Loader2
} from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const TABS = ['Tất cả', 'Hoạt động', 'Hết hàng', 'Đã ẩn'];

const getStatusClass = (status) => {
   switch(status) {
      case 'Hoạt động': return 'status-active';
      case 'Hết hàng': return 'status-out-of-stock';
      case 'Đã ẩn': return 'status-hidden';
      default: return '';
   }
}

const STATUS_MAP = {
  'dang_ban': 'Hoạt động',
  'het_hang': 'Hết hàng',
  'da_an': 'Đã ẩn',
  'Hoạt động': 'dang_ban',
  'Hết hàng': 'het_hang',
  'Đã ẩn': 'da_an'
};

const AllProducts = () => {
  const navigate = useNavigate();
  const { selectedShop } = useSellerSession();
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const shopId = selectedShop?.id;
      if (!shopId) return;

      const [productsRes, categoriesRes] = await Promise.all([
         api.get(`/seller/products?shop_id=${shopId}`),
         api.get('/categories')
      ]);

      const rawProducts = Array.isArray(productsRes.data) ? productsRes.data : [];
      const normalizedProducts = rawProducts.map(p => ({
        ...p,
        status: STATUS_MAP[p.status] || p.status
      }));

      setProducts(normalizedProducts);
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedShop?.id]);

  const filteredProducts = Array.isArray(products) ? products.filter(product => {
    const matchStatus = activeTab === 'Tất cả' || product.status === activeTab;
    const matchCategory = selectedCategory === '' || product.category_id === parseInt(selectedCategory);
    const searchLower = searchTerm.toLowerCase();
    const sku = product.sku || product.id?.toString() || '';
    const matchSearch = sku.toLowerCase().includes(searchLower) || product.name.toLowerCase().includes(searchLower);
    return matchStatus && matchSearch && matchCategory;
  }) : [];

  const handleToggleHide = async (id) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    const nextLabel = product.status === 'Đã ẩn' ? 'Hoạt động' : 'Đã ẩn';
    const nextBackendStatus = STATUS_MAP[nextLabel];
    
    try {
      await api.patch(`/seller/products/${id}/status`, { status: nextBackendStatus });
      setProducts(products.map(p => p.id === id ? { ...p, status: nextLabel } : p));
    } catch (error) {
        console.error("Error updating status:", error);
        alert("Có lỗi xảy ra khi cập nhật trạng thái.");
    }
  };

  // Modal Handlers
  const openEditModal = (product) => {
    setEditingProduct({ ...product });
    setIsEditModalOpen(true);
  };

  const openStockModal = (product) => {
    setEditingProduct({ ...product });
    setIsStockModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await api.patch(`/seller/products/${editingProduct.id}`, {
        name: editingProduct.name,
        price: editingProduct.price,
        category_id: editingProduct.category_id,
        description: editingProduct.description
      });
      
      const updatedProduct = response.data.product;
      setProducts(products.map(p => p.id === editingProduct.id ? { 
        ...p, 
        name: updatedProduct.ten_san_pham,
        price: updatedProduct.gia,
        category_id: updatedProduct.danh_muc_id,
        description: updatedProduct.mo_ta,
        status: STATUS_MAP[updatedProduct.trang_thai] || updatedProduct.trang_thai
      } : p));
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Lỗi khi cập nhật sản phẩm.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await api.patch(`/seller/products/${editingProduct.id}/stock`, { stock: editingProduct.stock });
      setProducts(products.map(p => p.id === editingProduct.id ? { 
        ...p, 
        stock: response.data.stock,
        status: STATUS_MAP[response.data.status] || response.data.status 
      } : p));
      setIsStockModalOpen(false);
    } catch (error) {
      console.error("Error updating stock:", error);
      alert("Lỗi khi cập nhật tồn kho.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="all-products-container">
      <div className="products-header-actions">
        <h2>Tất cả sản phẩm</h2>
        <button className="add-product-btn" onClick={() => navigate('/seller-dashboard/add-product')}>
          <Plus size={18} /> Thêm sản phẩm mới
        </button>
      </div>

      <div className="products-tabs">
        {TABS.map(tab => (
           <button 
             key={tab} 
             className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
             onClick={() => setActiveTab(tab)}
           >
             {tab}
           </button>
        ))}
      </div>

      <div className="products-controls">
         <div className="products-search-bar">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Tìm theo tên hoặc mã SP..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         <div className="products-filter">
             <Filter size={16} className="filter-icon" />
             <select 
                className="filter-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
             >
                 <option value="">Tất cả danh mục</option>
                 {categories.map(cat => (
                     <option key={cat.id} value={cat.id}>{cat.ten_danh_muc}</option>
                 ))}
             </select>
         </div>
      </div>

      <div className="products-table-wrapper">
         <table className="products-table">
            <thead>
               <tr>
                  <th>Sản phẩm</th>
                  <th>Mã SP</th>
                  <th>Giá bán</th>
                  <th>Tồn kho</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
               </tr>
            </thead>
            <tbody>
               {loading ? (
                  <tr>
                    <td colSpan="6" className="loading-data">Đang tải dữ liệu...</td>
                  </tr>
               ) : filteredProducts.length > 0 ? filteredProducts.map(product => (
                  <tr key={product.id}>
                     <td className="product-info-cell">
                        <img src={product.image} alt={product.name} className="product-image" />
                        <span className="product-name">{product.name}</span>
                     </td>
                     <td><span className="product-id-badge">{product.sku || `SP00${product.id}`}</span></td>
                     <td><span className="product-price-cell">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}</span></td>
                     <td><span className={`stock-badge ${product.stock <= 5 ? 'low' : ''}`}>{product.stock}</span></td>
                     <td><span className={`status-badge ${getStatusClass(product.status)}`}>{product.status}</span></td>
                     <td className="product-actions">
                        <button className="action-item edit" onClick={() => openEditModal(product)} title="Sửa thông tin"><Edit3 size={16} /></button>
                        <button className="action-item stock" onClick={() => openStockModal(product)} title="Cập nhật kho"><Box size={16} /></button>
                        <button className={`action-item toggle ${product.status === 'Đã ẩn' ? 'hidden' : ''}`} onClick={() => handleToggleHide(product.id)} title={product.status === 'Đã ẩn' ? 'Hiện' : 'Ẩn'}>
                            {product.status === 'Đã ẩn' ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                     </td>
                  </tr>
               )) : (
                  <tr>
                     <td colSpan="6" className="no-data">Không tìm thấy sản phẩm nào!</td>
                  </tr>
               )}
            </tbody>
         </table>
      </div>

      {/* Edit Product Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Chỉnh sửa thông tin sản phẩm</h3>
              <button className="close-btn" onClick={() => setIsEditModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveProduct}>
              <div className="form-group">
                <label>Tên sản phẩm</label>
                <input 
                  type="text" 
                  value={editingProduct.name} 
                  onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Giá bán (VND)</label>
                  <input 
                    type="number" 
                    value={editingProduct.price} 
                    onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Danh mục</label>
                  <select 
                    value={editingProduct.category_id} 
                    onChange={(e) => setEditingProduct({...editingProduct, category_id: e.target.value})}
                    required
                  >
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.ten_danh_muc}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Mô tả sản phẩm</label>
                <div className="editor-container" style={{ height: '200px', marginBottom: '50px' }}>
                  <ReactQuill 
                    theme="snow"
                    value={editingProduct.description || ''} 
                    onChange={(content) => setEditingProduct({...editingProduct, description: content})}
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['link', 'clean']
                      ]
                    }}
                    style={{ height: '100%' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsEditModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn-save" disabled={isSaving}>
                  {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Stock Modal */}
      {isStockModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content sm">
            <div className="modal-header">
              <h3>Cập nhật tồn kho</h3>
              <button className="close-btn" onClick={() => setIsStockModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleUpdateStock}>
              <div className="product-summary">
                <img src={editingProduct.image} alt="" />
                <div className="summary-info">
                  <p className="name">{editingProduct.name}</p>
                  <p className="sku">Mã: {editingProduct.sku || `SP00${editingProduct.id}`}</p>
                </div>
              </div>
              <div className="form-group">
                <label>Số lượng tồn kho hiện tại</label>
                <input 
                  type="number" 
                  value={editingProduct.stock} 
                  onChange={(e) => setEditingProduct({...editingProduct, stock: e.target.value})}
                  min="0"
                  required
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsStockModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn-save" disabled={isSaving}>
                  {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllProducts;
