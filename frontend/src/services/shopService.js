import ApiService from "./api";

// ================= MAP DATA =================
function mapProduct(p) {
  return {
    id: p.slug,
    name: p.ten_san_pham,
    price: Number(p.gia),
    originalPrice: null,
    image: `http://127.0.0.1:8000/storage/${p.hinh_dai_dien}`,
    category: p.danh_muc_id,
    rating: 4.5,
    sold: 100,
    badge: "Mua ngay",
    badgeColor: "bg-pink-500",
    shopId: p.cua_hang_id,
  };
}

// ================= CATEGORY =================
export async function fetchCategories() {
  const data = await ApiService.getCategories();

  return data.map((c) => ({
    id: c.slug,
    label: c.ten_danh_muc,
    emoji: "🛍️", // tạm
  }));
}

// ================= PRODUCTS =================
export async function fetchProducts(categorySlug = null) {
  const params = {};

  if (categorySlug) {
    params.category_slug = categorySlug;
  }

  const res = await ApiService.getProducts(params);

  return res.data.map(mapProduct);
}