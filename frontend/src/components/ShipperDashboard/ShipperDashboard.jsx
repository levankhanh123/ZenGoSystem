import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/Authcontext';
import { useShipperDashboard, useShipperOrders } from '../../hooks/useShipper';
import { 
  LogOut, Package, Truck, CheckCircle, 
  MapPin, Clock, DollarSign, Camera,
  XCircle, AlertCircle, ChevronRight,
  Info, Loader2, RefreshCcw, MessageCircle
} from 'lucide-react';
import ShipperChatModal from '../chat/ShipperChatModal';

export default function ShipperDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useShipperDashboard();
  const { updateStatus, receiveOrder } = useShipperOrders();
  
  const [activeTab, setActiveTab] = useState('zone'); // zone, processing, history
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showFailModal, setShowFailModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [failReason, setFailReason] = useState('');
  
  // Chat state
  const [chatConfig, setChatConfig] = useState({ isOpen: false, targetUserId: null, shopId: null, orderId: null, targetName: '' });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleUpdateStatus = async (id, status, payload = {}) => {
    setIsUpdating(true);
    try {
      await updateStatus(id, { trang_thai: status, ...payload });
      reload();
      setShowFailModal(false);
      setShowPhotoModal(false);
      setSelectedOrder(null);
    } catch (e) {
      alert(e.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReceiveOrder = async (id) => {
    setIsUpdating(true);
    try {
      await receiveOrder(id);
      reload();
    } catch (e) {
      alert(e.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-[#e8175d] mx-auto mb-4" size={48} />
          <p className="text-gray-500 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Lỗi kết nối</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button 
            onClick={() => reload()}
            className="w-full bg-[#e8175d] text-white font-bold py-3 rounded-xl shadow-lg hover:opacity-90 transition-opacity"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const getOrdersByTab = () => {
    switch (activeTab) {
      case 'zone': return data?.zoneOrders || [];
      case 'processing': return data?.processingOrders || [];
      case 'history': return data?.historyOrders || [];
      default: return [];
    }
  };

  const currentOrders = getOrdersByTab();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      {/* Header */}
      <header className="bg-[#e8175d] text-white p-4 shadow-md sticky top-0 z-40">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Truck size={24} />
            <h1 className="font-bold text-xl tracking-tight">ZenGo Shipper</h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={reload}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <RefreshCcw size={20} />
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors text-sm font-semibold"
            >
              <LogOut size={16} /> Thoát
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/10">
          <div className="relative">
            <div className="w-14 h-14 rounded-xl bg-white/20 border-2 border-white/30 overflow-hidden shadow-inner">
              {data?.shipper?.anh_dai_dien ? (
                <img 
                  src={data.shipper.anh_dai_dien} 
                  alt="Shipper Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-black text-xl">
                  {data?.shipper?.ho_ten?.charAt(0) || 'S'}
                </div>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-[#e8175d] rounded-full"></div>
          </div>
          <div className="flex-1">
            <h2 className="font-black text-lg leading-tight truncate">
              {data?.shipper?.ho_ten || 'Shipper'}
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1 text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold uppercase">
                <MapPin size={10} />
                {data?.shipper?.shipper_profile?.khu_vuc || 'Khu vực Q.12'}
              </div>
              <div className="flex items-center gap-1 text-[10px] bg-yellow-400 text-red-700 px-2 py-0.5 rounded-full font-black uppercase">
                ID: {data?.shipper?.id}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold opacity-80 uppercase tracking-tighter">Đã giao</p>
            <p className="text-xl font-black">{data?.stats?.da_giao || 0}</p>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-gray-100 sticky top-[64px] z-30">
        <div className="flex max-w-5xl mx-auto">
          {[
            { id: 'zone', label: 'Đơn trong vùng', icon: Package },
            { id: 'processing', label: 'Đang xử lý', icon: Truck },
            { id: 'history', label: 'Lịch sử', icon: Clock },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 flex flex-col items-center gap-1 transition-all relative ${
                activeTab === tab.id 
                  ? 'text-[#e8175d] font-bold' 
                  : 'text-gray-400 font-medium'
              }`}
            >
              <tab.icon size={20} />
              <span className="text-[11px] uppercase tracking-tighter">{tab.label}</span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-[#e8175d] rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 lg:max-w-5xl mx-auto w-full">
        <div className="space-y-4">
          {currentOrders.length > 0 ? (
            currentOrders.map(order => (
              <OrderCard 
                key={order.id} 
                order={order} 
                currentUserId={user?.id}
                onReceive={() => handleReceiveOrder(order.id)}
                onAction={(status, payload) => handleUpdateStatus(order.id, status, payload)}
                isUpdating={isUpdating}
                onFailClick={() => {
                  setSelectedOrder(order);
                  setShowFailModal(true);
                }}
                onPhotoClick={() => {
                  setSelectedOrder(order);
                  setShowPhotoModal(true);
                }}
                onOpenChat={(targetUserId, shopId, targetName) => {
                  setChatConfig({ isOpen: true, targetUserId, shopId, orderId: order.order?.id, targetName });
                }}
              />
            ))
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200 mt-10">
              <Package className="mx-auto text-gray-200 mb-3" size={64} />
              <h4 className="text-gray-400 font-bold text-lg">Trống</h4>
              <p className="text-gray-400 text-sm">Không tìm thấy đơn hàng nào trong mục này</p>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {showFailModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-10">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <XCircle className="text-red-500" /> Lý do giao hàng thất bại
            </h3>
            <div className="space-y-3 mb-6">
              {[
                'Khách thuê bao/không nghe máy',
                'Khách hẹn ngày khác giao lại',
                'Khách từ chối nhận hàng (Boom hàng)',
                'Sai địa chỉ / Không tìm thấy địa chỉ',
                'Hàng bị hư hỏng',
              ].map(reason => (
                <button
                  key={reason}
                  onClick={() => setFailReason(reason)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    failReason === reason 
                      ? 'border-[#e8175d] bg-[#e8175d]/5 text-[#e8175d] font-bold' 
                      : 'border-gray-100 hover:border-gray-200 text-gray-700'
                  }`}
                >
                  {reason}
                </button>
              ))}
              <textarea
                placeholder="Lý do khác..."
                className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-[#e8175d] focus:ring-0 text-sm mt-2"
                rows={2}
                value={failReason && !['Khách thuê bao/không nghe máy', 'Khách hẹn ngày khác giao lại', 'Khách từ chối nhận hàng (Boom hàng)', 'Sai địa chỉ / Không tìm thấy địa chỉ', 'Hàng bị hư hỏng'].includes(failReason) ? failReason : ''}
                onChange={(e) => setFailReason(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowFailModal(false)}
                className="flex-1 py-3 font-bold text-gray-500 border border-gray-200 rounded-xl"
              >
                Hủy
              </button>
              <button 
                disabled={!failReason || isUpdating}
                onClick={() => handleUpdateStatus(selectedOrder.id, 'giao_that_bai', { ly_do_that_bai: failReason })}
                className="flex-1 py-3 font-bold text-white bg-[#e8175d] rounded-xl shadow-lg disabled:opacity-50"
              >
                {isUpdating ? 'Đang lưu...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Camera className="text-blue-500" /> Bằng chứng giao hàng
            </h3>
            <div className="aspect-video bg-gray-100 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-gray-300 mb-6 group hover:border-blue-400 transition-colors cursor-pointer relative overflow-hidden">
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept="image/*"
                capture="environment"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  
                  // Mock upload to show logic - in real world use Cloudinary SDK or API
                  setIsUpdating(true);
                  const formData = new FormData();
                  formData.append('file', file);
                  formData.append('upload_preset', 'zengo_uploads'); // Replace with real preset
                  
                  try {
                    const res = await fetch('https://api.cloudinary.com/v1_1/your-cloud-name/image/upload', {
                      method: 'POST',
                      body: formData
                    });
                    const data = await res.json();
                    handleUpdateStatus(selectedOrder.id, 'da_giao', { anh_xac_nhan: data.secure_url });
                  } catch (err) {
                    // fallback mock for demo
                    handleUpdateStatus(selectedOrder.id, 'da_giao', { anh_xac_nhan: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaad5b?auto=format&fit=crop&w=800&q=80' });
                  }
                }}
              />
              <Camera size={48} className="text-gray-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-bold text-gray-500">Chụp ảnh hoặc Chọn file</p>
              <p className="text-xs text-gray-400 mt-1">Dùng ảnh để xác nhận giao thành công</p>
            </div>
            <button 
              onClick={() => setShowPhotoModal(false)}
              className="w-full py-3 font-bold text-gray-500 border border-gray-200 rounded-xl"
            >
              Quay lại
            </button>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      <ShipperChatModal 
        isOpen={chatConfig.isOpen}
        onClose={() => setChatConfig({ ...chatConfig, isOpen: false })}
        targetUserId={chatConfig.targetUserId}
        shopId={chatConfig.shopId}
        orderId={chatConfig.orderId}
        targetName={chatConfig.targetName}
      />
    </div>
  );
}

function OrderCard({ order, currentUserId, onReceive, onAction, onFailClick, onPhotoClick, isUpdating, onOpenChat }) {
  const statusLabels = {
    cho_lay_hang: { text: 'Chờ nhận', color: 'bg-gray-100 text-gray-600' },
    dang_lay_hang: { text: 'Đang đến lấy', color: 'bg-indigo-100 text-indigo-700' },
    dang_giao: { text: 'Đang giao', color: 'bg-orange-100 text-orange-700' },
    da_giao: { text: 'Thành công', color: 'bg-green-100 text-green-700' },
    giao_that_bai: { text: 'Thất bại', color: 'bg-red-100 text-red-700' },
    da_tra_hang: { text: 'Đã trả hàng', color: 'bg-purple-100 text-purple-700' },
  };

  let statusText = statusLabels[order.trang_thai]?.text || order.trang_thai;
  let statusColor = statusLabels[order.trang_thai]?.color || 'bg-gray-100 text-gray-700';

  if (order.sub_status === 'cho_giao_lai') {
    statusText = 'Chờ giao lại';
    statusColor = 'bg-yellow-100 text-yellow-700';
  }

  const isAssignedToMe = order.nguoi_giao_hang_id === currentUserId;
  const isUnassigned = !order.nguoi_giao_hang_id;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4 border-b border-gray-50 flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-black text-gray-900">#{order.ma_van_don || order.order?.ma_don_hang}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${statusColor}`}>
              {statusText}
            </span>
            {order.so_lan_giao_lai > 0 && (
              <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                Lần {order.so_lan_giao_lai + 1}/3
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <Clock size={12} />
            <span>{new Date(order.created_at).toLocaleString('vi-VN')}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[#e8175d] font-black text-lg">
            {Number(order.cod_thu_ho).toLocaleString('vi-VN')}đ
          </div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Tiền COD</div>
        </div>
      </div>

      {/* Shipping Fee Info */}
      <div className="flex justify-between items-center px-4 py-2 bg-white border-b border-gray-50">
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
          <DollarSign size={14} className="text-green-500" />
          Phí ship nhận: <span className="text-green-600">{Number(order.order?.phi_giao_hang || 0).toLocaleString('vi-VN')}đ</span>
        </div>
      </div>
      
      <div className="p-4 bg-gray-50/50 space-y-3">
        <div className="flex gap-3">
          <div className="mt-1">
            <div className="w-2 h-2 rounded-full bg-blue-500 mb-8 relative">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-gray-200"></div>
            </div>
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase leading-none">Lấy tại</p>
                {['dang_lay_hang', 'dang_giao'].includes(order.trang_thai) && (
                  <button 
                    onClick={() => onOpenChat(null, order.order?.cua_hang_id, order.order?.cua_hang?.ten_cua_hang)}
                    className="text-yellow-600 hover:text-yellow-700 p-1"
                  >
                    <MessageCircle size={14} />
                  </button>
                )}
              </div>
              <p className="text-sm font-semibold text-gray-700 line-clamp-1">{order.order?.cua_hang?.ten_cua_hang || 'Cửa hàng ZenGo'}</p>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase leading-none">Giao đến</p>
                {['dang_lay_hang', 'dang_giao'].includes(order.trang_thai) && (
                  <button 
                    onClick={() => onOpenChat(order.order?.nguoi_dung_id, null, order.order?.nguoi_nhan)}
                    className="text-yellow-600 hover:text-yellow-700 p-1"
                  >
                    <MessageCircle size={14} />
                  </button>
                )}
              </div>
              <p className="text-sm font-bold text-gray-800 line-clamp-2">{order.order?.dia_chi_nhan}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white flex gap-2">
        {order.trang_thai === 'cho_lay_hang' && isUnassigned && (
          <button 
            disabled={isUpdating}
            onClick={onReceive}
            className="flex-1 bg-[#e8175d] text-white font-bold py-3 rounded-xl shadow-lg shadow-[#e8175d]/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <Truck size={18} /> Nhận đơn này
          </button>
        )}

        {order.trang_thai === 'cho_lay_hang' && isAssignedToMe && (
          <button 
            disabled={isUpdating}
            onClick={() => onAction('dang_lay_hang')}
            className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <Truck size={18} /> Đi lấy hàng
          </button>
        )}

        {order.trang_thai === 'dang_lay_hang' && (
          <button 
            disabled={isUpdating}
            onClick={() => onAction('dang_giao')}
            className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <CheckCircle size={18} /> Đã lấy hàng
          </button>
        )}
        
        {(order.trang_thai === 'dang_giao' || order.sub_status === 'cho_giao_lai') && (
          <>
            <button 
              onClick={onFailClick}
              className="flex-1 bg-white text-red-500 border-2 border-red-100 font-bold py-3 rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-1"
            >
              <XCircle size={18} /> Thất bại
            </button>
            <button 
              onClick={onPhotoClick}
              className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-200 active:scale-95 transition-transform flex items-center justify-center gap-1"
            >
              <CheckCircle size={18} /> Giao thành công
            </button>
          </>
        )}

        {(order.trang_thai === 'da_giao' || order.trang_thai === 'giao_that_bai' || order.trang_thai === 'da_tra_hang') && (
          <button className="flex-1 bg-gray-100 text-gray-500 font-bold py-3 rounded-xl flex items-center justify-center gap-1 cursor-not-allowed">
            <Info size={18} /> Đã kết thúc
          </button>
        )}
      </div>
    </div>
  );
}
