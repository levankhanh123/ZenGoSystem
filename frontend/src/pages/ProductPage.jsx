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
import { useNavigate, useSearchParams } from "react-router-dom";

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

  /* Section title */
  .section-title {
    font-size: 1.1rem;
    font-weight: 900;
    color: #be185d;
    display: flex;
    items-center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    padding: 0 0.5rem;
  }

  /* Category card style */
  .category-item {
    transition: all 0.2s ease;
    cursor: pointer;
  }
  .category-item:hover {
    transform: translateY(-2px);
    border-color: #f9a8d4 !important;
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
  const [searchParams] = useSearchParams();

  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const keyword = searchParams.get("q") || "";

  // ================= LOAD CATEGORY =================
  useEffect(() => {
    axios.get(`${API_URL}/categories`)
      .then(res => {
        setCategories(
          res.data.map(c => ({
            id: c.id,
            label: c.ten_danh_muc,
            emoji: getEmojiForCategory(c.ten_danh_muc)
          }))
        );
      });
  }, []);

  const getEmojiForCategory = (name) => {
    const n = name.toLowerCase();
    if (n.includes("áo")) return "";
    if (n.includes("quần")) return "";
    if (n.includes("váy")) return "";
    if (n.includes("phụ kiện")) return "";
    if (n.includes("giày")) return "";
    if (n.includes("túi")) return "";
    return "🛍️";
  };

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
  const PAGE_SIZE = 12;
  const totalPages = Math.ceil(products.length / PAGE_SIZE);
  const paged = products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <style>{styles}</style>

      <div
        className="shop-wrap min-h-screen pb-12"
        style={{ background: "linear-gradient(160deg, #fff5f9 0%, #ffffff 60%, #fdf2f8 100%)" }}
      >
        <div className="max-w-6xl mx-auto pt-6 px-4">
          
          {/* ===== SECTION 1: DANH MỤC ===== */}
          <section className="mb-10">
            <h2 className="section-title">
              <span className="p-1.5 bg-[#fce7f3] rounded-lg"></span>
              Danh mục sản phẩm
            </h2>
            <div
              className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3"
            >
              {/* "Tất cả" */}
              <div
                onClick={() => setCategory(null)}
                className={`category-item flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all
                          ${category === null ? "bg-white border-[#ec4899] shadow-md" : "bg-white/50 border-[#fce7f3]"}`}
              >
                <span className="text-2xl mb-1"></span>
                <span className={`text-[11px] font-bold ${category === null ? "text-[#ec4899]" : "text-gray-500"}`}>
                  Tất cả
                </span>
              </div>

              {categories.map(cat => (
                <div
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`category-item flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all
                            ${category === cat.id ? "bg-white border-[#ec4899] shadow-md" : "bg-white/50 border-[#fce7f3]"}`}
                >
                  <span className="text-2xl mb-1">{cat.emoji}</span>
                  <span className={`text-[11px] font-bold text-center line-clamp-1 ${category === cat.id ? "text-[#ec4899]" : "text-gray-500"}`}>
                    {cat.label}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* ===== SECTION 2: DÀNH RIÊNG CHO BẠN ===== */}
          <section>
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="section-title !mb-0">
                <span className="p-1.5 bg-[#fce7f3] rounded-lg"></span>
                {category ? `Sản phẩm thuộc danh mục` : "Dành riêng cho bạn"}
              </h2>
              {keyword && (
                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                  Kết quả cho: "{keyword}"
                </span>
              )}
            </div>

            {/* Product Grid */}
            <div>
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : paged.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-[#fce7f3]">
                  <span className="text-5xl mb-4">🧺</span>
                  <p className="text-base font-bold text-gray-400">
                    Hết hàng rồi, bạn quay lại sau nhé!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
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
                          alt={p.name}
                          className="product-img aspect-[3/4] w-full object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="p-2.5">
                        <p className="text-[11px] font-bold line-clamp-2 leading-tight mb-1 text-gray-700 h-8">
                          {p.name}
                        </p>

                        <div className="flex items-center gap-1 mb-2">
                          <Star size={9} className="text-[#fbbf24] fill-[#fbbf24]" />
                          <span className="text-[10px] font-bold text-gray-400">
                            {p.rating}
                          </span>
                          <span className="badge-sold ml-auto">Đã bán {p.sold}</span>
                        </div>

                        <p className="text-[13px] font-black text-[#ec4899]">
                          {Number(p.price).toLocaleString()}₫
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <button
                  className="page-btn flex items-center justify-center w-9 h-9 rounded-xl font-bold bg-white text-[#ec4899] border border-[#fce7f3]"
                  onClick={() => setPage(p => p - 1)}
                  disabled={page === 1}
                  style={{ opacity: page === 1 ? 0.5 : 1 }}
                >
                  <ChevronLeft size={18} />
                </button>

                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`page-btn w-9 h-9 rounded-xl text-xs font-black transition-all
                              ${page === i + 1 ? "active" : "bg-white text-gray-500 border border-[#fce7f3]"}`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  className="page-btn flex items-center justify-center w-9 h-9 rounded-xl font-bold bg-white text-[#ec4899] border border-[#fce7f3]"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page === totalPages}
                  style={{ opacity: page === totalPages ? 0.5 : 1 }}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}