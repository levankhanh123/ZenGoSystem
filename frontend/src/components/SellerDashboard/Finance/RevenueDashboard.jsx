import React, { useEffect, useState } from 'react';
import './RevenueDashboard.css';
import api from '../../../api/axios';
import { useSellerSession } from '../../../contexts/SellerSessionContext';

const RevenueDashboard = () => {
  const { selectedShop } = useSellerSession();
  const [filterType, setFilterType] = useState('All');
  const [wallet, setWallet] = useState({
    available_formatted: '0đ',
    frozen_formatted: '0đ',
    total_withdrawn_formatted: '0đ',
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFinance = async () => {
      if (!selectedShop?.id) {
        setWallet({
          available_formatted: '0đ',
          frozen_formatted: '0đ',
          total_withdrawn_formatted: '0đ',
        });
        setTransactions([]);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get('/seller/finance', {
          params: {
            shop_id: selectedShop.id,
          },
        });

        const data = response.data?.data || {};
        setWallet(data.wallet || {});
        setTransactions(data.transactions || []);
      } catch (error) {
        console.error('Error fetching seller finance:', error);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFinance();
  }, [selectedShop?.id]);

  const filteredTransactions = filterType === 'All'
    ? transactions
    : transactions.filter(tx => tx.type_code === filterType);

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
          <div className="wallet-amount">{wallet.available_formatted}</div>
          <div className="wallet-desc">Số tiền thực tế bạn có thể rút về ngân hàng ngay lập tức.</div>
        </div>

        <div className="wallet-card secondary">
          <div className="wallet-title">Số dư đóng băng</div>
          <div className="wallet-amount">{wallet.frozen_formatted}</div>
          <div className="wallet-desc">Tiền từ đơn hàng mới giao thành công, đang chờ hết thời gian khiếu nại (3 ngày).</div>
        </div>

        <div className="wallet-card tertiary">
          <div className="wallet-title">Tổng tiền đã rút</div>
          <div className="wallet-amount">{wallet.total_withdrawn_formatted}</div>
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
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: '#888' }}>Đang tải dữ liệu tài chính...</td>
                </tr>
              ) : filteredTransactions.length > 0 ? filteredTransactions.map((tx) => (
                <tr key={tx.id}>
                  <td><span className="tx-id">{tx.id}</span></td>
                  <td><span className={`tx-type-badge ${getTypeBadgeClass(tx.type_code)}`}>{tx.type}</span></td>
                  <td style={{ maxWidth: '300px' }}>{tx.details}</td>
                  <td><span className={`tx-amount ${getAmountClass(tx.type_code)}`}>{tx.amount_formatted}</span></td>
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
