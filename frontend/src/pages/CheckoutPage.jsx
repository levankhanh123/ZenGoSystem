import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  MapPin, Store, Package, CreditCard, 
  Wallet, ChevronRight, Tag, ShoppingBag,
  ArrowLeft, Info, X, Plus, CheckCircle, Save, Loader2, Star, Check
} from 'lucide-react';
import { VoucherPicker } from './Voucherpage';
import { useAddresses, useOrders, useGhn } from '../hooks/useAccount.js';
import './CheckoutPage.css';

const formatVND = (n) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n ?? 0);

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedItems = location.state?.selectedItems || [];

  const { addresses, loading: loadingAddr, addAddress, updateAddress } = useAddresses();
  const { placeOrder } = useOrders();

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [showVoucherPicker, setShowVoucherPicker] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState(null);

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);

  // Thiết lập địa chỉ mặc định khi load xong
  useEffect(() => {
    if (addresses.length > 0) {
      if (!selectedAddress) {
        const def = addresses.find(a => Number(a.la_mac_dinh) === 1) || addresses[0];
        setSelectedAddress(def);
      } else {
        // Cập nhật lại thông tin nếu địa chỉ đang chọn bị thay đổi dữ liệu
        const updated = addresses.find(a => a.id === selectedAddress.id);
        if (updated) setSelectedAddress(updated);
      }
    }
  }, [addresses, selectedAddress]);

  // Nhóm items theo shop
  const grouped = useMemo(() => {
    return selectedItems.reduce((acc, item) => {
      const key = item.cua_hang_id ?? "unknown";
      if (!acc[key]) acc[key] = { shopName: item.ten_cua_hang ?? "Cửa hàng", items: [] };
      acc[key].items.push(item);
      return acc;
    }, {});
  }, [selectedItems]);

  const subtotal = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + (item.don_gia * item.so_luong), 0);
  }, [selectedItems]);

  const shippingFee = 30000; 

  const discount = useMemo(() => {
    if (!appliedVoucher) return 0;
    if (appliedVoucher.loai === 'giam_phan_tram' || appliedVoucher.loai === 'phan_tram') {
      const val = (subtotal * appliedVoucher.gia_tri_voucher) / 100;
      return appliedVoucher.giam_toi_da > 0 ? Math.min(val, appliedVoucher.giam_toi_da) : val;
    }
    return appliedVoucher.gia_tri_voucher;
  }, [appliedVoucher, subtotal]);

  const total = subtotal + shippingFee - discount;

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert("Vui lòng thêm địa chỉ nhận hàng trước khi đặt hàng.");
      return;
    }

    setIsPlacingOrder(true);
    try {
      const orderPayload = {
        dia_chi_id: selectedAddress.id,
        voucher_id: appliedVoucher?.id || null,
        phuong_thuc_thanh_toan: paymentMethod,
        items: selectedItems.map(item => ({
          cart_item_id: item.id, // Để backend xóa khỏi giỏ hàng
          san_pham_bien_the_id: item.san_pham_bien_the_id,
          so_luong: item.so_luong
        })),
        tam_tinh: subtotal,
        phi_ship: shippingFee,
        giam_gia: discount,
        tong_tien: total
      };

      const result = await placeOrder(orderPayload);
      
      // Lưu lại ID đơn hàng để PaymentResult polling
      const orderId = result.order ? result.order.id : result.id;
      if (orderId) localStorage.setItem('last_order_id', orderId);

      // Nếu là thanh toán qua ZaloPay
      if (paymentMethod === 'zalopay' && result.payment_url) {
        window.location.href = result.payment_url;
        return;
      }

      setSuccessOrder(result);
    } catch (error) {
      console.error("Order error:", error);
      alert(error.message || "Đã có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleSaveAddress = async (formData) => {
    try {
      if (editingAddress) {
        await updateAddress(editingAddress.id, formData);
        setEditingAddress(null);
      } else {
        const newAddr = await addAddress(formData);
        setSelectedAddress(newAddr);
      }
      setShowAddForm(false);
    } catch (error) {
      alert("Lỗi khi lưu địa chỉ. Vui lòng thử lại.");
    }
  };

  if (selectedItems.length === 0 && !successOrder) {
    return (
      <div className="min-h-screen bg-[#fdf5f0] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-sm w-full">
          <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={40} className="text-[#e8175d]" />
          </div>
          <h2 className="text-xl font-black text-gray-800 mb-2">Chưa có sản phẩm</h2>
          <p className="text-gray-500 text-sm mb-8">Vui lòng quay lại giỏ hàng và chọn sản phẩm bạn muốn mua.</p>
          <button 
            onClick={() => navigate('/cart')}
            className="w-full bg-[#e8175d] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} /> Quay lại giỏ hàng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf5f0] pb-20">
      {/* Header */}
      <div className="bg-white border-b border-pink-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/cart')} className="p-2 hover:bg-pink-50 rounded-full transition-colors">
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-lg font-black text-[#e8175d] tracking-tight">THANH TOÁN</h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Address Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-pink-50 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-[#e8175d] via-[#ff6b6b] to-[#e8175d]"></div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-[#e8175d] mb-4">
                  <MapPin size={18} />
                  <h2 className="font-black text-sm uppercase tracking-wider">Địa chỉ nhận hàng</h2>
                </div>

                {loadingAddr ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 mb-4">Bạn chưa có địa chỉ nhận hàng nào.</p>
                    <button 
                      onClick={() => { setEditingAddress(null); setShowAddForm(true); }}
                      className="inline-flex items-center gap-2 bg-[#e8175d] text-white px-6 py-2.5 rounded-xl font-bold text-sm"
                    >
                      <Plus size={16} /> Thêm địa chỉ mới
                    </button>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      {selectedAddress && (
                        <>
                          <p className="font-bold text-gray-800">{selectedAddress.ten_nguoi_nhan} <span className="font-normal text-gray-400 ml-2">| {selectedAddress.so_dien_thoai}</span></p>
                          <p className="text-sm text-gray-500 leading-relaxed">{selectedAddress.dia_chi_chi_tiet}</p>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {(Number(selectedAddress?.la_mac_dinh) === 1) && (
                        <span className="bg-[#e8175d] text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase flex items-center gap-1 shadow-sm">
                          <Star size={10} className="fill-white" /> Mặc định
                        </span>
                      )}
                      <button 
                        onClick={() => setShowAddressModal(true)}
                        className="text-sm font-bold text-[#e8175d] hover:underline"
                      >
                        Thay đổi
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Product List */}
            <div className="space-y-4">
              {Object.entries(grouped).map(([shopId, group]) => (
                <div key={shopId} className="bg-white rounded-3xl shadow-sm border border-pink-50 overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50/50 border-b border-pink-50 flex items-center gap-2">
                    <Store size={16} className="text-gray-400" />
                    <span className="font-black text-sm text-gray-700">{group.shopName}</span>
                  </div>
                  <div className="divide-y divide-pink-50">
                    {group.items.map((item) => (
                      <div key={item.id} className="p-6 flex gap-4">
                        <img src={item.hinh_anh} alt={item.ten_san_pham} className="w-20 h-20 rounded-2xl object-cover border border-pink-50" />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-gray-800 line-clamp-2 mb-1">{item.ten_san_pham}</h3>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-400">Đơn giá: {formatVND(item.don_gia)}</p>
                            <p className="text-xs text-gray-400">x{item.so_luong}</p>
                            <p className="font-bold text-gray-800">{formatVND(item.don_gia * item.so_luong)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-3xl shadow-sm border border-pink-50 p-6">
              <div className="flex items-center gap-2 text-gray-800 mb-6">
                <CreditCard size={18} className="text-[#e8175d]" />
                <h2 className="font-black text-sm uppercase tracking-wider">Phương thức thanh toán</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div 
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3
                    ${paymentMethod === 'cod' ? 'border-[#e8175d] bg-pink-50/50' : 'border-gray-100 hover:border-pink-200'}`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-[#e8175d]' : 'border-gray-300'}`}>
                    {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 bg-[#e8175d] rounded-full"></div>}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                      <Wallet size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-800">Thanh toán khi nhận hàng</p>
                      <p className="text-[10px] text-gray-400">COD - Tiền mặt</p>
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => setPaymentMethod('zalopay')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3
                    ${paymentMethod === 'zalopay' ? 'border-[#e8175d] bg-pink-50/50' : 'border-gray-100 hover:border-pink-200'}`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'zalopay' ? 'border-[#e8175d]' : 'border-gray-300'}`}>
                    {paymentMethod === 'zalopay' && <div className="w-2.5 h-2.5 bg-[#e8175d] rounded-full"></div>}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                      <img src="https://img.mservice.com.vn/app/img/payment/zalopay.png" alt="ZaloPay" className="w-6 h-6 object-contain" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-800">Ví điện tử ZaloPay</p>
                      <p className="text-[10px] text-gray-400">Thanh toán nhanh chóng</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            
            {/* Voucher Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-pink-50 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-gray-800">
                  <Tag size={18} className="text-[#e8175d]" />
                  <h2 className="font-black text-sm uppercase tracking-wider">ZenGo Voucher</h2>
                </div>
                <button 
                  onClick={() => setShowVoucherPicker(true)}
                  className="text-xs font-bold text-[#e8175d] hover:underline"
                >
                  Chọn mã
                </button>
              </div>
              
              {appliedVoucher ? (
                <div className="flex items-center justify-between bg-pink-50/50 p-3 rounded-xl border border-pink-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#e8175d] text-white p-1.5 rounded-lg">
                      <Tag size={14} />
                    </div>
                    <span className="text-sm font-bold text-[#e8175d]">{appliedVoucher.ma_voucher}</span>
                  </div>
                  <button onClick={() => setAppliedVoucher(null)} className="text-gray-400 hover:text-gray-600">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => setShowVoucherPicker(true)}
                  className="flex items-center justify-between border-2 border-dashed border-gray-100 p-4 rounded-2xl cursor-pointer hover:border-pink-200 transition-all"
                >
                  <span className="text-sm text-gray-400">Chọn hoặc nhập mã giảm giá</span>
                  <ChevronRight size={16} className="text-gray-300" />
                </div>
              )}
            </div>

            {/* Summary Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-pink-50 p-6 sticky top-24">
              <h2 className="font-black text-lg text-gray-800 mb-6">Chi tiết thanh toán</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tổng tiền hàng</span>
                  <span className="font-bold text-gray-700">{formatVND(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tổng phí vận chuyển</span>
                  <span className="font-bold text-gray-700">{formatVND(shippingFee)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Giảm giá voucher</span>
                    <span className="font-bold text-green-600">-{formatVND(discount)}</span>
                  </div>
                )}
                <div className="pt-4 border-t border-dashed border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-gray-800">Tổng thanh toán</span>
                    <span className="font-black text-2xl text-[#e8175d]">{formatVND(total)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 mb-6 flex gap-3">
                <Info size={16} className="text-gray-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Nhấn "Đặt hàng" đồng nghĩa với việc bạn đồng ý tuân theo <span className="text-[#e8175d] font-bold">Điều khoản ZenGo</span>
                </p>
              </div>

              <button 
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
                className="w-full bg-[#e8175d] hover:bg-[#c0114d] text-white font-black py-4 rounded-2xl shadow-lg shadow-pink-200 hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isPlacingOrder ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    ĐANG XỬ LÝ...
                  </>
                ) : "ĐẶT HÀNG"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Address Selector Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddressModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-extrabold text-gray-900">Chọn địa chỉ nhận hàng</h3>
              <button onClick={() => setShowAddressModal(false)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"><X size={15} /></button>
            </div>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {addresses.map(addr => (
                <div 
                  key={addr.id}
                  onClick={() => { setSelectedAddress(addr); setShowAddressModal(false); }}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all relative group
                    ${selectedAddress?.id === addr.id ? 'border-[#e8175d] bg-pink-50/30' : 'border-gray-50 hover:border-pink-100'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-sm text-gray-800">{addr.ten_nguoi_nhan}</p>
                      <span className="text-xs text-gray-300">|</span>
                      <p className="text-sm text-gray-500">{addr.so_dien_thoai}</p>
                      {(Number(addr.la_mac_dinh) === 1) && (
                        <span className="bg-[#e8175d] text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase">Mặc định</span>
                      )}
                    </div>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setEditingAddress(addr); 
                        setShowAddressModal(false);
                        setShowAddForm(true);
                      }}
                      className="text-xs font-black text-[#e8175d] hover:underline shrink-0"
                    >
                      CẬP NHẬT
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{addr.dia_chi_chi_tiet}</p>
                </div>
              ))}
              <button 
                onClick={() => { setShowAddressModal(false); setEditingAddress(null); setShowAddForm(true); }}
                className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-sm font-bold text-gray-500 hover:border-[#e8175d] hover:text-[#e8175d] transition-all"
              >
                + Thêm địa chỉ mới
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Address Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddForm(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-extrabold text-gray-900">
                {editingAddress ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
              </h3>
              <button onClick={() => setShowAddForm(false)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"><X size={15} /></button>
            </div>
            <AddressForm 
              initialData={editingAddress}
              onSave={handleSaveAddress} 
              onCancel={() => setShowAddForm(false)} 
            />
          </div>
        </div>
      )}

      <VoucherPicker 
        open={showVoucherPicker} 
        onClose={() => setShowVoucherPicker(false)}
        onSelect={(v) => {
          setAppliedVoucher(v);
          setShowVoucherPicker(false);
        }}
        orderTotal={subtotal}
      />
      {successOrder && (
        <OrderSuccessModal 
          order={successOrder} 
          onClose={() => navigate('/account?tab=orders')} 
        />
      )}
    </div>
  );
};

const OrderSuccessModal = ({ order, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-white rounded-[40px] shadow-2xl max-w-md w-full p-10 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-100">
            <Check size={32} strokeWidth={4} />
          </div>
        </div>
        
        <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Đặt hàng thành công!</h2>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          Cảm ơn bạn đã tin tưởng ZenGo. Đơn hàng <span className="font-bold text-[#e8175d]">#{order.ma_don_hang || order.id}</span> của bạn đang được xử lý.
        </p>

        <div className="space-y-4">
          <button 
            onClick={onClose}
            className="w-full bg-[#e8175d] text-white py-4 rounded-2xl font-black shadow-lg shadow-pink-100 hover:shadow-xl transition-all active:scale-95"
          >
            THEO DÕI ĐƠN HÀNG
          </button>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full bg-white text-gray-500 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    </div>
  );
};

const AddressForm = ({ initialData, onSave, onCancel }) => {
  const [form, setForm] = useState({
    ten_nguoi_nhan: "",
    so_dien_thoai: "",
    dia_chi_chi_tiet: "",
    province_id: "",
    district_id: "",
    ward_code: "",
    la_mac_dinh: 0,
    ...(initialData || {})
  });
  const [saving, setSaving] = useState(false);
  const { fetchProvinces, fetchDistricts, fetchWards } = useGhn();

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  useEffect(() => {
    if (initialData) setForm({ ...initialData });
  }, [initialData]);

  // Load provinces on mount
  useEffect(() => {
    fetchProvinces().then(setProvinces);
  }, [fetchProvinces]);

  // Load districts when province_id changes
  useEffect(() => {
    if (form.province_id) {
      fetchDistricts(form.province_id).then(setDistricts);
    } else {
      setDistricts([]);
    }
  }, [form.province_id, fetchDistricts]);

  // Load wards when district_id changes
  useEffect(() => {
    if (form.district_id) {
      fetchWards(form.district_id).then(setWards);
    } else {
      setWards([]);
    }
  }, [form.district_id, fetchWards]);

  const handleProvinceChange = (e) => {
    setForm(f => ({ ...f, province_id: e.target.value, district_id: "", ward_code: "" }));
  };

  const handleDistrictChange = (e) => {
    setForm(f => ({ ...f, district_id: e.target.value, ward_code: "" }));
  };

  const iCls = `w-full px-4 py-2.5 rounded-xl border-2 border-gray-100 text-sm outline-none focus:border-[#e8175d] focus:ring-2 focus:ring-pink-50 transition-all`;

  return (
    <form onSubmit={async (e) => { 
      e.preventDefault(); 
      setSaving(true); 
      await onSave(form); 
      setSaving(false); 
    }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Tên người nhận *</label>
          <input type="text" required value={form.ten_nguoi_nhan}
            onChange={(e) => setForm(f => ({ ...f, ten_nguoi_nhan: e.target.value }))}
            className={iCls} placeholder="Họ và tên" />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Số điện thoại *</label>
          <input type="tel" required value={form.so_dien_thoai}
            onChange={(e) => setForm(f => ({ ...f, so_dien_thoai: e.target.value }))}
            className={iCls} placeholder="Số điện thoại" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Tỉnh / Thành phố *</label>
          <select required value={form.province_id} onChange={handleProvinceChange} className={iCls}>
            <option value="">Chọn Tỉnh/Thành</option>
            {provinces.map(p => (
              <option key={p.ProvinceID} value={p.ProvinceID}>{p.ProvinceName}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Quận / Huyện *</label>
          <select required value={form.district_id} onChange={handleDistrictChange} disabled={!form.province_id} className={iCls}>
            <option value="">Chọn Quận/Huyện</option>
            {districts.map(d => (
              <option key={d.DistrictID} value={d.DistrictID}>{d.DistrictName}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Phường / Xã *</label>
          <select required value={form.ward_code} onChange={(e) => setForm(f => ({ ...f, ward_code: e.target.value }))} disabled={!form.district_id} className={iCls}>
            <option value="">Chọn Phường/Xã</option>
            {wards.map(w => (
              <option key={w.WardCode} value={w.WardCode}>{w.WardName}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Địa chỉ chi tiết *</label>
        <textarea required rows={2} value={form.dia_chi_chi_tiet}
          onChange={(e) => setForm(f => ({ ...f, dia_chi_chi_tiet: e.target.value }))}
          className={`${iCls} resize-none`} placeholder="Số nhà, tên đường..." />
      </div>

      <label className="flex items-center gap-3 cursor-pointer group">
        <div onClick={() => setForm(f => ({ ...f, la_mac_dinh: f.la_mac_dinh ? 0 : 1 }))}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all
            ${form.la_mac_dinh ? "bg-[#e8175d] border-[#e8175d]" : "border-gray-200 group-hover:border-pink-300"}`}>
          {form.la_mac_dinh ? <CheckCircle size={12} className="text-white" /> : null}
        </div>
        <span className="text-sm font-bold text-gray-600">Đặt làm địa chỉ mặc định</span>
      </label>

      <div className="flex gap-3 pt-4">
        <button type="button" onClick={onCancel} className="flex-1 py-3 border-2 border-gray-100 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 active:scale-[0.98] transition-all">Huỷ</button>
        <button type="submit" disabled={saving}
          className="flex-1 py-3 bg-[#e8175d] text-white font-black rounded-2xl shadow-lg shadow-pink-100 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-70">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {initialData ? "Lưu thay đổi" : "Lưu địa chỉ"}
        </button>
      </div>
    </form>
  );
};

export default CheckoutPage;
