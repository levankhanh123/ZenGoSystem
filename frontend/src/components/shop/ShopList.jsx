import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Star, ShoppingBag, Package, ChevronRight, Store } from "lucide-react";
import ApiService from "../../services/api.js";



export default function ShopList() {
  const [shops, setShops]       = useState([]);
  const [meta, setMeta]         = useState(null);
  const [page, setPage]         = useState(1);
  const [q, setQ]               = useState("");
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(true);
  const inputRef                = useRef();

  useEffect(() => {
    setLoading(true);
    const params = { page, per_page: 12 };
    if (search) params.q = search;

    ApiService.getShops(params)
      .then((data) => {
        setShops(data.data ?? []);
        setMeta(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(q);
  };

  return (
    <div className="min-h-screen bg-[#fdf5f0]">
      {/* ── Hero banner ── */}
      <div className="bg-gradient-to-br from-[#e8175d] to-[#ff6b6b] py-12 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight">
             Khám phá Cửa Hàng
          </h1>
          <p className="text-pink-100 text-sm mb-8">
            Hàng trăm shop uy tín, đa dạng sản phẩm chất lượng
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex max-w-xl mx-auto gap-2">
            <div className="flex-1 flex items-center gap-2 bg-white rounded-2xl px-4 shadow-lg">
              <Search size={16} className="text-gray-400 shrink-0" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm tên cửa hàng..."
                className="flex-1 py-3 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400"
              />
            </div>
            <button
              type="submit"
              className="bg-[#2d1b1b] text-white text-sm font-bold px-6 rounded-2xl
                hover:bg-black active:scale-95 transition-all shadow-lg"
            >
              Tìm
            </button>
          </form>
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {loading ? (
          <SkeletonGrid />
        ) : shops.length === 0 ? (
          <Empty />
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-6">
              Tìm thấy <strong className="text-gray-700">{meta?.total ?? 0}</strong> cửa hàng
              {search && <> cho <span className="text-[#e8175d]">"{search}"</span></>}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {shops.map((shop, i) => (
                <ShopCard key={shop.id} shop={shop} index={i} />
              ))}
            </div>

            {/* Pagination */}
            {meta && meta.last_page > 1 && (
              <Pagination meta={meta} page={page} setPage={setPage} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ShopCard({ shop, index }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/shop/${shop.id}`)}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl
        cursor-pointer transition-all duration-200 hover:-translate-y-1 group"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Top color bar */}
      <div className="h-1.5 bg-gradient-to-r from-[#e8175d] to-[#ff6b6b]" />

      <div className="p-5">
        {/* Logo + Name */}
        <div className="flex items-center gap-3 mb-4">
          {shop.logo ? (
            <img
              src={shop.logo}
              alt={shop.ten_cua_hang}
              className="w-14 h-14 rounded-2xl object-cover border border-gray-100 shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-pink-50 flex items-center justify-center shrink-0">
              <Store size={24} className="text-[#e8175d]" />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-extrabold text-[#2d1b1b] text-sm leading-tight
              group-hover:text-[#e8175d] transition-colors line-clamp-2">
              {shop.ten_cua_hang}
            </h3>
            {shop.dia_chi_lay_hang && (
              <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                📍 {shop.dia_chi_lay_hang}
              </p>
            )}
          </div>
        </div>

        {/* Mô tả */}
        {shop.mo_ta && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">
            {shop.mo_ta}
          </p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-1 bg-[#fdf5f0] rounded-xl p-3 mb-4">
          <Stat label="Sản phẩm" value={shop.so_san_pham} icon={<Package size={13} />} />
          <Stat label="Đã bán"   value={shop.tong_don}    icon={<ShoppingBag size={13} />} />
          <Stat label="Đánh giá" value={shop.rating_trung_binh > 0 ? shop.rating_trung_binh.toFixed(1) : "—"} icon={<Star size={13} />} />
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between">
          {shop.rating_trung_binh > 0 && (
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} size={11}
                  className={s <= Math.round(shop.rating_trung_binh)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-200 fill-gray-200"
                  }
                />
              ))}
            </div>
          )}
          <span className="ml-auto flex items-center gap-1 text-xs font-bold text-[#e8175d]
            group-hover:gap-2 transition-all">
            Xem shop <ChevronRight size={13} />
          </span>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, icon }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="flex items-center gap-1 text-[#e8175d]">{icon}</div>
      <span className="text-sm font-extrabold text-[#2d1b1b]">{value}</span>
      <span className="text-[10px] text-gray-400">{label}</span>
    </div>
  );
}

function Pagination({ meta, page, setPage }) {
  return (
    <div className="flex justify-center items-center gap-2 mt-10">
      <PageBtn onClick={() => setPage(page - 1)} disabled={page === 1} label="←" />
      {Array.from({ length: meta.last_page }, (_, i) => i + 1)
        .filter((p) => p === 1 || p === meta.last_page || Math.abs(p - page) <= 2)
        .reduce((acc, p, i, arr) => {
          if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
          acc.push(p);
          return acc;
        }, [])
        .map((p, i) =>
          p === "..." ? (
            <span key={`dot-${i}`} className="text-gray-400 text-sm px-1">…</span>
          ) : (
            <PageBtn key={p} onClick={() => setPage(p)} active={p === page} label={p} />
          )
        )}
      <PageBtn onClick={() => setPage(page + 1)} disabled={page === meta.last_page} label="→" />
    </div>
  );
}

function PageBtn({ onClick, disabled, active, label }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-9 h-9 rounded-xl text-sm font-bold transition-all
        ${active
          ? "bg-[#e8175d] text-white shadow-md"
          : "bg-white text-gray-600 hover:bg-pink-50 hover:text-[#e8175d] shadow-sm"
        }
        disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {label}
    </button>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-5 animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 shrink-0" />
            <div className="flex-1">
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
          <div className="h-3 bg-gray-100 rounded mb-2" />
          <div className="h-3 bg-gray-100 rounded w-5/6 mb-4" />
          <div className="h-14 bg-gray-100 rounded-xl" />
        </div>
      ))}
    </div>
  );
}

function Empty() {
  return (
    <div className="flex flex-col items-center py-24 text-center">
      <div className="w-20 h-20 rounded-3xl bg-pink-50 flex items-center justify-center mb-4">
        <Store size={36} className="text-pink-200" />
      </div>
      <p className="text-gray-400 font-medium">Không tìm thấy cửa hàng nào.</p>
    </div>
  );
}