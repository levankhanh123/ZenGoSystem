import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, ShoppingCart, Star } from "lucide-react";
import { useCart } from "../../contexts/CartContext.jsx";
import ApiService from "../../services/api.js";
import { assetUrl } from "../../config.js";

const PAGE_SIZE = 10;

function formatVND(number) {
  const value = Number(number || 0);
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function getProductImage(product) {
  return assetUrl(
    product.image ||
      product.hinh_anh ||
      product.anh_dai_dien ||
      product.hinh_anh_chinh ||
      product.images?.[0]?.url ||
      product.hinh_anh_san_pham?.[0]?.url
  );
}

export default function TopProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ApiService.getTopProducts()
      .then((data) => {
        const productsArr = Array.isArray(data) ? data : data?.data ?? [];
        setProducts(productsArr.slice(0, PAGE_SIZE));
      })
      .catch((error) => {
        console.error("Top products error:", error);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 pb-5 md:px-6">
      <div className="rounded-sm bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h2 className="text-base font-black uppercase text-[#f7452f]">Sản phẩm bán chạy</h2>
          <Link to="/product" className="inline-flex items-center gap-1 text-sm font-semibold text-[#f7452f]">
            Xem thêm <ChevronRight size={15} />
          </Link>
        </div>

        {loading ? (
          <ProductSkeleton />
        ) : products.length ? (
          <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="p-10 text-center text-sm text-slate-500">Chưa có sản phẩm.</div>
        )}
      </div>
    </section>
  );
}

function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const image = getProductImage(product);
  const price = product.price ?? product.gia_khuyen_mai ?? product.gia_ban ?? product.gia ?? 0;
  const originalPrice = product.originalPrice ?? product.gia_goc ?? product.gia_niem_yet;
  const sold = product.sold ?? product.da_ban ?? product.so_luong_da_ban ?? 0;
  const rating = product.rating ?? product.rating_trung_binh ?? product.diem_danh_gia ?? 5;
  const discount = originalPrice && Number(originalPrice) > Number(price)
    ? Math.round((1 - Number(price) / Number(originalPrice)) * 100)
    : null;

  return (
    <article
      onClick={() => navigate(`/product/${product.id}`)}
      className="group cursor-pointer overflow-hidden rounded-sm border border-slate-100 bg-white transition hover:-translate-y-0.5 hover:border-[#f7452f] hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        {image ? (
          <img src={image} alt={product.name || product.ten_san_pham} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-orange-50 text-sm font-bold text-[#f7452f]">
            ZenGo
          </div>
        )}
        <span className="absolute left-0 top-2 bg-[#f7452f] px-2 py-0.5 text-[11px] font-bold text-white">Yêu thích</span>
        {discount && (
          <span className="absolute right-2 top-2 rounded-sm bg-yellow-300 px-1.5 py-1 text-center text-[11px] font-black leading-none text-[#f7452f]">
            -{discount}%
          </span>
        )}
      </div>

      <div className="p-2.5">
        <h3 className="line-clamp-2 min-h-[40px] text-sm font-medium leading-5 text-slate-800">
          {product.name || product.ten_san_pham || "Sản phẩm ZenGo"}
        </h3>
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="truncate text-base font-black text-[#f7452f]">{formatVND(price)}</p>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              addItem(product, 1);
            }}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-orange-50 text-[#f7452f] transition hover:bg-[#f7452f] hover:text-white"
            aria-label="Thêm vào giỏ"
          >
            <ShoppingCart size={15} />
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Star size={12} className="fill-yellow-400 text-yellow-400" />
            {Number(rating || 5).toFixed(1)}
          </span>
          <span>Đã bán {sold}</span>
        </div>
      </div>
    </article>
  );
}

function ProductSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-sm border border-slate-100 bg-white">
          <div className="aspect-square bg-slate-100" />
          <div className="space-y-2 p-3">
            <div className="h-3 rounded bg-slate-100" />
            <div className="h-3 w-2/3 rounded bg-slate-100" />
            <div className="h-4 w-1/2 rounded bg-orange-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
