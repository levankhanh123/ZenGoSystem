import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ShoppingCart, Star } from "lucide-react";
import { useCart } from "../../contexts/CartContext.jsx";
import ApiService from "../../services/api.js";

const PAGE_SIZE = 10;
function formatVND(number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(number);
}

export default function TopProducts() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);

  useEffect(() => {
    ApiService.getTopProducts()
      .then(data => {
        // Đảm bảo data là mảng để tránh lỗi .length hoặc .slice
        const productsArr = Array.isArray(data) ? data : (data?.data ?? []);
        setProducts(productsArr);
      })
      .catch(err => {
        console.error("API error:", err);
        setProducts([]); // Trả về mảng rỗng nếu lỗi
      });
  }, []);

  const totalPages = Math.max(1, Math.ceil((products?.length || 0) / PAGE_SIZE));
  const paged = Array.isArray(products) ? products.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE) : [];

  return (
    <section className="w-full py-12 bg-[#fdf5f0]">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="text-2xl">🏆</span>
          <h2 className="text-2xl font-extrabold text-[#2d1b1b] tracking-tight">
            Top sản phẩm bán chạy
          </h2>
          <span className="text-2xl">🏆</span>
        </div>

        {/* Carousel */}
        <div className="relative">
          <ArrowBtn dir="left"
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            side="left"
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 px-10">
            {paged.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          <ArrowBtn dir="right"
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            side="right"
          />
        </div>

        {/* Dots */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`rounded-full transition-all duration-200
                  ${page === i
                    ? "w-6 h-2.5 bg-[#e8175d]"
                    : "w-2.5 h-2.5 bg-gray-300 hover:bg-pink-300"
                  }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ArrowBtn({ dir, onClick, disabled, side }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`absolute top-1/2 -translate-y-1/2 z-10
        w-10 h-10 rounded-full bg-white shadow-lg border border-gray-100
        flex items-center justify-center
        disabled:opacity-25 hover:bg-pink-50 hover:border-[#e8175d]
        active:scale-90 transition-all duration-150
        ${side === "left" ? "-left-2" : "-right-2"}`}>
      {dir === "left"
        ? <ChevronLeft size={18} className="text-[#e8175d]" />
        : <ChevronRight size={18} className="text-[#e8175d]" />}
    </button>
  );
}

function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addItem } = useCart();

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl
        active:scale-[0.98] transition-all duration-200 cursor-pointer flex flex-col group"
    >

      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        <img src={product.image} alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* fallback badge (optional) */}
        <span className="absolute top-2 left-2 text-white text-[10px] font-bold
          px-2 py-0.5 rounded-full bg-red-500">
          HOT
        </span>

        {discount && (
          <span className="absolute top-2 right-2 bg-yellow-400 text-gray-900
            text-[10px] font-black px-1.5 py-0.5 rounded-full">
            -{discount}%
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <p className="text-sm font-semibold text-gray-800 line-clamp-2">
          {product.name}
        </p>

        <div className="flex items-center gap-1">
          <Star size={11} className="text-yellow-400 fill-yellow-400" />
          <span className="text-xs text-gray-500">
            {product.rating} · {product.sold} đã bán
          </span>
        </div>

        <div className="mt-auto">
          <p className="text-base font-extrabold text-[#e8175d]">
            {formatVND(product.price)}
          </p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            addItem(product, 1);
          }}
          className="mt-1 w-full flex items-center justify-center gap-1.5
            bg-[#e8175d] hover:bg-[#c0114d] text-white text-xs font-bold
            py-2 rounded-xl active:scale-95 transition-all duration-150">
          <ShoppingCart size={12} />
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );
}