import React, { useState } from 'react';
import './StatisticsDashboard.css';

const StatisticsDashboard = () => {
  const [dateRange, setDateRange] = useState('Tháng này');

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
          <div className="metric-value highlight">45.500.000đ</div>
          <div className="metric-trend trend-up">
            ↑ 12.5% <span>so với kỳ trước</span>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-title">Số lượng đơn thành công</div>
          <div className="metric-value">1,245</div>
          <div className="metric-trend trend-up">
            ↑ 5.2% <span>so với kỳ trước</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-title">Giá trị TB Đơn (AOV)</div>
          <div className="metric-value">36.546đ</div>
          <div className="metric-trend trend-up">
            ↑ 2.1% <span>so với kỳ trước</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-title">Tỷ lệ chuyển đổi</div>
          <div className="metric-value">4.2%</div>
          <div className="metric-trend trend-down">
            ↓ 0.5% <span>so với kỳ trước</span>
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
              <li className="item-row">
                <div className="item-rank rank-1">#1</div>
                <div className="item-info">
                  <div className="item-name">Áo Thun Tay Lỡ Unisex Form Rộng Phông Nam Nữ</div>
                  <div className="item-meta">Mã SP: SP001</div>
                </div>
                <div className="item-value">458 đã bán</div>
              </li>
              <li className="item-row">
                <div className="item-rank rank-2">#2</div>
                <div className="item-info">
                  <div className="item-name">Quần Jean Nam Ống Xuông Cao Cấp</div>
                  <div className="item-meta">Mã SP: SP042</div>
                </div>
                <div className="item-value">312 đã bán</div>
              </li>
              <li className="item-row">
                <div className="item-rank rank-3">#3</div>
                <div className="item-info">
                  <div className="item-name">Mũ Lưỡi Trai Thêu Chữ K Thời Trang Mùa Hè</div>
                  <div className="item-meta">Mã SP: SP015</div>
                </div>
                <div className="item-value">195 đã bán</div>
              </li>
            </ul>
          </div>

          <div className="dashboard-panel">
            <div className="panel-title" style={{ color: '#d93025' }}>
              Cảnh báo Tồn Kho Thấp
              <span className="panel-subtitle">Sắp hết hàng</span>
            </div>
            <ul className="item-list">
              <li className="item-row">
                <div className="item-info">
                  <div className="item-name">Giày Thể Thao Sneaker Nam Cao Cấp</div>
                  <div className="item-meta">Mã SP: SP088 | Size 42 Trắng</div>
                </div>
                <div className="item-value">
                  <span className="warning-badge">Còn 2 SP</span>
                </div>
              </li>
              <li className="item-row">
                <div className="item-info">
                  <div className="item-name">Áo Khoác Nỉ Hoodie Basic Form Rộng</div>
                  <div className="item-meta">Mã SP: SP102 | Đen XL</div>
                </div>
                <div className="item-value">
                  <span className="warning-badge">Hết hàng</span>
                </div>
              </li>
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
                <span className="op-value" style={{ color: '#fca120' }}>★ 4.8 / 5.0</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill fill-orange" style={{ width: '96%' }}></div>
              </div>
            </div>

            <div className="op-metric">
              <div className="op-header">
                <span className="op-label">Thời gian chuẩn bị hàng TB</span>
                <span className="op-value">0.8 ngày</span>
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
                <span className="op-value" style={{ color: '#d93025' }}>3.5%</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill fill-red" style={{ width: '3.5%' }}></div>
              </div>
              <small style={{ color: '#666', marginTop: '8px', display: 'block' }}>
                Tổng số 45 đơn bị hủy/trả trong khoảng thời gian này.
              </small>
            </div>

            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#333' }}>Nguyên nhân phổ biến:</div>
              <ul className="item-list">
                <li className="item-row" style={{ padding: '8px 0' }}>
                  <div className="item-info"><span style={{ fontSize: '13px', color: '#666' }}>1. Khách đổi ý (Do vận chuyển lâu)</span></div>
                  <div className="item-value" style={{ fontSize: '13px' }}>42%</div>
                </li>
                <li className="item-row" style={{ padding: '8px 0' }}>
                  <div className="item-info"><span style={{ fontSize: '13px', color: '#666' }}>2. Sản phẩm bị lỗi kỹ thuật</span></div>
                  <div className="item-value" style={{ fontSize: '13px' }}>35%</div>
                </li>
                <li className="item-row" style={{ padding: '8px 0', borderBottom: 'none' }}>
                  <div className="item-info"><span style={{ fontSize: '13px', color: '#666' }}>3. Khác</span></div>
                  <div className="item-value" style={{ fontSize: '13px' }}>23%</div>
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
