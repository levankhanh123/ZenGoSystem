import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CancelledReturnOrders.css';
import api from '../../../api/axios';
import { useSellerSession } from '../../../contexts/SellerSessionContext';

const CancelledReturnOrders = () => {
  const { selectedShop } = useSellerSession();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('cancelled'); // 'cancelled' or 'returns'
  
  // States
  const [cancelledOrders, setCancelledOrders] = useState([]);
  const [returnOrders, setReturnOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modals
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [selectedEvidence, setSelectedEvidence] = useState(null);

  useEffect(() => {
    if (!selectedShop?.id) return;

    if (activeTab === 'cancelled') {
      fetchCancelledOrders();
    } else {
      fetchReturnOrders();
    }
  }, [selectedShop?.id, activeTab]);

  const fetchCancelledOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/seller/orders', {
        params: { shop_id: selectedShop.id, status: 'da_huy' }
      });
      setCancelledOrders(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReturnOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/seller/returns', {
        params: { shop_id: selectedShop.id }
      });
      setReturnOrders(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Actions cho Đơn hủy
  const handleContactCustomer = (buyerId) => {
    window.dispatchEvent(new CustomEvent('open-chat', { 
        detail: { targetUserId: buyerId, loai: 'tu_van' } 
    }));
  };

  // Actions cho Trả hàng
  const handleAcceptReturn = async (returnId) => {
    if (!window.confirm('Xác nhận đồng ý hoàn tiền cho khách hàng? Số tiền sẽ được trừ vào tài khoản hoặc ví của bạn.')) return;
    try {
      await api.patch(`/seller/returns/${returnId}/accept`, { shop_id: selectedShop.id });
      alert('Chấp nhận hoàn tiền thành công.');
      fetchReturnOrders();
    } catch (err) {
      alert('Lỗi khi chấp nhận hoàn tiền.');
      console.error(err);
    }
  };

  const handleDispute = async (returnId) => {
    const reason = window.prompt('Vui lòng nhập lý do từ chối / khiếu nại lên sàn:');
    if (!reason?.trim()) return;
    try {
      await api.patch(`/seller/returns/${returnId}/dispute`, { 
        shop_id: selectedShop.id,
        ly_do_tu_choi: reason 
      });
      alert('Đã gửi khiếu nại thành công.');
      fetchReturnOrders();
    } catch (err) {
      alert('Lỗi khi gửi khiếu nại.');
      console.error(err);
    }
  };

  return (
    <div className="cancelled-returns-container">
      <div className="cancelled-returns-header">
        <h2 className="cancelled-returns-title">Đơn hủy & Trả hàng / Hoàn tiền</h2>
        <p className="cancelled-returns-desc">Quản lý các đơn hàng không thành công, yêu cầu trả hàng và hoàn tiền.</p>
      </div>

      <div className="cr-tabs">
        <button 
          className={`cr-tab-btn ${activeTab === 'cancelled' ? 'active' : ''}`}
          onClick={() => setActiveTab('cancelled')}
        >
          Đơn hủy
        </button>
        <button 
          className={`cr-tab-btn ${activeTab === 'returns' ? 'active' : ''}`}
          onClick={() => setActiveTab('returns')}
        >
          Trả hàng / Hoàn tiền
        </button>
      </div>

      <div className="cr-table-wrapper">
        <table className="cr-table">
          <thead>
            {activeTab === 'cancelled' ? (
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Lý do hủy</th>
                <th>Ngày hủy</th>
                <th>Thao tác</th>
              </tr>
            ) : (
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Lý do trả</th>
                <th>Trạng thái</th>
                <th>Ngày yêu cầu</th>
                <th>Thao tác</th>
              </tr>
            )}
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="no-data">Đang tải dữ liệu...</td></tr>
            ) : activeTab === 'cancelled' ? (
              cancelledOrders.length > 0 ? cancelledOrders.map(order => (
                <tr key={order.id}>
                  <td><strong>{order.code}</strong></td>
                  <td>{order.customer}</td>
                  <td style={{ color: '#ef4444' }}>{order.ly_do_huy || 'Không rõ lý do'}</td>
                  <td>{order.created_at_label}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-icon" title="Xem chi tiết" onClick={() => setSelectedOrderDetails(order)}>Xem</button>
                      <button className="btn btn-outline" onClick={() => handleContactCustomer(order.buyer_id)}>Liên hệ khách</button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="5" className="no-data">Không có đơn hủy nào.</td></tr>
              )
            ) : (
              returnOrders.length > 0 ? returnOrders.map(ret => (
                <tr key={ret.id}>
                  <td><strong>{ret.code}</strong></td>
                  <td>{ret.customer}</td>
                  <td>{ret.reason}</td>
                  <td>
                    <span className={`status-badge ${
                      ret.status_code === 'da_giai_quyet' ? 'resolved' :
                      ret.status_code === 'dang_xu_ly' ? 'dispute' : 'pending'
                    }`}>
                      {ret.status}
                    </span>
                  </td>
                  <td>{ret.created_at_label}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-icon" title="Xem bằng chứng" onClick={() => setSelectedEvidence(ret)}>📸</button>
                      {ret.status_code === 'cho_xu_ly' && (
                        <>
                          <button className="btn btn-primary" onClick={() => handleAcceptReturn(ret.id)}>Chấp nhận</button>
                          <button className="btn btn-danger" onClick={() => handleDispute(ret.id)}>Khiếu nại</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6" className="no-data">Không có yêu cầu trả hàng nào.</td></tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Chi tiết đơn hủy */}
      {selectedOrderDetails && (
         <div className="modal-overlay">
            <div className="modal-content">
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '12px', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>Chi tiết đơn hàng {selectedOrderDetails.code}</h3>
                  <button onClick={() => setSelectedOrderDetails(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', lineHeight: '1' }}>&times;</button>
               </div>
               
               <div style={{ marginBottom: '16px' }}>
                  <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Người nhận:</strong> {selectedOrderDetails.recipient_name}</p>
                  <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Số điện thoại:</strong> {selectedOrderDetails.recipient_phone}</p>
                  <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Địa chỉ:</strong> {selectedOrderDetails.recipient_address}</p>
                  <p style={{ margin: '4px 0', fontSize: '14px', color: '#ef4444' }}><strong>Lý do hủy:</strong> {selectedOrderDetails.ly_do_huy}</p>
               </div>

               <div>
                  <h4 style={{ margin: '0 0 8px', fontSize: '15px', color: '#374151' }}>Sản phẩm</h4>
                  <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '14px' }}>
                     {selectedOrderDetails.products?.split(', ').map((prod, idx) => (
                        <li key={idx} style={{ marginBottom: '4px' }}>{prod}</li>
                     ))}
                  </ul>
               </div>
               
               <div style={{ marginTop: '24px', textAlign: 'right' }}>
                  <button className="btn btn-outline" onClick={() => setSelectedOrderDetails(null)}>Đóng</button>
               </div>
            </div>
         </div>
      )}

      {/* Modal Xem Bằng chứng Trả hàng */}
      {selectedEvidence && (
         <div className="modal-overlay">
            <div className="modal-content">
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '12px', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>Bằng chứng trả hàng (Đơn {selectedEvidence.code})</h3>
                  <button onClick={() => setSelectedEvidence(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', lineHeight: '1' }}>&times;</button>
               </div>
               
               <div style={{ marginBottom: '16px' }}>
                  <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Lý do:</strong> {selectedEvidence.reason}</p>
                  <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Nội dung chi tiết:</strong> {selectedEvidence.content}</p>
               </div>

               <div>
                  <h4 style={{ margin: '0 0 8px', fontSize: '15px', color: '#374151' }}>Hình ảnh / Video đính kèm</h4>
                  {selectedEvidence.evidence_images && selectedEvidence.evidence_images.length > 0 ? (
                    <div className="evidence-grid">
                      {selectedEvidence.evidence_images.map((img, idx) => (
                        <a href={img} target="_blank" rel="noreferrer" key={idx}>
                          <img src={img} alt="Bằng chứng" className="evidence-img" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '14px', color: '#6b7280', fontStyle: 'italic' }}>Không có hình ảnh đính kèm.</p>
                  )}
               </div>
               
               <div style={{ marginTop: '24px', textAlign: 'right' }}>
                  <button className="btn btn-outline" onClick={() => setSelectedEvidence(null)}>Đóng</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default CancelledReturnOrders;
