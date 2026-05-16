import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import './StatisticsDashboard.css';

const StatisticsDashboard = () => {
  const [dateRange, setDateRange] = useState('Tháng này');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentUser = JSON.parse(localStorage.getItem('user'));
  const shopId = currentUser?.cua_hang?.id || currentUser?.cua_hang_id || 1;

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await api.get('/seller/statistics/overview', {
        params: {
          shop_id: shopId,
          range: dateRange
        }
      });
      setData(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [dateRange, shopId]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (loading && !data) {
    return <div className="statistics-container"><div className="loading-state">Đang tải dữ liệu thống kê...</div></div>;
  }

  const { metrics, topProducts, lowStock, operational } = data || {};

  return (
    <div className="statistics-container">
      <div className="statistics-header">
        <div>
          <h2>Tổng quan Thống kê</h2>
          <p>Phân tích chi tiết hiệu quả kinh doanh của shop</p>
        </div>
        <select 
          className="date-filter" 
          value={dateRange} 
          onChange={(e) => setDateRange(e.target.value)}
        >
          <option value="Hôm nay">Hôm nay</option>
          <option value="Tuần này">Tuần này</option>
          <option value="Tháng này">Tháng này</option>
          <option value="Năm nay">Năm nay</option>
        </select>
      </div>

      <h3 className="section-title">Hiệu suất Kinh doanh (Sales Performance)</h3>
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-title">Tổng doanh thu (Gross Revenue)</div>
          <div className="metric-value highlight">{formatPrice(metrics?.revenue?.value || 0)}</div>
          <div className={`metric-trend ${metrics?.revenue?.isUp ? 'trend-up' : 'trend-down'}`}>
            {metrics?.revenue?.isUp ? '↑' : '↓'} {Math.abs(metrics?.revenue?.trend || 0)}% <span>so với kỳ trước</span>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-title">Số lượng đơn thành công</div>
          <div className="metric-value">{metrics?.orders?.value || 0}</div>
          <div className={`metric-trend ${metrics?.orders?.isUp ? 'trend-up' : 'trend-down'}`}>
            {metrics?.orders?.isUp ? '↑' : '↓'} {Math.abs(metrics?.orders?.trend || 0)}% <span>so với kỳ trước</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-title">Giá trị TB Đơn (AOV)</div>
          <div className="metric-value">{formatPrice(metrics?.aov?.value || 0)}</div>
          <div className={`metric-trend ${metrics?.aov?.isUp ? 'trend-up' : 'trend-down'}`}>
            {metrics?.aov?.isUp ? '↑' : '↓'} {Math.abs(metrics?.aov?.trend || 0)}% <span>so với kỳ trước</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-title">Tỷ lệ chuyển đổi</div>
          <div className="metric-value">{metrics?.conversion?.value || 0}%</div>
          <div className={`metric-trend ${metrics?.conversion?.isUp ? 'trend-up' : 'trend-down'}`}>
            {metrics?.conversion?.isUp ? '↑' : '↓'} {Math.abs(metrics?.conversion?.trend || 0)}% <span>so với kỳ trước</span>
          </div>
        </div>
      </div>

      <div className="dashboard-row">
        {/* Product Insights */}
        <div>
          <h3 className="section-title" style={{ marginTop: 0 }}>Phân tích Sản phẩm (Product Insights)</h3>
          
          <div className="dashboard-panel" style={{ marginBottom: '20px' }}>
            <div className="panel-title">
              Top 3 Bán Chạy Nhất
              <span className="panel-subtitle">Theo số lượng</span>
            </div>
            <ul className="item-list">
              {topProducts && topProducts.length > 0 ? topProducts.map((product, index) => (
                <li className="item-row" key={product.id}>
                  <div className={`item-rank rank-${index + 1}`}>#{index + 1}</div>
                  <div className="item-info">
                    <div className="item-name">{product.ten_san_pham}</div>
                    <div className="item-meta">Mã SP: {product.sku || 'N/A'}</div>
                  </div>
                  <div className="item-value">{product.total_sold} đã bán</div>
                </li>
              )) : <li className="item-row">Chưa có dữ liệu sản phẩm bán chạy</li>}
            </ul>
          </div>

          <div className="dashboard-panel">
            <div className="panel-title" style={{ color: '#d93025' }}>
              Cảnh báo Tồn Kho Thấp
              <span className="panel-subtitle">Sắp hết hàng</span>
            </div>
            <ul className="item-list">
              {lowStock && lowStock.length > 0 ? lowStock.map(product => (
                <li className="item-row" key={product.id}>
                  <div className="item-info">
                    <div className="item-name">{product.ten_san_pham}</div>
                    <div className="item-meta">Mã SP: {product.sku || 'N/A'}</div>
                  </div>
                  <div className="item-value">
                    <span className="warning-badge">{product.so_luong_ton > 0 ? `Còn ${product.so_luong_ton} SP` : 'Hết hàng'}</span>
                  </div>
                </li>
              )) : <li className="item-row">Tất cả sản phẩm đều đủ hàng</li>}
            </ul>
          </div>
        </div>

        {/* Operational & Customer Analytics */}
        <div>
          <h3 className="section-title" style={{ marginTop: 0 }}>Vận hành & Khách hàng</h3>
          
          <div className="dashboard-panel" style={{ marginBottom: '20px' }}>
            <div className="panel-title">Đánh giá Dịch vụ</div>
            
            <div className="op-metric">
              <div className="op-header">
                <span className="op-label">Đánh giá trung bình (Toàn shop)</span>
                <span className="op-value" style={{ color: '#fca120' }}>★ {operational?.avgRating || 0} / 5.0</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill fill-orange" style={{ width: `${(operational?.avgRating || 0) * 20}%` }}></div>
              </div>
            </div>

            <div className="op-metric">
              <div className="op-header">
                <span className="op-label">Thời gian chuẩn bị hàng TB</span>
                <span className="op-value">{operational?.prepTime || 0} ngày</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill fill-green" style={{ width: '85%' }}></div>
              </div>
              <small style={{ color: '#666', display: 'block', marginTop: '4px' }}>Khá tốt, thấp hơn mức trung bình ngành (1.2 ngày)</small>
            </div>
          </div>

          <div className="dashboard-panel">
            <div className="panel-title">Phân tích Hủy & Trả Hàng</div>
            
            <div className="op-metric">
              <div className="op-header">
                <span className="op-label">Tỷ lệ Hủy/Trả hàng</span>
                <span className="op-value" style={{ color: '#d93025' }}>{operational?.cancelRate || 0}%</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill fill-red" style={{ width: `${operational?.cancelRate || 0}%` }}></div>
              </div>
              <small style={{ color: '#666', marginTop: '8px', display: 'block' }}>
                Tổng số {operational?.totalCancelled || 0} đơn bị hủy/trả trong khoảng thời gian này.
              </small>
            </div>

            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#333' }}>Nguyên nhân phổ biến (Dự kiến):</div>
              <ul className="item-list">
                <li className="item-row" style={{ padding: '8px 0' }}>
                  <div className="item-info"><span style={{ fontSize: '13px', color: '#666' }}>1. Khách đổi ý (Do vận chuyển lâu)</span></div>
                  <div className="item-value" style={{ fontSize: '13px' }}>42%</div>
                </li>
                <li className="item-row" style={{ padding: '8px 0' }}>
                  <div className="item-info"><span style={{ fontSize: '13px', color: '#666' }}>2. Sản phẩm bị lỗi kỹ thuật</span></div>
                  <div className="item-value" style={{ fontSize: '13px' }}>35%</div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsDashboard;
