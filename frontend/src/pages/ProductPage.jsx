import { useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  SlidersHorizontal,
  X,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000/api";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

  .shop-wrap * {
    font-family: 'Nunito', sans-serif;
    box-sizing: border-box;
  }

  /* Search bar */
  .search-bar {
    transition: box-shadow 0.25s ease, transform 0.2s ease;
  }
  .search-bar:focus-within {
    box-shadow: 0 0 0 2.5px #f9a8d4, 0 4px 16px rgba(236,72,153,0.13);
    transform: translateY(-1px);
  }

  /* Category pill */
  .cat-pill {
    transition: background 0.18s, color 0.18s, transform 0.2s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s;
    white-space: nowrap;
  }
  .cat-pill:hover {
    transform: translateY(-3px) scale(1.04);
    box-shadow: 0 8px 20px rgba(236,72,153,0.22) !important;
    border-color: #f9a8d4 !important;
  }

  /* Product card */
  .product-card {
    transition: transform 0.22s cubic-bezier(.34,1.56,.64,1), box-shadow 0.22s ease;
    cursor: pointer;
  }
  .product-card:hover {
    transform: translateY(-5px) scale(1.025);
    box-shadow: 0 12px 32px rgba(236,72,153,0.16), 0 2px 8px rgba(0,0,0,0.07);
  }
  .product-card:hover .product-img {
    transform: scale(1.04);
  }
  .product-img {
    transition: transform 0.35s ease;
  }

  /* Badge */
  .badge-sold {
    background: #fce7f3;
    color: #be185d;
    border-radius: 999px;
    padding: 1px 7px;
    font-size: 10px;
    font-weight: 700;
  }

  /* Pagination btn */
  .page-btn {
    transition: background 0.16s, color 0.16s, transform 0.16s;
  }
  .page-btn:hover:not(:disabled) {
    transform: scale(1.08);
  }
  .page-btn.active {
    background: linear-gradient(135deg, #f472b6, #ec4899);
    color: #fff;
    box-shadow: 0 3px 10px rgba(236,72,153,0.3);
  }

  /* Skeleton shimmer */
  @keyframes shimmer {
    0% { background-position: -400px 0 }
    100% { background-position: 400px 0 }
  }
  .shimmer {
    background: linear-gradient(90deg, #fce7f3 25%, #fdf2f8 50%, #fce7f3 75%);
    background-size: 800px 100%;
    animation: shimmer 1.4s infinite linear;
    border-radius: 10px;
  }
`;

// Skeleton card
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-2.5 overflow-hidden">
      <div className="shimmer aspect-[3/4] w-full rounded-xl mb-2" />
      <div className="shimmer h-3 w-4/5 rounded mb-1.5" />
      <div className="shimmer h-3 w-2/5 rounded mb-1.5" />
      <div className="shimmer h-4 w-3/5 rounded" />
    </div>
  );
}

// ================= MAIN =================
export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  const [category, setCategory] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  // ================= LOAD CATEGORY =================
  useEffect(() => {
    axios.get(`${API_URL}/categories`)
      .then(res => {
        setCategories(
          res.data.map(c => ({
            id: c.id,
            label: c.ten_danh_muc,
            emoji: "🛍️"
          }))
        );
      });
  }, []);

  // ================= LOAD PRODUCTS =================
  useEffect(() => {
    loadProducts();
  }, [category, keyword]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (category) params.category_id = category;
      if (keyword) params.q = keyword;
      const res = await axios.get(`${API_URL}/products`, { params });
      setProducts(res.data.data);
      setPage(1);
    } finally {
      setLoading(false);
    }
  };

  // ================= PAGINATION =================
  const PAGE_SIZE = 9;
  const totalPages = Math.ceil(products.length / PAGE_SIZE);
  const paged = products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <style>{styles}</style>

      <div
        className="shop-wrap min-h-screen pb-8"
        style={{ background: "linear-gradient(160deg, #fff5f9 0%, #ffffff 60%, #fdf2f8 100%)" }}
      >

        {/* ===== HEADER BANNER ===== */}
        <div
          className="px-4 pt-5 pb-4"
          style={{
            background: "linear-gradient(135deg, #fce7f3 0%, #fff 100%)",
            borderBottom: "1.5px solid #fce7f3"
          }}
        >
          <p
            className="text-lg font-black tracking-tight mb-0.5"
            style={{ color: "#be185d" }}
          >
            🛍️ Cửa hàng
          </p>
          <p className="text-xs font-semibold" style={{ color: "#f472b6" }}>
            Khám phá hàng ngàn sản phẩm
          </p>

          {/* Search bar */}
          <div
            className="search-bar flex items-center bg-white rounded-2xl px-3.5 py-2.5 gap-2 mt-3"
            style={{
              border: "1.5px solid #fce7f3",
              boxShadow: "0 2px 10px rgba(236,72,153,0.07)"
            }}
          >
            <Search size={15} style={{ color: "#f9a8d4" }} />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="flex-1 text-sm outline-none bg-transparent font-semibold"
              style={{ color: "#3f3f46" }}
            />
            {keyword && (
              <button
                onClick={() => setKeyword("")}
                className="flex items-center justify-center w-5 h-5 rounded-full"
                style={{ background: "#fce7f3", color: "#ec4899" }}
              >
                <X size={11} />
              </button>
            )}
            <div style={{ width: 1, height: 16, background: "#fce7f3" }} />
            <SlidersHorizontal size={16} style={{ color: "#ec4899" }} />
          </div>
        </div>

        {/* ===== CATEGORIES ===== */}
        <div className="px-4 py-4">
          <div
            className="flex gap-2.5 overflow-x-auto justify-start"
            style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
          >
            {/* "Tất cả" pill */}
            <button
              onClick={() => setCategory(null)}
              className="cat-pill flex-shrink-0 flex items-center gap-1.5 px-5 py-2.5 rounded-2xl text-sm font-extrabold"
              style={
                category === null
                  ? {
                      background: "linear-gradient(135deg, #f472b6, #ec4899)",
                      color: "#fff",
                      boxShadow: "0 6px 18px rgba(236,72,153,0.35)",
                      border: "none",
                    }
                  : {
                      background: "#fff",
                      color: "#be185d",
                      border: "2px solid #fce7f3",
                    }
              }
            >
              
              <span>Tất cả</span>
            </button>

            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className="cat-pill flex-shrink-0 flex items-center gap-1.5 px-5 py-2.5 rounded-2xl text-sm font-extrabold"
                style={
                  category === cat.id
                    ? {
                        background: "linear-gradient(135deg, #f472b6, #ec4899)",
                        color: "#fff",
                        boxShadow: "0 6px 18px rgba(236,72,153,0.35)",
                        border: "none",
                      }
                    : {
                        background: "#fff",
                        color: "#be185d",
                        border: "2px solid #fce7f3",
                      }
                }
              >
                
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Active indicator underline */}
          <div className="mt-3 flex justify-center">
            <div
              className="h-1 rounded-full"
              style={{
                width: 40,
                background: "linear-gradient(90deg, #f9a8d4, #ec4899)",
                opacity: 0.5,
              }}
            />
          </div>
        </div>

        {/* ===== PRODUCT GRID ===== */}
        <div className="px-20">
          {loading ? (
            <div className="grid grid-cols-3 gap-2.5">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : paged.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <span className="text-4xl">🧺</span>
              <p className="text-sm font-bold" style={{ color: "#d1d5db" }}>
                Không có sản phẩm nào
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2.5">
              {paged.map(p => (
                <div
                  key={p.id}
                  className="product-card bg-white rounded-2xl overflow-hidden"
                  style={{
                    border: "1.5px solid #fce7f3",
                    boxShadow: "0 2px 8px rgba(236,72,153,0.06)"
                  }}
                  onClick={() => navigate(`/product/${p.id}`)}
                >
                  {/* Image */}
                  <div className="overflow-hidden rounded-t-xl" style={{ background: "#fff5f9" }}>
                    <img
                      src={p.image}
                      className="product-img aspect-[3/4] w-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="p-2">
                    <p
                      className="text-xs font-bold line-clamp-2 leading-tight mb-1"
                      style={{ color: "#3f3f46" }}
                    >
                      {p.name}
                    </p>

                    <div className="flex items-center gap-1 mb-1.5">
                      <Star size={10} style={{ color: "#fbbf24", fill: "#fbbf24" }} />
                      <span className="text-[10px] font-semibold" style={{ color: "#71717a" }}>
                        {p.rating}
                      </span>
                      <span className="badge-sold">{p.sold}</span>
                    </div>

                    <p
                      className="text-sm font-black"
                      style={{
                        background: "linear-gradient(135deg, #f472b6, #ec4899)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent"
                      }}
                    >
                      {Number(p.price).toLocaleString()}₫
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===== PAGINATION ===== */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-1.5 mt-6 px-4">
            <button
              className="page-btn flex items-center justify-center w-8 h-8 rounded-xl font-bold"
              style={{
                background: "#fce7f3",
                color: page === 1 ? "#fca5a5" : "#ec4899",
                opacity: page === 1 ? 0.45 : 1,
                border: "none",
                cursor: page === 1 ? "not-allowed" : "pointer"
              }}
              onClick={() => setPage(p => p - 1)}
              disabled={page === 1}
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`page-btn w-8 h-8 rounded-xl text-xs font-black ${page === i + 1 ? "active" : ""}`}
                style={
                  page === i + 1
                    ? {}
                    : { background: "#fff", color: "#71717a", border: "1.5px solid #fce7f3" }
                }
              >
                {i + 1}
              </button>
            ))}

            <button
              className="page-btn flex items-center justify-center w-8 h-8 rounded-xl font-bold"
              style={{
                background: "#fce7f3",
                color: page === totalPages ? "#fca5a5" : "#ec4899",
                opacity: page === totalPages ? 0.45 : 1,
                border: "none",
                cursor: page === totalPages ? "not-allowed" : "pointer"
              }}
              onClick={() => setPage(p => p + 1)}
              disabled={page === totalPages}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

      </div>
    </>
  );
}