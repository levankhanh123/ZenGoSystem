import React, { useState, useEffect } from 'react';
import './AllProducts.css';
import api from '../../../api/axios';
import { useSellerSession } from '../../../contexts/SellerSessionContext';

const TABS = ['Tất cả', 'Hoạt động', 'Hết hàng', 'Đã ẩn'];

const getStatusClass = (status) => {
   switch(status) {
      case 'Hoạt động': return 'status-active';
      case 'Hết hàng': return 'status-out-of-stock';
      case 'Đã ẩn': return 'status-hidden';
      default: return '';
   }
}

const AllProducts = ({ onAddProduct }) => {
  const { selectedShop } = useSellerSession();
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  // Fetch products and categories
  const fetchData = async () => {
    try {
      setLoading(true);
      const shopId = selectedShop?.id;

      if (!shopId) {
        setProducts([]);
        setCategories([]);
        setLoading(false);
        return;
      }

      const [productsRes, categoriesRes] = await Promise.all([
         api.get(`/products?shop_id=${shopId}`),
         api.get('/categories')
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedShop?.id]);

  const filteredProducts = products.filter(product => {
    const matchStatus = activeTab === 'Tất cả' || product.status === activeTab;
    const matchCategory = selectedCategory === '' || product.category_id === parseInt(selectedCategory);
    const searchLower = searchTerm.toLowerCase();
    // support missing sku fallback
    const sku = product.sku || product.id?.toString() || '';
    const matchSearch = sku.toLowerCase().includes(searchLower) || product.name.toLowerCase().includes(searchLower);
    return matchStatus && matchSearch && matchCategory;
  });

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        await api.delete(`/products/${id}`);
        setProducts(products.filter(p => p.id !== id));
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Có lỗi xảy ra khi xóa sản phẩm.");
      }
    }
  };

  const handleToggleHide = async (id) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    const newStatus = product.status === 'Đã ẩn' ? 'Hoạt động' : 'Đã ẩn';
    
    try {
      await api.patch(`/products/${id}/status`, { status: newStatus });
      setProducts(products.map(p => {
        if (p.id === id) {
          return { ...p, status: newStatus };
        }
        return p;
      }));
    } catch (error) {
        console.error("Error updating status:", error);
        alert("Có lỗi xảy ra khi cập nhật trạng thái.");
    }
  };

  const handleEditStock = async (id) => {
    const newStock = prompt('Nhập số lượng tồn kho mới:');
    if (newStock !== null && !isNaN(newStock) && parseInt(newStock) >= 0) {
      const updatedStock = parseInt(newStock);
      try {
        const response = await api.patch(`/products/${id}/stock`, { stock: updatedStock });
        setProducts(products.map(p => {
          if (p.id === id) {
            return {
              ...p,
              stock: response.data.stock,
              status: response.data.status
            };
          }
          return p;
        }));
      } catch (error) {
        console.error("Error updating stock:", error);
        alert("Có lỗi xảy ra khi cập nhật tồn kho.");
      }
    }
  };

  return (
    <div className="all-products-container">
      {!selectedShop && (
        <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '12px', background: '#fff4e5', color: '#9a3412' }}>
          Chưa có cửa hàng được chọn để tải danh sách sản phẩm.
        </div>
      )}
      <div className="products-header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Tất cả sản phẩm</h2>
        <button className="add-product-btn" onClick={onAddProduct} style={{
            padding: '8px 16px',
            backgroundColor: '#ee4d2d',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
        }}>+ Thêm sản phẩm mới</button>
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
            <input 
              type="text" 
              placeholder="Tìm theo tên hoặc mã SP..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="search-btn">Tìm kiếm</button>
         </div>
         <div className="products-filter">
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
                  <th>Phân loại/Mã</th>
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
                     <td><span className="product-id">{product.sku || `SP00${product.id}`}</span></td>
                     <td><span className="product-price">{product.price}</span></td>
                     <td>{product.stock}</td>
                     <td><span className={`status-badge ${getStatusClass(product.status)}`}>{product.status}</span></td>
                     <td className="product-actions">
                        <button className="action-btn edit-btn" title="Sửa">✏️</button>
                        <button className="action-btn stock-btn" title="Chỉnh sửa tồn kho" onClick={() => handleEditStock(product.id)}>📦</button>
                        <button className="action-btn toggle-btn" title={product.status === 'Đã ẩn' ? 'Hiện' : 'Ẩn'} onClick={() => handleToggleHide(product.id)}>
                            {product.status === 'Đã ẩn' ? '👁️' : '🚫'}
                        </button>
                        <button className="action-btn delete-btn" title="Xóa" onClick={() => handleDelete(product.id)}>🗑️</button>
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
    </div>
  );
};

export default AllProducts;
