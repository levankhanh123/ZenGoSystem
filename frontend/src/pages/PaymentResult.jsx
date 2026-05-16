import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, ArrowRight, ShoppingBag } from 'lucide-react';
import api from '../api/axios';

const PaymentResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState('processing'); // processing, success, failure
  const [orderInfo, setOrderInfo] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 10;
  const pollTimer = useRef(null);

  // Lấy order_id từ query params nếu có, hoặc từ state nếu redirect từ checkout
  const queryParams = new URLSearchParams(location.search);
  const appTransId = queryParams.get('apptransid');
  
  // parse ma_don_hang từ apptransid (yyMMdd_ma_don_hang)
  const maDonHang = appTransId ? appTransId.split('_')[1] : null;

  useEffect(() => {
    // Nếu không có thông tin đơn hàng, có thể người dùng truy cập trực tiếp
    // Thử tìm đơn hàng gần nhất của user hoặc yêu cầu đăng nhập
    checkPaymentStatus();

    return () => {
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
  }, []);

  const checkPaymentStatus = async () => {
    try {
      // Vì chúng ta chưa có ID đơn hàng trực tiếp ở đây dễ dàng (apptransid là mã), 
      // chúng ta nên gọi API tìm đơn hàng theo mã hoặc lấy đơn hàng mới nhất đang 'cho_thanh_toan'
      // Để đơn giản, giả sử backend có API check status theo ma_don_hang hoặc chúng ta lưu ID vào localStorage khi đặt hàng
      
      const orderId = localStorage.getItem('last_order_id');
      if (!orderId) {
        setStatus('failure');
        return;
      }

      const response = await api.get(`/account/orders/${orderId}/status`);
      const order = response.data;
      setOrderInfo(order);

      if (order.trang_thai_thanh_toan === 'da_thanh_toan') {
        setStatus('success');
        localStorage.removeItem('last_order_id');
      } else if (retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        pollTimer.current = setTimeout(checkPaymentStatus, 2000); // Thử lại sau 2s
      } else {
        setStatus('failure');
      }
    } catch (error) {
      console.error("Check status error:", error);
      if (retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        pollTimer.current = setTimeout(checkPaymentStatus, 2000);
      } else {
        setStatus('failure');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf5f0] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-md w-full">
        {status === 'processing' && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <Loader2 size={40} className="text-blue-500 animate-spin" />
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">Đang kiểm tra...</h2>
            <p className="text-gray-500 text-sm">Vui lòng đợi trong giây lát, chúng tôi đang xác nhận thanh toán của bạn.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">Thanh toán thành công!</h2>
            <p className="text-gray-500 text-sm mb-8">Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý.</p>
            
            <div className="w-full space-y-3">
              <button 
                onClick={() => navigate('/account?tab=orders')}
                className="w-full bg-[#e8175d] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
              >
                Xem đơn hàng <ArrowRight size={18} />
              </button>
              <button 
                onClick={() => navigate('/')}
                className="w-full bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          </div>
        )}

        {status === 'failure' && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <XCircle size={40} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">Thanh toán thất bại</h2>
            <p className="text-gray-500 text-sm mb-8">Rất tiếc, đã có lỗi xảy ra hoặc bạn đã hủy thanh toán. Bạn có thể thử lại trong phần quản lý đơn hàng.</p>
            
            <div className="w-full space-y-3">
              <button 
                onClick={() => navigate('/checkout')}
                className="w-full bg-[#e8175d] text-white py-4 rounded-2xl font-bold"
              >
                Thử lại ngay
              </button>
              <button 
                onClick={() => navigate('/account?tab=orders')}
                className="w-full bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold"
              >
                Về danh sách đơn hàng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentResult;
