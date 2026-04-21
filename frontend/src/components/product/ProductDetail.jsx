import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ShoppingCart, Star, Package, Weight, Tag, ChevronLeft,
  Minus, Plus, Store, ShieldCheck, RotateCcw,
  AlertCircle, CheckCircle2, Lock,
} from "lucide-react";
import { useCart } from "../../contexts/CartContext.jsx";
import ApiService from "../../services/api.js";


const getToken = () => localStorage.getItem("token");

function formatVND(number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(number);
}

export default function ProductDetail() {
  const { shopId, productId } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState("mo_ta"); // mo_ta | danh_gia

  // ── Review state ──────────────────────────────────────
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState(null); // { type: 'success'|'error', text }

  // Đơn hàng đủ điều kiện đánh giá
  const [eligibleOrder, setEligibleOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  // ── Fetch sản phẩm ────────────────────────────────────
  // Fetch sản phẩm
  useEffect(() => {
    setLoading(true);
    ApiService.getProductById(productId)
      .then((data) => { setProduct(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [productId]);

  // ── Khi chuyển sang tab đánh giá ─────────────────────
  useEffect(() => {
    if (tab !== "danh_gia") return;

    setLoadingReviews(true);
    ApiService.getReviews(productId)
      .then((data) => { setReviews(Array.isArray(data) ? data : []); setLoadingReviews(false); })
      .catch(() => setLoadingReviews(false));

    const token = localStorage.getItem("token");
    if (!token) return;

    setLoadingOrder(true);
    ApiService.getOrders()
      .then((res) => {
        const orders = Array.isArray(res) ? res : (res.data ?? []);
        const delivered = orders.filter((o) => o.trang_thai_don_hang === "da_giao");
        let found = null;
        for (const order of delivered) {
          const items = order.chi_tiet_don_hang ?? order.items ?? [];
          const hasProduct = items.some(
            (item) =>
              String(item.san_pham_id) === String(productId) ||
              String(item.product_id) === String(productId)
          );
          if (hasProduct) { found = order; break; }
        }
        setEligibleOrder(found);
        setLoadingOrder(false);
      })
      .catch(() => setLoadingOrder(false));
  }, [tab, productId]);

  // ── Kiểm tra đã đánh giá chưa ────────────────────────
  useEffect(() => {
    if (!eligibleOrder || !reviews.length) { setAlreadyReviewed(false); return; }
    setAlreadyReviewed(
      reviews.some((r) => String(r.don_hang_id) === String(eligibleOrder.id))
    );
  }, [eligibleOrder, reviews]);

  // ─────────────────────────────────────────────────────
  if (loading) return <LoadingSkeleton />;
  if (!product) return <NotFound />;

  const images = product.hinh_anh_san_pham?.length
    ? product.hinh_anh_san_pham.map((i) => i.duong_dan_anh)
    : [product.hinh_dai_dien];

  const stock = product.so_luong_ton - (product.so_luong_tam_giu ?? 0);
  const inStock = stock > 0;

  const handleAddToCart = () => {
    addItem(
      {
        id: product.id,
        name: product.ten_san_pham,
        price: product.gia,
        image: product.hinh_dai_dien,
        shopId: product.cua_hang?.id,
        shopName: product.cua_hang?.ten_cua_hang,
      },
      quantity
    );
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/gio-hang");
  };

  // ── Submit đánh giá ───────────────────────────────────
  const handleSubmitReview = async () => {
    if (!eligibleOrder) return;
    if (!content.trim()) {
      setSubmitMsg({ type: "error", text: "Vui lòng nhập nội dung đánh giá." });
      return;
    }
    setSubmitting(true);
    setSubmitMsg(null);
    try {
      const data = await ApiService.submitReview({
        don_hang_id: eligibleOrder.id,
        san_pham_id: product.id,
        so_sao: rating,
        noi_dung: content,
      });
      setContent("");
      setRating(5);
      setReviews((prev) => [data.data, ...prev]);
      setAlreadyReviewed(true);
      setSubmitMsg({ type: "success", text: "Gửi đánh giá thành công! Cảm ơn bạn." });
    } catch (err) {
      setSubmitMsg({ type: "error", text: err.response?.data?.message ?? err.message });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render form đánh giá ──────────────────────────────
  const renderReviewForm = () => {
    if (!getToken()) {
      return (
        <div className="flex items-center gap-3 border border-dashed border-gray-200 rounded-2xl p-4 mb-6">
          <Lock size={16} className="text-[#e8175d] shrink-0" />
          <p className="text-sm text-gray-500">
            Bạn cần{" "}
            <button onClick={() => navigate("/login")} className="text-[#e8175d] font-semibold underline underline-offset-2">
              đăng nhập
            </button>{" "}
            để viết đánh giá.
          </p>
        </div>
      );
    }

    if (loadingOrder) {
      return <p className="text-sm text-gray-400 italic mb-6">Đang kiểm tra điều kiện đánh giá...</p>;
    }

    if (!eligibleOrder) {
      return (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
          <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700">
            Bạn chỉ có thể đánh giá sau khi đã <strong>nhận hàng thành công</strong> từ đơn hàng chứa sản phẩm này.
          </p>
        </div>
      );
    }

    if (alreadyReviewed) {
      return (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
          <CheckCircle2 size={16} className="text-green-500 shrink-0" />
          <p className="text-sm text-green-700">Bạn đã đánh giá sản phẩm này. Cảm ơn bạn đã phản hồi!</p>
        </div>
      );
    }

    return (
      <div className="border border-gray-100 rounded-2xl p-6 bg-[#fdf5f0] mb-6">
        <p className="text-sm font-semibold text-gray-800 mb-4">Viết đánh giá của bạn</p>

        {/* Stars */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-gray-500">Chất lượng:</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} onClick={() => setRating(s)} type="button">
                <Star
                  size={22}
                  className={
                    s <= rating
                      ? "text-yellow-400 fill-yellow-400 transition-colors"
                      : "text-gray-300 transition-colors hover:text-yellow-300"
                  }
                />
              </button>
            ))}
          </div>
          <span className="text-sm font-medium text-yellow-600">
            {["", "Rất tệ", "Tệ", "Bình thường", "Tốt", "Xuất sắc"][rating]}
          </span>
        </div>

        {/* Textarea */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 resize-none bg-white"
          placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
        />

        {/* Feedback message */}
        {submitMsg && (
          <div className={`flex items-center gap-2 mt-3 text-sm rounded-xl px-4 py-2.5 ${
            submitMsg.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-600 border border-red-200"
          }`}>
            {submitMsg.type === "success" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            {submitMsg.text}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-gray-400">Đánh giá cho đơn hàng #{eligibleOrder.id}</p>
          <button
            onClick={handleSubmitReview}
            disabled={submitting}
            className="px-5 py-2.5 bg-[#e8175d] hover:bg-[#c0114d] text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Đang gửi..." : "Gửi đánh giá"}
          </button>
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#fdf5f0]">
      {/* ── Breadcrumb ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#e8175d] transition-colors"
        >
          <ChevronLeft size={15} />
          Quay lại
        </button>
      </div>

      {/* ── Main ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

            {/* ── LEFT: Images ── */}
            <div className="p-6 lg:p-10 flex flex-col gap-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50">
                <img
                  src={images[activeImg]}
                  alt={product.ten_san_pham}
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
                {product.sold > 10 && (
                  <span className="absolute top-4 left-4 bg-[#e8175d] text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                    HOT
                  </span>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                        activeImg === i
                          ? "border-[#e8175d] shadow-md scale-105"
                          : "border-transparent hover:border-pink-200"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── RIGHT: Info ── */}
            <div className="p-6 lg:p-10 flex flex-col gap-5 border-l border-gray-50">

              {/* Category + SKU */}
              <div className="flex items-center gap-2 flex-wrap">
                {product.danh_muc && (
                  <span className="text-xs font-medium bg-pink-50 text-[#e8175d] px-3 py-1 rounded-full">
                    {product.danh_muc.ten_danh_muc}
                  </span>
                )}
                {product.sku && (
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Tag size={11} /> SKU: {product.sku}
                  </span>
                )}
              </div>

              {/* Name */}
              <h1 className="text-2xl font-extrabold text-[#2d1b1b] leading-snug">
                {product.ten_san_pham}
              </h1>

              {/* Rating + Sold */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={14}
                      className={
                        s <= Math.round(product.rating ?? 0)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-200 fill-gray-200"
                      }
                    />
                  ))}
                  <span className="ml-1 font-semibold text-gray-700">
                    {Number(product.rating ?? 0).toFixed(1)}
                  </span>
                  <span className="text-gray-400">
                    ({reviews.length > 0 ? reviews.length : (product.review_count ?? 0)} đánh giá)
                  </span>
                </div>
                <span className="text-gray-300">|</span>
                <span className="text-gray-500">
                  🔥 <strong className="text-gray-700">{product.sold ?? 0}</strong> đã bán
                </span>
              </div>

              {/* Price */}
              <div className="bg-[#fdf5f0] rounded-2xl px-5 py-4 flex items-end gap-3">
                <span className="text-4xl font-black text-[#e8175d]">
                  {formatVND(product.gia)}
                </span>
              </div>

              {/* Stock */}
              <div className="flex items-center gap-2 text-sm">
                <Package size={14} className={inStock ? "text-green-500" : "text-red-400"} />
                {inStock ? (
                  <span className="text-green-600 font-medium">
                    Còn hàng{" "}
                    <span className="text-gray-400 font-normal">({stock} sản phẩm)</span>
                  </span>
                ) : (
                  <span className="text-red-500 font-medium">Hết hàng</span>
                )}
                {product.khoi_luong && (
                  <>
                    <span className="text-gray-200 mx-1">|</span>
                    <Weight size={14} className="text-gray-400" />
                    <span className="text-gray-500">{product.khoi_luong}g</span>
                  </>
                )}
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 w-20">Số lượng</span>
                <div className="flex items-center gap-0 border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-pink-50 text-gray-600 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-gray-800">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                    disabled={!inStock}
                    className="w-10 h-10 flex items-center justify-center hover:bg-pink-50 text-gray-600 transition-colors disabled:opacity-30"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className="flex-1 flex items-center justify-center gap-2 border-2 border-[#e8175d] text-[#e8175d]
                    font-bold py-3.5 rounded-2xl hover:bg-pink-50 active:scale-95 transition-all
                    disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                >
                  <ShoppingCart size={16} />
                  Thêm vào giỏ
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={!inStock}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#e8175d] hover:bg-[#c0114d]
                    text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-pink-200
                    active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                >
                  Mua ngay
                </button>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-50">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <ShieldCheck size={15} className="text-green-500 shrink-0" />
                  Thanh toán an toàn & bảo mật
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <RotateCcw size={15} className="text-blue-400 shrink-0" />
                  Đổi trả trong 7 ngày
                </div>
              </div>

              {/* Shop info */}
              {product.cua_hang && (
                <div
                  onClick={() => navigate(`/shop/${product.cua_hang.id}`)}
                  className="flex items-center gap-3 p-4 border border-gray-100 rounded-2xl
                    hover:border-pink-200 cursor-pointer transition-all group"
                >
                  {product.cua_hang.logo ? (
                    <img
                      src={product.cua_hang.logo}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover border border-gray-100"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                      <Store size={18} className="text-[#e8175d]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-[#e8175d] transition-colors truncate">
                      {product.cua_hang.ten_cua_hang}
                    </p>
                    {product.cua_hang.so_dien_thoai && (
                      <p className="text-xs text-gray-400">{product.cua_hang.so_dien_thoai}</p>
                    )}
                  </div>
                  <ChevronLeft size={14} className="text-gray-300 rotate-180 group-hover:text-[#e8175d] transition-colors" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Tabs: Mô tả / Đánh giá ── */}
        <div className="mt-6 bg-white rounded-3xl shadow-sm overflow-hidden">
          {/* Tab header */}
          <div className="flex border-b border-gray-100">
            {[
              { key: "mo_ta", label: "Mô tả sản phẩm" },
              { key: "danh_gia", label: `Đánh giá (${reviews.length > 0 ? reviews.length : (product.review_count ?? 0)})` },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-8 py-4 text-sm font-semibold border-b-2 transition-all ${
                  tab === t.key
                    ? "border-[#e8175d] text-[#e8175d]"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab body */}
          <div className="p-6 lg:p-10">
            {tab === "mo_ta" ? (
              <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                {product.mo_ta || (
                  <p className="text-gray-400 italic">Chưa có mô tả sản phẩm.</p>
                )}
              </div>
            ) : (
              <div>
                {/* Form viết đánh giá */}
                {renderReviewForm()}

                {/* Danh sách đánh giá */}
                {loadingReviews ? (
                  <p className="text-sm text-gray-400 text-center py-6">Đang tải đánh giá...</p>
                ) : (
                  <ReviewList reviews={reviews} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Review list ─────────────────────────────────────── */
function ReviewList({ reviews }) {
  if (!reviews.length)
    return (
      <div className="text-center py-10">
        <Star size={30} className="mx-auto mb-2 text-gray-200 fill-gray-200" />
        <p className="text-gray-400 italic text-sm">Chưa có đánh giá nào.</p>
      </div>
    );

  const avg = (reviews.reduce((s, r) => s + (r.so_sao ?? 0), 0) / reviews.length).toFixed(1);

  return (
    <div>
      {/* Tổng quan */}
      <div className="flex items-center gap-3 mb-6 p-4 bg-[#fdf5f0] rounded-2xl">
        <span className="text-4xl font-black text-[#e8175d]">{avg}</span>
        <div>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={15}
                className={s <= Math.round(avg) ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"} />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{reviews.length} đánh giá</p>
        </div>
      </div>

      {/* Danh sách */}
      <div className="flex flex-col divide-y divide-gray-50">
        {reviews.map((r) => (
          <div key={r.id} className="flex gap-4 py-5">
            {/* Avatar */}
            {r.nguoi_mua?.anh_dai_dien ? (
              <img
                src={r.nguoi_mua.anh_dai_dien}
                alt=""
                className="w-10 h-10 rounded-full object-cover border border-gray-100 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center shrink-0 text-sm font-bold text-[#e8175d]">
                {(r.nguoi_mua?.ho_ten ?? "?")[0].toUpperCase()}
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-center justify-between gap-3 mb-1 flex-wrap">
                <span className="text-sm font-semibold text-gray-800">
                  {r.nguoi_mua?.ho_ten ?? "Người dùng ẩn"}
                </span>
                {r.created_at && (
                  <span className="text-xs text-gray-400">
                    {new Date(r.created_at).toLocaleDateString("vi-VN")}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-0.5 mb-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={12}
                    className={s <= r.so_sao ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"} />
                ))}
              </div>
              {r.noi_dung && <p className="text-sm text-gray-600 leading-relaxed">{r.noi_dung}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Loading skeleton ── */
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#fdf5f0] p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl p-10 grid grid-cols-2 gap-10 animate-pulse">
        <div className="aspect-square bg-gray-100 rounded-2xl" />
        <div className="flex flex-col gap-4">
          <div className="h-4 bg-gray-100 rounded w-1/3" />
          <div className="h-8 bg-gray-100 rounded w-3/4" />
          <div className="h-8 bg-gray-100 rounded w-1/2" />
          <div className="h-16 bg-gray-100 rounded" />
          <div className="h-12 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen bg-[#fdf5f0] flex items-center justify-center">
      <p className="text-gray-400 text-lg">Không tìm thấy sản phẩm.</p>
    </div>
  );
}