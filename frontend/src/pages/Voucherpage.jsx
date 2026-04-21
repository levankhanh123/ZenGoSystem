
import { useState, useEffect, useCallback } from "react";
import { Tag, Copy, Check, Clock, Search, X, ChevronLeft, ChevronRight, AlertCircle, Ticket } from "lucide-react";
import ApiService from "../services/api";



// ── helpers ──────────────────────────────────────────────────────
const formatVND = (n) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const formatDate = (str) => {
  const d = new Date(str);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${d.getFullYear()}`;
};

const timeLeft = (endStr) => {
  const diff = new Date(endStr) - Date.now();
  if (diff <= 0) return "Đã hết hạn";
  const days = Math.floor(diff / 86400000);
  const hrs  = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `Còn ${days} ngày`;
  if (hrs > 0)  return `Còn ${hrs} giờ`;
  return "Sắp hết hạn";
};

const LOAI_LABEL = {
  giam_phan_tram: "% Giảm",
  giam_co_dinh:   "Giảm cố định",
  mien_phi_ship:  "Freeship",
};

const LOAI_COLOR = {
  giam_phan_tram: { bg: "#fff1f5", text: "#e8175d", border: "#fda4c0" },
  giam_co_dinh:   { bg: "#f0fdf4", text: "#16a34a", border: "#86efac" },
  mien_phi_ship:  { bg: "#eff6ff", text: "#2563eb", border: "#93c5fd" },
};

// ── useFetchVouchers hook ─────────────────────────────────────────
function useFetchVouchers({ loai, q, page }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = { page, per_page: 12 };
    if (loai) params.loai = loai;
    if (q)    params.q = q;

    ApiService.getVouchers(params)
      .then((res) => { setData(res); setLoading(false); })
      .catch(() => setLoading(false));
  }, [loai, q, page]);

  return { data, loading };
}

// ── VoucherCard ───────────────────────────────────────────────────
function VoucherCard({ voucher, onCopy, copied, onSelect, selectable, isUser }) {
  const color  = LOAI_COLOR[voucher.loai] ?? LOAI_COLOR.co_dinh;
  const pct    = Math.round((voucher.so_luong_con_lai / voucher.so_luong_voucher) * 100);
  const urgent = voucher.so_luong_con_lai <= 10;
  const tl     = timeLeft(voucher.thoi_gian_ket_thuc);
  const expired = tl === "Đã hết hạn";

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        border: `1.5px solid ${color.border}`,
        overflow: "hidden",
        opacity: expired ? 0.55 : 1,
        display: "flex",
        flexDirection: "column",
        transition: "box-shadow .15s, transform .15s",
      }}
      className="voucher-card"
    >
      {/* Top colored strip */}
      <div style={{
        background: color.bg,
        borderBottom: `1px dashed ${color.border}`,
        padding: "14px 16px",
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
      }}>
        {/* Icon */}
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: color.text + "18",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <Ticket size={22} style={{ color: color.text }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Badge loại */}
          <span style={{
            fontSize: 10, fontWeight: 700,
            background: color.text + "18",
            color: color.text,
            border: `1px solid ${color.border}`,
            borderRadius: 6, padding: "2px 7px",
            textTransform: "uppercase", letterSpacing: "0.04em",
          }}>
            {LOAI_LABEL[voucher.loai] ?? voucher.loai}
          </span>

          <p style={{ fontWeight: 800, fontSize: 15, color: "#1a1a1a", margin: "5px 0 2px", lineHeight: 1.3 }}>
            {voucher.ten_voucher}
          </p>

          {/* Giá trị */}
          <p style={{ fontSize: 13, color: color.text, fontWeight: 700, margin: 0 }}>
            {voucher.loai === "giam_phan_tram"
              ? `Giảm ${voucher.gia_tri_voucher}%${voucher.giam_toi_da > 0 ? ` (tối đa ${formatVND(voucher.giam_toi_da)})` : ""}`
              : voucher.loai === "mien_phi_ship"
              ? "Miễn phí vận chuyển"
              : `Giảm ${formatVND(voucher.gia_tri_voucher)}`}
          </p>
        </div>
      </div>

      {/* Bottom info */}
      <div style={{ padding: "12px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        {voucher.mo_ta && (
          <p style={{ fontSize: 12, color: "#6b7280", margin: 0, lineHeight: 1.5 }}>
            {voucher.mo_ta}
          </p>
        )}

        {/* Đơn tối thiểu */}
        {voucher.gia_tri_don_toi_thieu > 0 && (
          <p style={{ fontSize: 12, color: "#374151", margin: 0 }}>
            Đơn tối thiểu: <b>{formatVND(voucher.gia_tri_don_toi_thieu)}</b>
          </p>
        )}

        {/* Thời gian */}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <Clock size={12} style={{ color: expired ? "#ef4444" : "#9ca3af", flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: expired ? "#ef4444" : "#9ca3af" }}>
            HSD: {formatDate(voucher.thoi_gian_ket_thuc)} · <b style={{ color: expired ? "#ef4444" : "#6b7280" }}>{tl}</b>
          </span>
        </div>

        {/* Progress bar số lượng */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: urgent ? "#ef4444" : "#9ca3af" }}>
              {urgent ? "⚡ Sắp hết!" : "Còn lại"}
            </span>
            <span style={{ fontSize: 11, color: "#374151", fontWeight: 600 }}>
              {voucher.so_luong_con_lai}/{voucher.so_luong_voucher}
            </span>
          </div>
          <div style={{ background: "#f3f4f6", borderRadius: 99, height: 5, overflow: "hidden" }}>
            <div style={{
              width: `${pct}%`, height: "100%", borderRadius: 99,
              background: pct > 50 ? color.text : pct > 20 ? "#f59e0b" : "#ef4444",
              transition: "width .3s",
            }} />
          </div>
        </div>

        {/* Mã voucher + nút */}
        <div style={{
          display: "flex", gap: 8, alignItems: "center", marginTop: 4,
        }}>
          {/* Mã */}
          <div style={{
            flex: 1, background: "#f9fafb", border: "1.5px dashed #d1d5db",
            borderRadius: 8, padding: "6px 10px", display: "flex",
            alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 14, color: "#111", letterSpacing: "0.08em" }}>
              {voucher.ma_voucher}
            </span>
          </div>

          {/* Nút copy / chọn */}
          {selectable ? (
            <button
              onClick={() => onSelect(voucher)}
              disabled={expired}
              style={{
                padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                background: color.text, color: "#fff", fontWeight: 700, fontSize: 12,
                flexShrink: 0, transition: "opacity .15s",
              }}
            >
              Dùng ngay
            </button>
          ) : (
            <button
              onClick={() => !expired && onCopy(voucher.ma_voucher)}
              disabled={expired}
              title={isUser ? "Copy mã" : "Đăng nhập để lấy mã"}
              style={{
                width: 38, height: 38, borderRadius: 8,
                border: `1.5px solid ${copied === voucher.ma_voucher ? "#16a34a" : color.border}`,
                background: copied === voucher.ma_voucher ? "#f0fdf4" : color.bg,
                color: copied === voucher.ma_voucher ? "#16a34a" : color.text,
                cursor: expired ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, transition: "all .2s",
              }}
            >
              {copied === voucher.ma_voucher ? <Check size={16} /> : <Copy size={15} />}
            </button>
          )}
        </div>

        {/* Gợi ý đăng nhập nếu chưa login */}
        {!isUser && !selectable && (
          <p style={{ fontSize: 11, color: "#9ca3af", margin: 0, textAlign: "right" }}>
            Đăng nhập để copy mã
          </p>
        )}
      </div>
    </div>
  );
}

// ── VoucherGrid (shared UI) ───────────────────────────────────────
export function VoucherGrid({
  selectable = false,   // true khi dùng trong checkout picker
  onSelect,             // callback khi chọn voucher
  orderTotal = 0,       // để filter voucher không đủ điều kiện
}) {
  // Giả sử check login từ localStorage token (tuỳ auth setup của bạn)
  const isUser = !!localStorage.getItem("token");

  const [q, setQ]           = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage]     = useState(1);
  const [copied, setCopied] = useState(null);

  const { data, loading } = useFetchVouchers({ loai: "", q: search, page });

  const handleCopy = useCallback((code) => {
    if (!isUser) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(code);
      setTimeout(() => setCopied(null), 2000);
    });
  }, [isUser]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(q);
  };

  const vouchers = data?.data ?? [];
  const meta     = data;

  return (
    <div>
      {/* Filter bar */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20, alignItems: "center" }}>
        {/* Search */}
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 6, flex: "1 1 200px" }}>
          <div style={{
            flex: 1, display: "flex", alignItems: "center", gap: 8,
            background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "0 12px",
          }}>
            <Search size={13} style={{ color: "#9ca3af", flexShrink: 0 }} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm mã hoặc tên voucher..."
              style={{
                flex: 1, border: "none", outline: "none", fontSize: 13,
                padding: "8px 0", background: "transparent", color: "#374151",
              }}
            />
            {q && (
              <button type="button" onClick={() => { setQ(""); setSearch(""); setPage(1); }}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 0 }}>
                <X size={13} style={{ color: "#9ca3af" }} />
              </button>
            )}
          </div>
          <button type="submit" style={{
            background: "#e8175d", color: "#fff", border: "none",
            borderRadius: 10, padding: "0 14px", fontSize: 13, fontWeight: 700,
            cursor: "pointer",
          }}>Tìm</button>
        </form>

        {meta && (
          <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: "auto" }}>
            <b style={{ color: "#374151" }}>{meta.total}</b> voucher
          </span>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <SkeletonGrid />
      ) : vouchers.length === 0 ? (
        <EmptyVouchers />
      ) : (
        <>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 16,
          }}>
            {vouchers.map((v) => (
              <VoucherCard
                key={v.id}
                voucher={v}
                onCopy={handleCopy}
                copied={copied}
                onSelect={onSelect}
                selectable={selectable}
                isUser={isUser}
              />
            ))}
          </div>

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <PaginationBar meta={meta} page={page} setPage={setPage} />
          )}
        </>
      )}

      {/* Toast copy */}
      {copied && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: "#111", color: "#fff", borderRadius: 10, padding: "10px 20px",
          fontSize: 13, fontWeight: 600, zIndex: 9999, display: "flex", alignItems: "center", gap: 8,
          boxShadow: "0 4px 20px rgba(0,0,0,.25)",
        }}>
          <Check size={15} style={{ color: "#4ade80" }} /> Đã copy: <code style={{ color: "#f9a8d4" }}>{copied}</code>
        </div>
      )}
    </div>
  );
}

// ── VoucherPicker  (Modal dùng trong Checkout) ────────────────────
export function VoucherPicker({ open, onClose, onSelect, orderTotal = 0 }) {
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fdf5f0", borderRadius: "20px 20px 0 0",
          width: "100%", maxWidth: 700,
          maxHeight: "85vh", overflow: "hidden",
          display: "flex", flexDirection: "column",
          boxShadow: "0 -8px 40px rgba(0,0,0,.15)",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "16px 20px", borderBottom: "1px solid #fde4ec",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "#fff",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Tag size={18} style={{ color: "#e8175d" }} />
            <span style={{ fontWeight: 800, fontSize: 16, color: "#1a1a1a" }}>Chọn mã giảm giá</span>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 8,
          }}>
            <X size={18} style={{ color: "#6b7280" }} />
          </button>
        </div>

        {/* Order total hint */}
        {orderTotal > 0 && (
          <div style={{
            padding: "10px 20px",
            background: "#fff8f0",
            borderBottom: "1px solid #fde4ec",
            fontSize: 13, color: "#92400e",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <AlertCircle size={14} />
            Đơn hàng của bạn: <b>{formatVND(orderTotal)}</b> · Chỉ hiển thị voucher đủ điều kiện
          </div>
        )}

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          <VoucherGrid selectable onSelect={onSelect} orderTotal={orderTotal} />
        </div>
      </div>
    </div>
  );
}

// ── Trang /voucher ────────────────────────────────────────────────
export default function VoucherPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#fdf5f0" }}>
      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #e8175d 0%, #ff6b6b 100%)",
        padding: "40px 24px 48px",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🎟️</div>
          <h1 style={{ color: "#fff", fontWeight: 900, fontSize: 28, margin: "0 0 8px" }}>
            Kho mã giảm giá
          </h1>
          <p style={{ color: "#ffd6e4", fontSize: 14, margin: 0 }}>
            Copy mã và dán vào trang thanh toán để được giảm giá ngay
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 20px" }}>
        <VoucherGrid />
      </div>
    </div>
  );
}

// ── Skeletons & Empty ─────────────────────────────────────────────
function SkeletonGrid() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{
          background: "#fff", borderRadius: 16, border: "1.5px solid #f3f4f6",
          overflow: "hidden", animation: "pulse 1.4s ease-in-out infinite",
        }}>
          <div style={{ height: 90, background: "#fdf2f5" }} />
          <div style={{ padding: 16 }}>
            <div style={{ height: 12, background: "#f3f4f6", borderRadius: 6, marginBottom: 10 }} />
            <div style={{ height: 10, background: "#f3f4f6", borderRadius: 6, width: "60%", marginBottom: 16 }} />
            <div style={{ height: 36, background: "#f3f4f6", borderRadius: 8 }} />
          </div>
        </div>
      ))}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.55}}`}</style>
    </div>
  );
}

function EmptyVouchers() {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{
        width: 64, height: 64, borderRadius: 16,
        background: "#fff0f5", margin: "0 auto 12px",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Ticket size={28} style={{ color: "#fca5c0" }} />
      </div>
      <p style={{ color: "#9ca3af", fontWeight: 500, fontSize: 14, margin: 0 }}>
        Không có voucher nào.
      </p>
    </div>
  );
}

function PaginationBar({ meta, page, setPage }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 28 }}>
      <PBtn onClick={() => setPage(page - 1)} disabled={page === 1} label={<ChevronLeft size={16} />} />
      {Array.from({ length: meta.last_page }, (_, i) => i + 1)
        .filter((p) => p === 1 || p === meta.last_page || Math.abs(p - page) <= 2)
        .reduce((acc, p, i, arr) => { if (i > 0 && p - arr[i-1] > 1) acc.push("..."); acc.push(p); return acc; }, [])
        .map((p, i) =>
          p === "..." ? (
            <span key={`d${i}`} style={{ color: "#9ca3af", alignSelf: "center", fontSize: 13 }}>…</span>
          ) : (
            <PBtn key={p} onClick={() => setPage(p)} active={p === page} label={p} />
          )
        )}
      <PBtn onClick={() => setPage(page + 1)} disabled={page === meta.last_page} label={<ChevronRight size={16} />} />
    </div>
  );
}

function PBtn({ onClick, disabled, active, label }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: 36, height: 36, borderRadius: 10, border: "none", cursor: disabled ? "not-allowed" : "pointer",
      background: active ? "#e8175d" : "#fff",
      color: active ? "#fff" : "#374151",
      fontWeight: active ? 700 : 400, fontSize: 13,
      opacity: disabled ? 0.35 : 1,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 1px 3px rgba(0,0,0,.08)", transition: "all .15s",
    }}>{label}</button>
  );
}