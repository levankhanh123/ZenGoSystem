import { useState as _us2 } from "react";
import { useNavigate as _useNav } from "react-router-dom";
import { ChevronDown, ChevronUp, Star as _Star, X as _X, Send, CreditCard } from "lucide-react";
import { useOrders } from "../../hooks/useAccount.js";

const ORDER_STATUS_MAP = {
  cho_thanh_toan:   { label: "Chờ thanh toán", color: "text-blue-700   bg-blue-50   border-blue-300"    },
  cho_xac_nhan:    { label: "Chờ xác nhận",   color: "text-yellow-700 bg-yellow-50 border-yellow-300"  },
  cho_lay_hang:    { label: "Chờ lấy hàng",   color: "text-blue-700   bg-blue-50   border-blue-300"    },
  dang_xu_ly:      { label: "Đang xử lý",      color: "text-blue-700   bg-blue-50   border-blue-300"    },
  dang_giao:       { label: "Đang giao",        color: "text-purple-700 bg-purple-50 border-purple-300"  },
  da_giao:         { label: "Đã giao",          color: "text-green-700  bg-green-50  border-green-300"   },
  hoan_thanh:      { label: "Hoàn thành",       color: "text-green-700  bg-green-50  border-green-300"   },
  da_huy:          { label: "Đã huỷ",           color: "text-red-700    bg-red-50    border-red-300"     },
  hoan_tien:       { label: "Hoàn tiền",        color: "text-orange-700 bg-orange-50 border-orange-300" },
  that_bai:        { label: "Thất bại",         color: "text-red-700    bg-red-50    border-red-300"     },
};

const STATUS_FILTERS = [
  { id: "all",             label: "Tất cả"       },
  { id: "cho_thanh_toan",  label: "Chờ thanh toán"},
  { id: "cho_xac_nhan",    label: "Chờ xác nhận" },
  { id: "dang_xu_ly",      label: "Đang xử lý"   },
  { id: "cho_lay_hang",    label: "Chờ lấy hàng" },
  { id: "dang_giao",       label: "Đang giao"    },
  { id: "da_giao",         label: "Đã giao"      },
  { id: "da_huy",          label: "Đã huỷ"       },
  { id: "hoan_tien",       label: "Hoàn tiền"    },
];

const _fVND  = (n) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n ?? 0);
const _fDate = (d) => d ? new Date(d).toLocaleDateString("vi-VN") : "—";

export default function OrderHistoryTab() {
  const navigate = _useNav();
  const { orders, meta, loading, page, setPage, cancelOrder, repayOrder } = useOrders();

  // lọc ở client — tránh phụ thuộc vào API status param
  const [activeFilter, setActiveFilter] = _us2("all");
  const [expanded,     setExpanded]     = _us2(null);
  const [reviewing,    setReviewing]    = _us2(null);
  const [cancelling,   setCancelling]   = _us2(null);

  const displayed = activeFilter === "all"
    ? orders
    : orders.filter((o) => o.trang_thai_don_hang === activeFilter);

  const handleCancel = async (id, reason) => {
    await cancelOrder(id, reason);
    setCancelling(null);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold text-gray-900">Đơn hàng của tôi</h2>
        <p className="text-sm text-gray-500 mt-0.5">Theo dõi và quản lý các đơn hàng đã đặt</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => { setActiveFilter(f.id); setExpanded(null); }}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all border-2
              ${activeFilter === f.id
                ? "bg-[#e8175d] text-white border-[#e8175d] shadow"
                : "bg-white text-gray-600 border-gray-200 hover:border-[#e8175d] hover:text-[#e8175d]"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <TabSkeleton rows={3} />
      ) : displayed.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200
          flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
          <span className="text-5xl">📦</span>
          <p className="font-semibold">Không có đơn hàng nào</p>
          <button onClick={() => navigate("/shop")} className="text-sm text-[#e8175d] font-bold hover:underline">
            Mua sắm ngay →
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {displayed.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              expanded={expanded === order.id}
              onToggle={() => setExpanded(expanded === order.id ? null : order.id)}
              onCancel={() => setCancelling(order.id)}
              onReview={() => setReviewing(order.id)}
              onRepay={() => repayOrder(order.id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-xl text-sm font-bold transition-all
                ${p === page
                  ? "bg-[#e8175d] text-white shadow"
                  : "bg-white text-gray-600 hover:bg-pink-50 shadow-sm"}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {reviewing  && (
        <ReviewModal
          order={orders.find((o) => o.id === reviewing)}
          onClose={() => setReviewing(null)}
        />
      )}
      {cancelling && (
        <CancelModal
          onConfirm={(r) => handleCancel(cancelling, r)}
          onClose={() => setCancelling(null)}
        />
      )}
    </div>
  );
}

function OrderCard({ order, expanded, onToggle, onCancel, onReview, onRepay }) {
  const st = ORDER_STATUS_MAP[order.trang_thai_don_hang] ?? {
    label: order.trang_thai_don_hang,
    color: "text-gray-600 bg-gray-50 border-gray-200",
  };
  const canCancel = ["cho_xac_nhan", "cho_lay_hang", "cho_thanh_toan"].includes(order.trang_thai_don_hang);
  const canReview = order.trang_thai_don_hang === "giao_thanh_cong";
  const canRepay  = order.trang_thai_thanh_toan === "cho_thanh_toan" && order.phuong_thuc_thanh_toan === "zalopay" && order.trang_thai_don_hang !== "da_huy";

  let label = st.label;
  let color = st.color;

  if (order.giao_hang?.sub_status === 'cho_giao_lai') {
    label = `Giao lại (Lần ${order.giao_hang.so_lan_giao_lai}/3)`;
    color = "text-yellow-700 bg-yellow-50 border-yellow-300";
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:border-pink-100 transition-colors">
      <div className="px-5 py-4 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <p className="font-extrabold text-gray-800 text-sm">{order.ma_don_hang}</p>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${color}`}>
              {label}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
            <span>🏪 {order.ten_cua_hang}</span>
            <span>📅 {_fDate(order.created_at)}</span>
            <span>💳 {order.phuong_thuc_thanh_toan === "cod" ? "COD" : (order.phuong_thuc_thanh_toan ?? "—")}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <p className="text-lg font-black text-[#e8175d]">{_fVND(order.tong_tien)}</p>
          <div className="flex gap-2">
            {canCancel && (
              <button
                onClick={onCancel}
                className="text-xs font-bold text-gray-500 border border-gray-200
                  px-3 py-1.5 rounded-lg hover:border-red-300 hover:text-red-500 transition-all active:scale-95"
              >
                Huỷ đơn
              </button>
            )}
            {canReview && (
              <button
                onClick={onReview}
                className="text-xs font-bold text-[#e8175d] border border-[#e8175d]/30
                  bg-pink-50 px-3 py-1.5 rounded-lg hover:bg-[#e8175d] hover:text-white transition-all active:scale-95
                  flex items-center gap-1"
              >
                <_Star size={11} /> Đánh giá
              </button>
            )}
            {canRepay && (
              <button
                onClick={onRepay}
                className="text-xs font-bold text-white bg-blue-500 hover:bg-blue-600
                  px-3 py-1.5 rounded-lg shadow-sm transition-all active:scale-95 flex items-center gap-1"
              >
                <CreditCard size={12} /> Thanh toán ngay
              </button>
            )}
            <button
              onClick={onToggle}
              className="text-xs font-bold text-gray-500 border border-gray-200
                px-3 py-1.5 rounded-lg hover:border-gray-300 transition-all flex items-center gap-1"
            >
              {expanded ? <><ChevronUp size={12} /> Ẩn</> : <><ChevronDown size={12} /> Chi tiết</>}
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 space-y-4">
          <div className="space-y-3">
            {(order.chi_tiet ?? []).map((item) => (
              <div key={item.id} className="flex gap-3 items-center">
                <div className="w-14 h-16 rounded-xl overflow-hidden bg-gray-200 shrink-0">
                  {item.hinh_anh && (
                    <img src={item.hinh_anh} alt={item.ten_san_pham} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 line-clamp-1">{item.ten_san_pham}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{_fVND(item.don_gia)} × {item.so_luong}</p>
                </div>
                <p className="text-sm font-extrabold text-gray-700 shrink-0">{_fVND(item.thanh_tien)}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl p-4 space-y-2 text-sm border border-gray-100">
            <div className="flex justify-between">
              <span className="text-gray-500">Tạm tính</span>
              <span className="font-bold text-gray-700">{_fVND(order.tam_tinh)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Phí ship</span>
              <span className="font-bold text-gray-700">{_fVND(order.phi_giao_hang)}</span>
            </div>
            {order.giam_gia > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Giảm giá</span>
                <span className="font-bold text-green-600">-{_fVND(order.giam_gia)}</span>
              </div>
            )}
            <div className="border-t border-dashed border-gray-200 pt-2 flex justify-between">
              <span className="font-extrabold text-gray-800">Tổng cộng</span>
              <span className="font-black text-[#e8175d] text-base">{_fVND(order.tong_tien)}</span>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            <span className="font-bold text-gray-600">Địa chỉ: </span>
            {order.ten_nguoi_nhan} · {order.so_dien_thoai_nguoi_nhan} · {order.dia_chi_nhan}
          </p>

          {order.giao_hang?.ma_van_don && (
            <p className="text-xs text-gray-500">
              <span className="font-bold text-gray-600">Mã vận đơn: </span>
              {order.giao_hang.ma_van_don}
            </p>
          )}

          {order.ly_do_huy && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-xs text-red-600">
              <span className="font-bold">Lý do huỷ: </span>{order.ly_do_huy}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ReviewModal({ order, onClose }) {
  const [stars,   setStars]   = _us2(5);
  const [comment, setComment] = _us2("");
  const [sent,    setSent]    = _us2(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => { setSent(false); onClose(); }, 1500);
  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-extrabold text-gray-900">⭐ Đánh giá đơn hàng</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
            <_X size={15} className="text-gray-600" />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-5">
          Đơn hàng <strong className="text-gray-700">{order?.ma_don_hang}</strong>
        </p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Đánh giá của bạn</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} type="button" onClick={() => setStars(s)} className="transition-transform hover:scale-110 active:scale-95">
                  <_Star size={32} className={s <= stars ? "text-yellow-400 fill-yellow-400" : "text-gray-200"} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Nhận xét</label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm outline-none
                focus:border-[#e8175d] focus:ring-2 focus:ring-pink-100 transition-all resize-none"
              placeholder="Chia sẻ trải nghiệm của bạn..."
            />
          </div>
          <button
            type="submit"
            disabled={sent}
            className="w-full py-3.5 bg-[#e8175d] hover:bg-[#c0114d] text-white font-extrabold
              rounded-2xl shadow active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {sent ? "✓ Đã gửi!" : <><Send size={15} /> Gửi đánh giá</>}
          </button>
        </form>
      </div>
    </div>
  );
}

function CancelModal({ onConfirm, onClose }) {
  const [reason, setReason] = _us2("");
  const REASONS = [
    "Đặt nhầm sản phẩm",
    "Muốn đổi địa chỉ giao hàng",
    "Tìm thấy giá rẻ hơn",
    "Không còn nhu cầu",
    "Lý do khác",
  ];
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-extrabold text-gray-900">Huỷ đơn hàng</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
            <_X size={15} className="text-gray-600" />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-5">Vui lòng chọn lý do huỷ đơn:</p>
        <div className="space-y-2 mb-5">
          {REASONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setReason(r)}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all
                ${reason === r
                  ? "border-[#e8175d] bg-pink-50 text-[#e8175d]"
                  : "border-gray-200 text-gray-600 hover:border-pink-200"}`}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border-2 border-gray-200 rounded-2xl font-bold text-gray-600 hover:border-gray-300 active:scale-95 transition-all text-sm"
          >
            Quay lại
          </button>
          <button
            disabled={!reason}
            onClick={() => onConfirm(reason)}
            className="flex-1 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed
              text-white font-extrabold rounded-2xl shadow active:scale-95 transition-all text-sm"
          >
            Xác nhận huỷ
          </button>
        </div>
      </div>
    </div>
  );
}

function TabSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-5 h-24 border border-gray-100" />
      ))}
    </div>
  );
}