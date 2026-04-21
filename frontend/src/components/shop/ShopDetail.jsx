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
  const [categoryId, setCategoryId] = useState("");
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
  }, [categoryId, sort, search, page]);

  const fetchData = (initial = false) => {
    const params = { sort, page, per_page: 12 };
    if (categoryId) params.category_id = categoryId;
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
    setCategoryId(catId === categoryId ? "" : catId);
    setPage(1);
  };

  const handleSort = (val) => {
    setSort(val);
    setPage(1);
  };

  if (loading) return <LoadingSkeleton />;
  if (!data)   return <NotFound />;

  const { shop, categories, products } = data;
  const meta = products;

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
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Logo */}
            {shop.logo ? (
              <img
                src={shop.logo}
                alt={shop.ten_cua_hang}
                className="w-20 h-20 rounded-2xl object-cover border-4 border-white/30 shadow-xl shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur
                flex items-center justify-center shrink-0 border-4 border-white/20">
                <Store size={32} className="text-white" />
              </div>
            )}

            {/* Text */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-1">
                {shop.ten_cua_hang}
              </h1>
              {shop.dia_chi_lay_hang && (
                <p className="text-pink-100 text-sm mb-3">
                  📍 {shop.dia_chi_lay_hang}
                </p>
              )}
              {shop.mo_ta && (
                <p className="text-pink-100 text-sm leading-relaxed line-clamp-2 max-w-xl">
                  {shop.mo_ta}
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-4 sm:gap-6 shrink-0">
              <ShopStat icon={<Package size={16} />}     label="Sản phẩm" value={shop.so_san_pham} />
              <ShopStat icon={<ShoppingBag size={16} />} label="Đã bán"   value={shop.tong_don} />
              {shop.rating_trung_binh > 0 && (
                <ShopStat icon={<Star size={16} />}      label="Đánh giá" value={shop.rating_trung_binh.toFixed(1)} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── LEFT: Filter sidebar ── */}
          <aside className="lg:w-52 shrink-0">
            {/* Mobile toggle */}
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="lg:hidden w-full flex items-center justify-between
                bg-white rounded-2xl px-4 py-3 shadow-sm mb-3 text-sm font-semibold text-gray-700"
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal size={14} className="text-[#e8175d]" />
                Lọc & sắp xếp
              </span>
              {(categoryId || sort !== "moi_nhat") && (
                <span className="w-5 h-5 bg-[#e8175d] text-white text-[10px] font-bold
                  rounded-full flex items-center justify-center">!</span>
              )}
            </button>

            <div className={`${showFilter ? "block" : "hidden"} lg:block`}>
              {/* Danh mục */}
              {categories.length > 0 && (
                <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
                  <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">
                    Danh mục
                  </h4>
                  <button
                    onClick={() => handleCategory("")}
                    className={`w-full text-left text-sm px-3 py-2 rounded-xl mb-1 font-semibold transition-all
                      ${!categoryId
                        ? "bg-[#e8175d] text-white"
                        : "text-gray-600 hover:bg-pink-50 hover:text-[#e8175d]"
                      }`}
                  >
                    Tất cả
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleCategory(String(c.id))}
                      className={`w-full text-left text-sm px-3 py-2 rounded-xl mb-1 transition-all
                        ${categoryId === String(c.id)
                          ? "bg-[#e8175d] text-white font-semibold"
                          : "text-gray-600 hover:bg-pink-50 hover:text-[#e8175d]"
                        }`}
                    >
                      {c.ten_danh_muc}
                    </button>
                  ))}
                </div>
              )}

              {/* Sắp xếp */}
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">
                  Sắp xếp
                </h4>
                {SORT_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => handleSort(o.value)}
                    className={`w-full text-left text-sm px-3 py-2 rounded-xl mb-1 transition-all
                      ${sort === o.value
                        ? "bg-[#e8175d] text-white font-semibold"
                        : "text-gray-600 hover:bg-pink-50 hover:text-[#e8175d]"
                      }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* ── RIGHT: Products ── */}
          <div className="flex-1 min-w-0">

            {/* Search bar + active filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <form onSubmit={handleSearch} className="flex flex-1 gap-2">
                <div className="flex-1 flex items-center gap-2 bg-white rounded-2xl px-4 shadow-sm border border-gray-100">
                  <Search size={14} className="text-gray-400 shrink-0" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Tìm sản phẩm trong shop..."
                    className="flex-1 py-2.5 text-sm outline-none bg-transparent
                      text-gray-700 placeholder-gray-400"
                  />
                  {q && (
                    <button type="button" onClick={() => { setQ(""); setSearch(""); setPage(1); }}>
                      <X size={13} className="text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="bg-[#e8175d] text-white text-sm font-bold px-5 rounded-2xl
                    hover:bg-[#c0114d] active:scale-95 transition-all shadow-sm"
                >
                  Tìm
                </button>
              </form>

              {meta && (
                <span className="text-sm text-gray-400 flex items-center shrink-0">
                  <strong className="text-gray-700 mr-1">{meta.total}</strong> sản phẩm
                </span>
              )}
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