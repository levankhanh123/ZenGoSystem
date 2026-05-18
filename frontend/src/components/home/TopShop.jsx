import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, MapPin, ShoppingBag, Star, Store } from "lucide-react";
import ApiService from "../../services/api.js";
import { assetUrl } from "../../config.js";

export default function TopShop() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ApiService.getTopShops()
      .then((data) => {
        const shopsArr = Array.isArray(data) ? data : data?.data ?? [];
        setShops(shopsArr.slice(0, 5));
      })
      .catch((error) => {
        console.error("Top shops error:", error);
        setShops([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (!loading && shops.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 pb-8 md:px-6">
      <div className="rounded-sm bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h2 className="text-base font-black uppercase text-slate-900">Cửa hàng nổi bật</h2>
          <Link to="/shop" className="inline-flex items-center gap-1 text-sm font-semibold text-[#f7452f]">
            Xem tất cả <ChevronRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-44 animate-pulse rounded-sm bg-slate-100" />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-5">
            {shops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ShopCard({ shop }) {
  const navigate = useNavigate();
  const logo = assetUrl(shop.logo || shop.anh_dai_dien || shop.hinh_anh);
  const rating = Number(shop.rating_trung_binh || shop.rating || 0);

  return (
    <article
      onClick={() => navigate(`/shop/${shop.id}`)}
      className="cursor-pointer overflow-hidden rounded-sm border border-slate-100 bg-white transition hover:-translate-y-0.5 hover:border-[#f7452f] hover:shadow-md"
    >
      <div className="relative h-24 bg-gradient-to-r from-orange-100 to-rose-100">
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/15 to-transparent" />
        <div className="absolute -bottom-8 left-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-sm border-4 border-white bg-white shadow-sm">
          {logo ? <img src={logo} alt={shop.ten_cua_hang} className="h-full w-full object-cover" /> : <Store size={28} className="text-[#f7452f]" />}
        </div>
      </div>
      <div className="px-4 pb-4 pt-10">
        <h3 className="line-clamp-1 text-sm font-black text-slate-900">{shop.ten_cua_hang || "Cửa hàng ZenGo"}</h3>
        {shop.dia_chi_lay_hang && (
          <p className="mt-1 flex items-center gap-1 truncate text-xs text-slate-500">
            <MapPin size={12} />
            {shop.dia_chi_lay_hang}
          </p>
        )}
        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center text-xs text-slate-500">
          <span>
            <strong className="block text-sm text-slate-900">{shop.so_san_pham ?? 0}</strong>
            SP
          </span>
          <span>
            <strong className="block text-sm text-slate-900">{shop.tong_don ?? 0}</strong>
            Đơn
          </span>
          <span>
            <strong className="flex items-center justify-center gap-1 text-sm text-slate-900">
              {rating ? rating.toFixed(1) : "5.0"} <Star size={11} className="fill-yellow-400 text-yellow-400" />
            </strong>
            Điểm
          </span>
        </div>
        <button className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-orange-50 py-2 text-xs font-bold text-[#f7452f]">
          <ShoppingBag size={13} />
          Vào shop
        </button>
      </div>
    </article>
  );
}
