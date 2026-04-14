import React, { useState } from 'react';
import './RevenueDashboard.css';

const RevenueDashboard = () => {
  const [filterType, setFilterType] = useState('All');
  
  // Mock Data
  const wallet = {
    available: "15.500.000",
    frozen: "4.250.000",
    totalWithdrawn: "128.000.000"
  };

  const transactions = [
    { id: 'TX-20260330-01', type: 'Cộng tiền', typeCode: 'plus', amount: '+ 350.000đ', details: 'Doanh thu từ đơn hàng #ZG10294', time: '30/03/2026 15:30' },
    { id: 'TX-20260329-05', type: 'Cộng tiền', typeCode: 'plus', amount: '+ 120.000đ', details: 'Doanh thu từ đơn hàng #ZG10293', time: '29/03/2026 09:15' },
    { id: 'TX-20260328-12', type: 'Trừ tiền', typeCode: 'minus', amount: '- 5.000.000đ', details: 'Rút tiền về Vietcombank (...6789)', time: '28/03/2026 14:00' },
    { id: 'TX-20260325-08', type: 'Hoàn tiền', typeCode: 'refund', amount: '- 250.000đ', details: 'Hoàn tiền đơn hàng #ZG10297 (Khách trả hàng)', time: '25/03/2026 10:45' },
    { id: 'TX-20260324-19', type: 'Cộng tiền', typeCode: 'plus', amount: '+ 890.000đ', details: 'Doanh thu từ đơn hàng #ZG10290', time: '24/03/2026 18:20' },
  ];

  const filteredTransactions = filterType === 'All' 
    ? transactions 
    : transactions.filter(tx => tx.typeCode === filterType);

  const getTypeBadgeClass = (code) => {
    switch(code) {
      case 'plus': return 'type-plus';
      case 'minus': return 'type-minus';
      case 'refund': return 'type-refund';
      default: return '';
    }
  };

  const getAmountClass = (code) => {
    switch(code) {
      case 'plus': return 'amount-plus';
      case 'minus': return 'amount-minus';
      case 'refund': return 'amount-refund';
      default: return '';
    }
  };

  return (
    <div className="revenue-container">
      <div className="revenue-header">
        <h2>Doanh Thu</h2>
        <p>Theo dõi luồng tiền và số dư khả dụng thực tế của shop</p>
      </div>

      <div className="wallet-cards">
        <div className="wallet-card primary">
          <div className="wallet-title">Số dư khả dụng</div>
          <div className="wallet-amount">{wallet.available}đ</div>
          <div className="wallet-desc">Số tiền thực tế bạn có thể rút về ngân hàng ngay lập tức.</div>
        </div>

        <div className="wallet-card secondary">
          <div className="wallet-title">Số dư đóng băng</div>
          <div className="wallet-amount">{wallet.frozen}đ</div>
          <div className="wallet-desc">Tiền từ đơn hàng mới giao thành công, đang chờ hết thời gian khiếu nại (3 ngày).</div>
        </div>

        <div className="wallet-card tertiary">
          <div className="wallet-title">Tổng tiền đã rút</div>
          <div className="wallet-amount">{wallet.totalWithdrawn}đ</div>
          <div className="wallet-desc">Tổng cộng tất cả các khoản tiền ZenGo đã giải ngân sang tài khoản ngân hàng của bạn.</div>
        </div>
      </div>

      <div className="transaction-section">
        <div className="transaction-header">
          <h3>Lịch sử giao dịch ví (Transaction History)</h3>
          <div className="transaction-filters">
            <select 
              className="transaction-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="All">Tất cả giao dịch</option>
              <option value="plus">Cộng tiền (Doanh thu)</option>
              <option value="minus">Trừ tiền (Rút tiền)</option>
              <option value="refund">Hoàn tiền (Trả hàng)</option>
            </select>
          </div>
        </div>

        <div className="transaction-table-wrapper">
          <table className="transaction-table">
            <thead>
              <tr>
                <th>Mã giao dịch</th>
                <th>Loại giao dịch</th>
                <th>Chi tiết</th>
                <th>Số tiền</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length > 0 ? filteredTransactions.map((tx) => (
                <tr key={tx.id}>
                  <td><span className="tx-id">{tx.id}</span></td>
                  <td><span className={`tx-type-badge ${getTypeBadgeClass(tx.typeCode)}`}>{tx.type}</span></td>
                  <td style={{ maxWidth: '300px' }}>{tx.details}</td>
                  <td><span className={`tx-amount ${getAmountClass(tx.typeCode)}`}>{tx.amount}</span></td>
                  <td className="tx-time">{tx.time}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: '#888' }}>Không có giao dịch nào phù hợp.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RevenueDashboard;
