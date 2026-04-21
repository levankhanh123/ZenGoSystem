import { lazy } from "react";

// ── Auth ──────────────────────────────────────────────────────
// const Login    = lazy(() => import("../components/auth/Login.jsx"));
// const Register = lazy(() => import("../components/auth/Register.jsx"));

// ── Layout ───────────────────────────────────────────────────
const MainLayout = lazy(() => import("../components/layout/RootLayout.jsx"));

// ── Shop ─────────────────────────────────────────────────────
// ShopPage       : danh sách tất cả sản phẩm / tìm kiếm / filter
// ShopDetailPage : trang riêng của 1 shop (xem shop theo shopId)
// ProductDetail  : chi tiết 1 sản phẩm
const ProductPage       = lazy(() => import("../pages/ProductPage.jsx"));
const HomePage = lazy(() => import("../pages/HomePage.jsx"));
const ShopList = lazy(() => import("../components/shop/ShopList.jsx"));
const ShopDetail = lazy(() => import("../components/shop/ShopDetail.jsx"));
const VoucherPage = lazy(() => import("../pages/Voucherpage.jsx"));
const Cart = lazy(() => import("../pages/Cartpage.jsx"));
const Account = lazy(() => import("../pages/Accountpage.jsx"));
const Login = lazy(() => import("../components/auth/Login.jsx"));
const Register = lazy(() => import("../components/auth/Register.jsx"));
const ProductDetail = lazy(() => import("../components/product/ProductDetail.jsx"));



export const routers = [
  // ── Auth (standalone, không dùng MainLayout) ──
  { path: "login",    component: Login    },
  { path: "register", component: Register },

  // ── Main app ──────────────────────────────────
  {
    path: "/",
    component: MainLayout,
    children: [
      // Trang chủ
      { index: true, component: HomePage },

      // Shop
      { path: "product",                          component: ProductPage       },
      { path: "product/:productId",       component: ProductDetail  },

      { path: "shop",                  component: ShopList },
      { path: "shop/:shopId",          component: ShopDetail },

      // Các trang khác
      { path: "voucher", component: VoucherPage },
      { path: "cart",    component: Cart    },
      { path: "account", component: Account },
      // { path: "orders",  component: Order   },
    ],
  },
];