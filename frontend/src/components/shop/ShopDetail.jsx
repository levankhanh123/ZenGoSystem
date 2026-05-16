import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft, Star, ShoppingBag, Package,
  Search, ShoppingCart, Store, SlidersHorizontal, X
} from "lucide-react";
import { useCart } from "../../contexts/CartContext.jsx";
import ApiService from "../../services/api.js";


function formatVND(number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(number);
}

const SORT_OPTIONS = [
  { value: "moi_nhat",  label: "Mới nhất" },
  { value: "ban_chay",  label: "Bán chạy" },
  { value: "gia_tang",  label: "Giá tăng dần" },
  { value: "gia_giam",  label: "Giá giảm dần" },
];

export default function ShopDetail() {
  const { shopId:id }      = useParams();
  const navigate    = useNavigate();

  const [data, setData]         = useState(null);   // { shop, categories, products }
  const [loading, setLoading]   = useState(true);
  const [prodLoading, setProdLoading] = useState(false);

  // Filters
  const [shopCategoryId, setShopCategoryId] = useState("");
  const [sort, setSort]             = useState("moi_nhat");
  const [q, setQ]                   = useState("");
  const [search, setSearch]         = useState("");
  const [page, setPage]             = useState(1);
  const [showFilter, setShowFilter] = useState(false);

  // Initial load (shop info + products)
  useEffect(() => {
    setLoading(true);
    fetchData(true);
  }, [id]);

  // Filter/page change => reload products only
  useEffect(() => {
    if (!data) return;
    fetchData(false);
  }, [shopCategoryId, sort, search, page]);

  const fetchData = (initial = false) => {
    const params = { sort, page, per_page: 12 };
    if (shopCategoryId) params.shop_category_id = shopCategoryId;
    if (search)     params.q = search;

    if (initial) setLoading(true);
    else         setProdLoading(true);

    ApiService.getShopDetail(id, params)
      .then((res) => {
        setData(res);
        setLoading(false);
        setProdLoading(false);
      })
      .catch(() => { setLoading(false); setProdLoading(false); });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(q);
  };

  const handleCategory = (catId) => {
    setShopCategoryId(catId === shopCategoryId ? "" : catId);
    setPage(1);
  };

  const handleSort = (val) => {
    setSort(val);
    setPage(1);
  };

  if (loading) return <LoadingSkeleton />;
  if (!data)   return <NotFound />;

  const { shop, categories, vouchers, products } = data;
  const meta = products;

  // Join Date calculation
  const getJoinDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const start = new Date(dateStr);
    const now = new Date();
    const diffMonths = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    if (diffMonths < 1) return "Tháng này";
    if (diffMonths < 12) return `${diffMonths} tháng trước`;
    const years = Math.floor(diffMonths / 12);
    return `${years} năm trước`;
  };

  const handleCollectVoucher = async (vId) => {
    try {
      await ApiService.collectVoucher(vId);
      // Refresh data to show collected state
      fetchData(true);
    } catch (err) {
      alert(err.response?.data?.message || "Không thể thu thập voucher");
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf5f0]">

      {/* ── Shop Header ── */}
      <div className="bg-gradient-to-br from-[#e8175d] to-[#ff6b6b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-8">

          {/* Back */}
          <button
            onClick={() => navigate("/shop")}
            className="flex items-center gap-1.5 text-pink-200 hover:text-white
              text-sm mb-6 transition-colors"
          >
            <ChevronLeft size={15} /> Tất cả cửa hàng
          </button>

          {/* Shop info */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            <div className="flex items-center gap-5 flex-1 min-w-0">
              {/* Logo */}
              {shop.logo ? (
                <img
                  src={shop.logo}
                  alt={shop.ten_cua_hang}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-4 border-white/30 shadow-2xl shrink-0"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white/20 backdrop-blur
                  flex items-center justify-center shrink-0 border-4 border-white/20">
                  <Store size={36} className="text-white" />
                </div>
              )}

              {/* Text */}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight mb-2">
                  {shop.ten_cua_hang}
                </h1>
                <div className="flex flex-wrap gap-x-4 gap-y-2 mb-3">
                  <p className="text-pink-100 text-sm flex items-center gap-1.5">
                    <span className="opacity-70">📅</span> Tham gia: {getJoinDate(shop.created_at)}
                  </p>
                  {shop.dia_chi_lay_hang && (
                    <p className="text-pink-100 text-sm flex items-center gap-1.5">
                      <span className="opacity-70">📍</span> {shop.dia_chi_lay_hang}
                    </p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button className="bg-white text-[#e8175d] px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-black/5 hover:bg-pink-50 transition-all active:scale-95">
                    + Theo dõi
                  </button>
                  {Number(shop.nguoi_ban_id) !== Number(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).id : 0) && (
                    <button 
                      onClick={() => {
                        const token = localStorage.getItem("token");
                        if (!token) {
                          navigate("/login");
                          return;
                        }
                        if (!shop.id) return;
                        window.dispatchEvent(new CustomEvent("open-chat", {
                          detail: { shopId: shop.id }
                        }));
                      }}
                      className="bg-white/20 backdrop-blur text-white border border-white/30 px-6 py-2 rounded-xl text-sm font-bold hover:bg-white/30 transition-all active:scale-95"
                    >
                      Chat ngay
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full lg:w-auto">
              <ShopStat icon={<Package size={16} />}     label="Sản phẩm" value={shop.so_san_pham} />
              <ShopStat icon={<ShoppingBag size={16} />} label="Đã bán"   value={shop.tong_don} />
              <ShopStat icon={<Star size={16} />}      label="Đánh giá" value={shop.rating_trung_binh > 0 ? shop.rating_trung_binh.toFixed(1) : "N/A"} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Vouchers Section ── */}
      {vouchers && vouchers.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 overflow-x-auto no-scrollbar">
          <div className="flex gap-4">
            {vouchers.map((v) => (
              <div key={v.id} className="min-w-[280px] bg-white border border-pink-100 rounded-2xl p-4 flex gap-3 shadow-sm">
                <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-[#e8175d] font-black text-lg">%</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 mb-0.5">Giảm {formatVND(v.gia_tri_voucher)}</p>
                  <p className="text-[11px] text-gray-400 mb-2 truncate">Đơn tối thiểu {formatVND(v.gia_tri_don_toi_thieu)}</p>
                  <button
                    onClick={() => !v.is_collected && handleCollectVoucher(v.id)}
                    className={`text-[10px] font-bold px-3 py-1 rounded-lg transition-all ${
                      v.is_collected 
                        ? "bg-gray-100 text-gray-400 cursor-default"
                        : "bg-[#e8175d] text-white hover:bg-[#c0114d]"
                    }`}
                  >
                    {v.is_collected ? "Đã lưu" : "Lưu mã"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── LEFT: Filter sidebar ── */}
          <aside className="lg:w-60 shrink-0">
            {/* Categories */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 mb-4 sticky top-4">
              <h4 className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-4">
                Danh mục của shop
              </h4>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => handleCategory("")}
                  className={`w-full text-left text-sm px-4 py-2.5 rounded-2xl transition-all
                    ${!shopCategoryId
                      ? "bg-[#e8175d] text-white font-bold shadow-lg shadow-pink-100"
                      : "text-gray-600 hover:bg-pink-50 hover:text-[#e8175d]"
                    }`}
                >
                  Tất cả sản phẩm
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleCategory(String(c.id))}
                    className={`w-full text-left text-sm px-4 py-2.5 rounded-2xl transition-all
                      ${shopCategoryId === String(c.id)
                        ? "bg-[#e8175d] text-white font-bold shadow-lg shadow-pink-100"
                        : "text-gray-600 hover:bg-pink-50 hover:text-[#e8175d]"
                      }`}
                  >
                    {c.ten_danh_muc}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* ── RIGHT: Products ── */}
          <div className="flex-1 min-w-0">
            {/* Tabs & Search */}
            <div className="bg-white rounded-3xl p-2 shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-2">
              <div className="flex p-1 bg-gray-50 rounded-2xl flex-1">
                {SORT_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => handleSort(o.value)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all
                      ${sort === o.value
                        ? "bg-white text-[#e8175d] shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                      }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              <form onSubmit={handleSearch} className="flex p-1 gap-1">
                <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 flex-1">
                  <Search size={14} className="text-gray-400" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Tìm trong shop..."
                    className="bg-transparent border-none outline-none py-2 text-xs w-full sm:w-32 lg:w-48"
                  />
                </div>
                <button className="bg-[#e8175d] text-white px-5 rounded-2xl text-xs font-bold hover:bg-[#c0114d]">
                  Tìm
                </button>
              </form>
            </div>

            {/* Grid */}
            {prodLoading ? (
              <ProductSkeletonGrid />
            ) : meta?.data?.length === 0 ? (
              <EmptyProducts />
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                  {(meta?.data ?? []).map((p, i) => (
                    <ProductCard key={p.id} product={p} shopId={id} index={i} />
                  ))}
                </div>

                {/* Pagination */}
                {meta && meta.last_page > 1 && (
                  <PaginationBar meta={meta} page={page} setPage={setPage} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ──

function ShopStat({ icon, label, value }) {
  return (
    <div className="flex flex-col items-center bg-white/20 backdrop-blur rounded-2xl px-4 py-3 min-w-[70px]">
      <div className="text-white/80 mb-0.5">{icon}</div>
      <span className="text-xl font-black text-white">{value}</span>
      <span className="text-[11px] text-pink-100">{label}</span>
    </div>
  );
}

function ProductCard({ product, shopId, index }) {
  const navigate   = useNavigate();
  const { addItem } = useCart();

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl
        cursor-pointer transition-all duration-200 hover:-translate-y-0.5 group flex flex-col"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <span className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded-lg">
              Hết hàng
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">
          {product.name}
        </p>

        {product.rating > 0 && (
          <div className="flex items-center gap-1">
            <Star size={10} className="text-yellow-400 fill-yellow-400" />
            <span className="text-xs text-gray-500">
              {product.rating} · {product.sold} đã bán
            </span>
          </div>
        )}

        <p className="text-base font-extrabold text-[#e8175d] mt-auto">
          {formatVND(product.price)}
        </p>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (product.stock > 0) {
              addItem({
                id: product.id, name: product.name,
                price: product.price, image: product.image,
                shopId, shopName: null,
              }, 1);
            }
          }}
          disabled={product.stock === 0}
          className="mt-1 w-full flex items-center justify-center gap-1.5
            bg-[#e8175d] hover:bg-[#c0114d] text-white text-xs font-bold
            py-2 rounded-xl active:scale-95 transition-all
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ShoppingCart size={12} />
          {product.stock > 0 ? "Thêm vào giỏ" : "Hết hàng"}
        </button>
      </div>
    </div>
  );
}

function PaginationBar({ meta, page, setPage }) {
  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <Btn onClick={() => setPage(page - 1)} disabled={page === 1} label="←" />
      {Array.from({ length: meta.last_page }, (_, i) => i + 1)
        .filter((p) => p === 1 || p === meta.last_page || Math.abs(p - page) <= 2)
        .reduce((acc, p, i, arr) => {
          if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
          acc.push(p);
          return acc;
        }, [])
        .map((p, i) =>
          p === "..." ? (
            <span key={`d${i}`} className="text-gray-400 text-sm px-1">…</span>
          ) : (
            <Btn key={p} onClick={() => setPage(p)} active={p === page} label={p} />
          )
        )}
      <Btn onClick={() => setPage(page + 1)} disabled={page === meta.last_page} label="→" />
    </div>
  );
}

function Btn({ onClick, disabled, active, label }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`w-9 h-9 rounded-xl text-sm font-bold transition-all
        ${active ? "bg-[#e8175d] text-white shadow-md" : "bg-white text-gray-600 hover:bg-pink-50 shadow-sm"}
        disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {label}
    </button>
  );
}

function ProductSkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl animate-pulse overflow-hidden">
          <div className="aspect-square bg-gray-100" />
          <div className="p-3">
            <div className="h-3 bg-gray-100 rounded mb-2" />
            <div className="h-3 bg-gray-100 rounded w-2/3 mb-3" />
            <div className="h-5 bg-gray-100 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyProducts() {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-pink-50 flex items-center justify-center mb-3">
        <Package size={28} className="text-pink-200" />
      </div>
      <p className="text-gray-400 font-medium text-sm">Không có sản phẩm nào.</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#fdf5f0]">
      <div className="bg-[#e8175d]/80 h-52 animate-pulse" />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <ProductSkeletonGrid />
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen bg-[#fdf5f0] flex items-center justify-center">
      <p className="text-gray-400 text-lg">Không tìm thấy cửa hàng.</p>
    </div>
  );
}