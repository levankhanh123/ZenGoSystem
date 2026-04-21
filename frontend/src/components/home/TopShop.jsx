import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Store, Package, ShoppingBag, Star, ChevronRight } from "lucide-react";
import ApiService from "../../services/api.js";



export default function TopShop() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    ApiService.getTopShops()
      .then((data) => {
        setShops(Array.isArray(data) ? data : data.data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (!loading && shops.length === 0) return null;

  return (
    <section className="w-full py-12 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏪</span>
            <h2 className="text-2xl font-extrabold text-[#2d1b1b] tracking-tight">
              Cửa hàng nổi bật
            </h2>
          </div>
          <button
            onClick={() => navigate("/shop")}
            className="flex items-center gap-1 text-sm font-semibold text-[#e8175d]
              hover:text-[#c0114d] transition-colors"
          >
            Xem tất cả <ChevronRight size={15} />
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <SkeletonGrid />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {shops.map((shop, i) => (
              <ShopCard key={shop.id} shop={shop} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ShopCard({ shop, index }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/shop/${shop.id}`)}
      className="bg-[#fdf5f0] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl
        cursor-pointer transition-all duration-200 hover:-translate-y-0.5 group flex flex-col"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Banner / Logo area */}
      <div className="relative h-24 bg-gradient-to-br from-[#e8175d]/10 to-[#ff6b6b]/10
        flex items-center justify-center overflow-hidden">
        {shop.logo ? (
          <img
            src={shop.logo}
            alt={shop.ten_cua_hang}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md
              group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-white/60 flex items-center justify-center border-2 border-white shadow-md">
            <Store size={28} className="text-[#e8175d]" />
          </div>
        )}

        {/* Rating badge */}
        {shop.rating_trung_binh > 0 && (
          <span className="absolute top-2 right-2 flex items-center gap-0.5
            bg-white text-yellow-500 text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-sm">
            <Star size={9} className="fill-yellow-400 text-yellow-400" />
            {shop.rating_trung_binh.toFixed(1)}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <p className="text-sm font-bold text-gray-800 line-clamp-1">
          {shop.ten_cua_hang}
        </p>

        {shop.dia_chi_lay_hang && (
          <p className="text-[11px] text-gray-400 line-clamp-1">
            📍 {shop.dia_chi_lay_hang}
          </p>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-3 mt-auto pt-1
          border-t border-gray-100 text-[11px] text-gray-500">
          <span className="flex items-center gap-1">
            <Package size={10} className="text-[#e8175d]" />
            {shop.so_san_pham ?? 0} SP
          </span>
          <span className="flex items-center gap-1">
            <ShoppingBag size={10} className="text-[#e8175d]" />
            {shop.tong_don ?? 0} đơn
          </span>
        </div>
      </div>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-[#fdf5f0] rounded-2xl animate-pulse overflow-hidden">
          <div className="h-24 bg-pink-100/40" />
          <div className="p-3">
            <div className="h-3 bg-gray-100 rounded mb-2 w-3/4" />
            <div className="h-2 bg-gray-100 rounded mb-3 w-1/2" />
            <div className="h-2 bg-gray-100 rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}