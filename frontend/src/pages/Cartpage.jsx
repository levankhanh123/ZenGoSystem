// pages/CartPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart, Trash2, Plus, Minus,
  Package, ChevronRight, Store, RefreshCw,
  ShoppingBag, Tag
} from "lucide-react";
import { useCart } from "../contexts/CartContext.jsx";

const fVND = (n) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n ?? 0);

export default function CartPage() {
  const navigate = useNavigate();
  const { items, loading, totalItems, totalPrice, updateQuantity, removeItem, clearCart, reloadCart } = useCart();
  const [showClearModal, setShowClearModal] = useState(false);
  const [removingId,     setRemovingId]     = useState(null);

  const isLoggedIn = !!localStorage.getItem("token");

  if (!isLoggedIn) return <LoginPrompt onLogin={() => navigate("/login")} />;

  // Nhóm items theo shop (cua_hang_id + ten_cua_hang)
  const grouped = items.reduce((acc, item) => {
    const key = item.cua_hang_id ?? "unknown";
    if (!acc[key]) acc[key] = { shopName: item.ten_cua_hang ?? "Cửa hàng", items: [] };
    acc[key].items.push(item);
    return acc;
  }, {});

  const handleRemove = async (id) => {
    setRemovingId(id);
    await removeItem(id);
    setRemovingId(null);
  };

  return (
    <div className="min-h-screen bg-[#fdf5f0]">

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-[#e8175d] to-[#ff6b6b] py-10 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <ShoppingCart size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white leading-none">Giỏ hàng</h1>
              <p className="text-pink-200 text-sm mt-0.5">
                {totalItems > 0 ? `${totalItems} sản phẩm đang chờ` : "Chưa có sản phẩm"}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={reloadCart}
              className="flex items-center gap-1.5 text-xs font-bold text-pink-200
                hover:text-white bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl transition-all">
              <RefreshCw size={12} /> Làm mới
            </button>
            {items.length > 0 && (
              <button onClick={() => setShowClearModal(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-pink-200
                  hover:text-white bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl transition-all">
                <Trash2 size={12} /> Xoá tất cả
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <CartSkeleton />
        ) : items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── LEFT: Item groups ── */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {Object.entries(grouped).map(([shopId, group]) => (
                <div key={shopId} className="bg-white rounded-2xl shadow-sm border border-pink-50 overflow-hidden">

                  {/* Shop header */}
                  <div className="flex items-center gap-2.5 px-5 py-3.5 bg-[#fdf5f0] border-b border-pink-50">
                    <Store size={15} className="text-[#e8175d] shrink-0" />
                    <span className="text-sm font-extrabold text-gray-700">{group.shopName}</span>
                    <span className="ml-auto text-xs text-gray-400">{group.items.length} sản phẩm</span>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-pink-50">
                    {group.items.map((item) => (
                      <CartItemRow
                        key={item.id}
                        item={item}
                        removing={removingId === item.id}
                        onUpdate={(qty) => updateQuantity(item.id, qty)}
                        onRemove={() => handleRemove(item.id)}
                        onNavigate={() => navigate(`/product/${item.san_pham_id}`)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* ── RIGHT: Summary ── */}
            <div className="flex flex-col gap-4">

              {/* Price summary */}
              <div className="bg-white rounded-2xl shadow-sm border border-pink-50 p-5 sticky top-24">
                <h3 className="text-base font-extrabold text-gray-800 mb-4 flex items-center gap-2">
                  <ShoppingBag size={16} className="text-[#e8175d]" />
                  Tóm tắt đơn hàng
                </h3>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tạm tính ({totalItems} sp)</span>
                    <span className="font-semibold text-gray-700">{fVND(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Phí vận chuyển</span>
                    <span className="text-gray-400 italic text-xs">Tính khi thanh toán</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Giảm giá voucher</span>
                    <span className="text-gray-400 italic text-xs">Nhập mã ở bước sau</span>
                  </div>
                </div>

                {/* Voucher hint */}
                <div className="flex items-center gap-2 bg-pink-50 rounded-xl px-3 py-2.5 mb-4 border border-pink-100">
                  <Tag size={13} className="text-[#e8175d] shrink-0" />
                  <span className="text-xs text-[#e8175d] font-semibold">Bạn có thể dùng voucher ở trang thanh toán</span>
                </div>

                <div className="border-t-2 border-dashed border-pink-100 pt-4 mb-5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-gray-800 text-base">Tổng tiền</span>
                    <span className="font-black text-[#e8175d] text-2xl">{fVND(totalPrice)}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/checkout")}
                  className="w-full bg-[#e8175d] hover:bg-[#c0114d] text-white font-extrabold
                    py-4 rounded-2xl shadow-lg shadow-pink-200 hover:shadow-xl
                    flex items-center justify-center gap-2 text-sm
                    active:scale-[0.98] transition-all duration-150"
                >
                  Tiến hành thanh toán
                  <ChevronRight size={17} />
                </button>

                <button
                  onClick={() => navigate("/product")}
                  className="w-full mt-3 text-sm font-bold text-[#e8175d] border-2 border-pink-100
                    hover:border-[#e8175d] py-3 rounded-2xl transition-all active:scale-[0.98]"
                >
                  Tiếp tục mua sắm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Clear confirm modal ── */}
      {showClearModal && (
        <Modal onClose={() => setShowClearModal(false)}>
          <span className="text-5xl block text-center mb-4">🗑️</span>
          <h3 className="text-lg font-extrabold text-gray-900 text-center mb-2">Xoá toàn bộ giỏ hàng?</h3>
          <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
            Tất cả sản phẩm sẽ bị xoá khỏi giỏ. Hành động này không thể hoàn tác.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setShowClearModal(false)}
              className="flex-1 py-3 border-2 border-gray-200 rounded-2xl font-bold text-gray-600 hover:border-gray-300 active:scale-95 transition-all text-sm">
              Huỷ
            </button>
            <button onClick={() => { clearCart(); setShowClearModal(false); }}
              className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-2xl shadow active:scale-95 transition-all text-sm">
              Xoá tất cả
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ── CartItemRow ─────────────────────────────────────────────── */
function CartItemRow({ item, removing, onUpdate, onRemove, onNavigate }) {
  return (
    <div className={`flex gap-4 px-5 py-4 transition-all duration-200 ${removing ? "opacity-40 pointer-events-none" : ""}`}>

      {/* Image */}
      <div onClick={onNavigate}
        className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 border border-pink-50 shrink-0 cursor-pointer
          hover:border-pink-200 transition-colors">
        {item.hinh_anh
          ? <img src={item.hinh_anh} alt={item.ten_san_pham} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center">
              <Package size={24} className="text-pink-200" />
            </div>
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <p onClick={onNavigate}
          className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug cursor-pointer hover:text-[#e8175d] transition-colors">
          {item.ten_san_pham}
        </p>

        <p className="text-base font-extrabold text-[#e8175d]">
          {fVND(item.don_gia)}
        </p>

        {/* Bottom row: qty + subtotal + delete */}
        <div className="flex items-center gap-3 flex-wrap mt-1">

          {/* Qty control */}
          <div className="flex items-center border-2 border-pink-100 rounded-xl overflow-hidden">
            <button onClick={() => onUpdate(item.so_luong - 1)} disabled={item.so_luong <= 1}
              className="w-8 h-8 flex items-center justify-center bg-[#fdf5f0]
                hover:bg-pink-100 text-[#e8175d] disabled:opacity-30 transition-colors">
              <Minus size={12} />
            </button>
            <span className="w-10 text-center text-sm font-extrabold text-gray-800 bg-white">
              {item.so_luong}
            </span>
            <button onClick={() => onUpdate(item.so_luong + 1)}
              className="w-8 h-8 flex items-center justify-center bg-[#fdf5f0]
                hover:bg-pink-100 text-[#e8175d] transition-colors">
              <Plus size={12} />
            </button>
          </div>

          {/* Subtotal */}
          <span className="text-sm font-bold text-gray-500">
            = <span className="text-gray-800">{fVND(item.don_gia * item.so_luong)}</span>
          </span>

          {/* Delete */}
          <button onClick={onRemove}
            className="ml-auto flex items-center gap-1 text-xs text-gray-400 font-semibold
              hover:text-red-500 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-all">
            <Trash2 size={12} /> Xoá
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Empty ── */
function EmptyCart() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-24 h-24 rounded-3xl bg-pink-50 flex items-center justify-center mb-5 shadow-sm">
        <ShoppingCart size={40} className="text-pink-200" />
      </div>
      <h3 className="text-xl font-extrabold text-gray-800 mb-2">Giỏ hàng trống</h3>
      <p className="text-sm text-gray-400 mb-8 max-w-xs">
        Bạn chưa thêm sản phẩm nào. Hãy khám phá hàng ngàn sản phẩm chất lượng!
      </p>
      <button onClick={() => navigate("/shop")}
        className="flex items-center gap-2 bg-[#e8175d] hover:bg-[#c0114d] text-white
          font-bold px-8 py-3.5 rounded-2xl shadow-lg shadow-pink-200 hover:shadow-xl
          active:scale-95 transition-all">
        Khám phá sản phẩm <ChevronRight size={16} />
      </button>
    </div>
  );
}

/* ── Login Prompt ── */
function LoginPrompt({ onLogin }) {
  return (
    <div className="min-h-screen bg-[#fdf5f0] flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-sm border border-pink-50 p-10 max-w-sm w-full text-center mx-4">
        <div className="w-20 h-20 rounded-3xl bg-pink-50 flex items-center justify-center mx-auto mb-5">
          <ShoppingCart size={36} className="text-[#e8175d]" />
        </div>
        <h3 className="text-xl font-extrabold text-gray-900 mb-2">Vui lòng đăng nhập</h3>
        <p className="text-sm text-gray-400 mb-7 leading-relaxed">
          Bạn cần đăng nhập để xem và quản lý giỏ hàng
        </p>
        <button onClick={onLogin}
          className="w-full bg-[#e8175d] hover:bg-[#c0114d] text-white font-extrabold
            py-3.5 rounded-2xl shadow-lg shadow-pink-200 active:scale-95 transition-all">
          Đăng nhập ngay
        </button>
      </div>
    </div>
  );
}

/* ── Modal wrapper ── */
function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
      onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8"
        onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

/* ── Skeleton ── */
function CartSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
      <div className="lg:col-span-2 space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-pink-50 overflow-hidden">
            <div className="h-12 bg-pink-50" />
            {[1, 2, 3].map((j) => (
              <div key={j} className="flex gap-4 px-5 py-4 border-t border-pink-50">
                <div className="w-20 h-20 rounded-xl bg-gray-100 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                  <div className="h-8 bg-gray-100 rounded w-28 mt-3" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-pink-50 h-80" />
    </div>
  );
}