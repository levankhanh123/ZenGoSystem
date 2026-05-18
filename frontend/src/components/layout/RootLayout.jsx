import { Outlet, Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LogOut,
  Menu,
  Search,
  ShoppingCart,
  Store,
  X,
} from "lucide-react";
import { useAuth } from "../../contexts/Authcontext.jsx";
import { useCart } from "../../contexts/CartContext.jsx";
import FloatingChatWidget from "../chat/FloatingChatWidget";

const NAV_LINKS = [
  { label: "Trang chủ", to: "/" },
  { label: "Sản phẩm", to: "/product" },
  { label: "Cửa hàng", to: "/shop" },
  { label: "Voucher", to: "/voucher" },
];

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout: authLogout } = useAuth();
  const { totalItems, logout: cartLogout } = useCart();
  const [keyword, setKeyword] = useState(searchParams.get("q") || "");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setKeyword(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearch = (event) => {
    event.preventDefault();
    const query = keyword.trim();
    navigate(query ? `/product?q=${encodeURIComponent(query)}` : "/product");
  };

  const handleLogout = () => {
    authLogout();
    cartLogout();
    navigate("/");
  };

  const displayName = user?.ho_ten?.split(" ").pop() || "Bạn";
  const initials = user?.ho_ten
    ? user.ho_ten
        .split(" ")
        .slice(-2)
        .map((word) => word[0])
        .join("")
        .toUpperCase()
    : "ZG";

  return (
    <header className="sticky top-0 z-50 bg-[#f7452f] text-white shadow-sm">
      <div className="border-b border-white/10">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 text-xs md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(user?.vai_tro === "seller" ? "/seller-dashboard" : "/seller-registration")}
              className="inline-flex items-center gap-1.5 font-medium text-white/90 transition hover:text-white"
            >
              <Store size={14} />
              Kênh người bán
            </button>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <button
                  type="button"
                  onClick={() => navigate("/account")}
                  className="inline-flex items-center gap-2 font-semibold text-white transition hover:text-white/90"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[10px] font-black text-[#f7452f]">
                    {user.anh_dai_dien ? (
                      <img src={user.anh_dai_dien} alt="" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      initials
                    )}
                  </span>
                  Hi, {displayName}
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1 text-white/85 transition hover:text-white"
                >
                  <LogOut size={13} />
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link to="/register" className="font-semibold text-white/90 hover:text-white">
                  Đăng ký
                </Link>
                <span className="h-3 w-px bg-white/25" />
                <Link to="/login" className="font-semibold text-white hover:text-white/90">
                  Đăng nhập
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-4 md:px-6">
        <div className="flex items-center gap-3 md:gap-6">
          <button
            type="button"
            className="rounded-md p-2 text-white md:hidden"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label="Mở menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link to="/" className="shrink-0 text-2xl font-black tracking-tight md:text-3xl">
            ZenGo
          </Link>

          <form onSubmit={handleSearch} className="min-w-0 flex-1">
            <div className="flex h-11 overflow-hidden rounded-sm bg-white shadow-sm">
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Tìm sản phẩm, shop, voucher..."
                className="min-w-0 flex-1 px-4 text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword("")}
                  className="px-2 text-slate-400 transition hover:text-slate-600"
                  aria-label="Xóa tìm kiếm"
                >
                  <X size={16} />
                </button>
              )}
              <button
                type="submit"
                className="m-1 inline-flex w-14 items-center justify-center rounded-sm bg-[#fb5533] text-white transition hover:bg-[#e83f24]"
                aria-label="Tìm kiếm"
              >
                <Search size={19} />
              </button>
            </div>
          </form>

          <Link to="/cart" className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm text-white transition hover:bg-white/10">
            <ShoppingCart size={26} />
            {totalItems > 0 && (
              <span className="absolute right-0 top-0 min-w-5 rounded-full border-2 border-[#f7452f] bg-white px-1 text-center text-[10px] font-black leading-4 text-[#f7452f]">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </Link>
        </div>

        <nav className={`${mobileOpen ? "flex" : "hidden"} mt-4 flex-col gap-1 md:flex md:flex-row md:items-center md:gap-5`}>
          {NAV_LINKS.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`rounded-sm px-2 py-1.5 text-sm font-semibold transition ${
                  active ? "bg-white text-[#f7452f]" : "text-white/90 hover:bg-white/10 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm text-slate-600 md:grid-cols-[1.5fr_1fr_1fr_1fr] md:px-6">
        <div>
          <div className="text-2xl font-black text-[#f7452f]">ZenGo</div>
        </div>
        <div>
          <h4 className="mb-3 font-bold uppercase text-slate-900">Mua hàng</h4>
          <div className="space-y-2">
            <Link to="/product" className="block hover:text-[#f7452f]">Tất cả sản phẩm</Link>
            <Link to="/shop" className="block hover:text-[#f7452f]">Cửa hàng</Link>
            <Link to="/voucher" className="block hover:text-[#f7452f]">Voucher</Link>
          </div>
        </div>
        <div>
          <h4 className="mb-3 font-bold uppercase text-slate-900">Tài khoản</h4>
          <div className="space-y-2">
            <Link to="/account" className="block hover:text-[#f7452f]">Hồ sơ</Link>
            <Link to="/cart" className="block hover:text-[#f7452f]">Giỏ hàng</Link>
            <Link to="/seller-registration" className="block hover:text-[#f7452f]">Đăng ký bán hàng</Link>
          </div>
        </div>
        <div>
          <h4 className="mb-3 font-bold uppercase text-slate-900">Thanh toán</h4>
          <div className="space-y-2">
            <p>Thanh toán khi nhận hàng</p>
            <p>ZaloPay</p>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-500">
        © 2026 ZenGoSystem. All rights reserved.
      </div>
    </footer>
  );
}

export default function MainLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && user) {
      if (user.vai_tro === "shipper" && !location.pathname.startsWith("/shipper")) {
        navigate("/shipper");
      } else if (user.vai_tro === "admin" && !location.pathname.startsWith("/admin")) {
        navigate("/admin");
      }
    }
  }, [user, loading, location.pathname, navigate]);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-slate-900">
      <Header />
      <main className="min-h-[60vh]">
        <Outlet />
      </main>
      <Footer />
      {user && ["nguoi_mua", "user", "seller"].includes(user.vai_tro) && <FloatingChatWidget user={user} />}
    </div>
  );
}
