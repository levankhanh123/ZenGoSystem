import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/Authcontext.jsx";
import { useCart } from "../../contexts/CartContext.jsx";

// ─── ICONS ────────────────────────────────────────────────────────────────────
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const CartIcon = ({ count = 0 }) => (
  <span className="relative flex items-center">
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
    {count > 0 && (
      <span className="absolute -top-2 -right-2 min-w-[16px] h-4 bg-[#e91e8c] text-white
                       text-[9px] font-black rounded-full flex items-center justify-center px-1 leading-none">
        {count > 99 ? "99+" : count}
      </span>
    )}
  </span>
);

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

const TiktokIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.79a4.85 4.85 0 0 1-1.01-.1z" />
  </svg>
);

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.76 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.67 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.13 6.13l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const MapPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 inline mr-1 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

// ─── NAV LINKS ────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Trang chủ", to: "/"        },
  { label: "Sản phẩm",  to: "/product" },
  { label: "Shop",      to: "/shop"    },
  { label: "Voucher",   to: "/voucher" },
  { label: "Giỏ hàng", to: "/cart", isCart: true },
];

// ─── HEADER ───────────────────────────────────────────────────────────────────
function Header() {
  const location   = useLocation();
  const navigate   = useNavigate();
  const { user }   = useAuth();

  const { logout: authLogout }          = useAuth();   // clear user
  const { totalItems, logout: cartLogout } = useCart(); // clear token + items

  const displayName = user ? user.ho_ten.split(" ").pop() : null;
  const initials    = user
    ? user.ho_ten.split(" ").slice(-2).map(w => w[0].toUpperCase()).join("")
    : "";

  const handleLogout = () => {
    authLogout();   // ✅ AuthContext: setUser(null)
    cartLogout();   // ✅ CartContext: xoá token, clear giỏ hàng
    navigate("/");
  };

  return (
    <header className="w-full bg-white sticky top-0 z-50"
            style={{ boxShadow: "0 2px 16px rgba(233,30,140,0.08)" }}>

      {/* ── Top bar ── */}
      <div className="bg-gradient-to-r from-[#fce4ec] to-[#f7d6d0] px-6 py-1.5
                      flex justify-end items-center gap-3">
        {user ? (
          <>
            <button
              onClick={() => navigate("/account")}
              className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#e91e8c]
                         transition-colors group"
            >
              <span className="w-7 h-7 rounded-full bg-[#e91e8c] flex items-center justify-center
                               text-white text-[11px] font-extrabold shadow-sm
                               group-hover:bg-[#c0114d] transition-colors overflow-hidden">
                {user.anh_dai_dien
                  ? <img src={user.anh_dai_dien} alt="" className="w-full h-full object-cover" />
                  : initials
                }
              </span>
              <span className="font-semibold text-gray-700 group-hover:text-[#e91e8c]">
                Hi, {displayName}
              </span>
            </button>

            <span className="text-gray-300 text-xs">|</span>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-xs text-gray-500
                         hover:text-[#e91e8c] transition-colors duration-200 font-medium"
            >
              <LogoutIcon />
              Đăng xuất
            </button>
          </>
        ) : (
          <>
            <Link to="/login"
              className="text-xs font-semibold text-gray-600 hover:text-[#e91e8c]
                         transition-colors flex items-center gap-1"
            >
              <UserIcon />
              Đăng nhập
            </Link>
            <span className="text-gray-300 text-xs">|</span>
            <Link to="/register"
              className="text-xs font-bold text-[#e91e8c] hover:underline transition-colors"
            >
              Đăng ký
            </Link>
          </>
        )}
      </div>

      {/* ── Main nav ── */}
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center">

        {/* Logo */}
        <Link to="/" className="flex-shrink-0 mr-12">
          <span
            className="text-3xl font-black tracking-tight select-none"
            style={{
              background: "linear-gradient(135deg, #e91e8c 0%, #ff6b6b 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontFamily: "'Georgia', serif",
              letterSpacing: "-1.5px",
            }}
          >
            zenGo
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex-1 flex items-center justify-center gap-10">
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative flex items-center gap-2 text-base font-semibold
                            tracking-wide transition-colors duration-200 group pb-1
                            ${isActive ? "text-[#e91e8c]" : "text-gray-600 hover:text-[#e91e8c]"}`}
              >
                {link.isCart ? <CartIcon count={totalItems} /> : null}
                {link.label}

                <span
                  className="absolute bottom-0 left-0 h-[2px] rounded-full
                             bg-gradient-to-r from-[#e91e8c] to-[#ff6b6b]
                             transition-all duration-300"
                  style={{ width: isActive ? "100%" : "0%" }}
                />
                {!isActive && (
                  <span className="absolute bottom-0 left-0 h-[2px] rounded-full
                                   bg-gradient-to-r from-[#e91e8c] to-[#ff6b6b]
                                   w-0 group-hover:w-full transition-all duration-300" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-[#1a1a2e] text-gray-300 pt-10 pb-5 mt-auto">
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">

        {/* Col 1 – Brand */}
        <div>
          <span
            className="text-2xl font-black tracking-tight"
            style={{
              background: "linear-gradient(135deg, #e91e8c 0%, #ff6b6b 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontFamily: "'Georgia', serif",
            }}
          >
            ZenGo
          </span>
          <p className="mt-3 text-gray-400 leading-relaxed text-xs">
            ZenGo là trang thương mại điện tử cung cấp các mặt hàng thời trang nữ
            với giá cả phải chăng và chất lượng tốt nhất cho khách hàng.
          </p>
          <div className="flex items-center gap-3 mt-4">
            <a href="#" className="text-gray-400 hover:text-[#e91e8c] transition-colors"><FacebookIcon /></a>
            <a href="#" className="text-gray-400 hover:text-[#e91e8c] transition-colors"><InstagramIcon /></a>
            <a href="#" className="text-gray-400 hover:text-[#e91e8c] transition-colors"><TiktokIcon /></a>
          </div>
        </div>

        {/* Col 2 – Liên hệ */}
        <div>
          <h4 className="text-white font-semibold mb-3 uppercase tracking-wide text-xs">Liên hệ</h4>
          <ul className="space-y-2 text-xs text-gray-400">
            <li className="flex items-start">
              <MapPinIcon />
              <span>22 Đường Hoàng Hoa Thám, P.7, Quận 5, TP.HCM</span>
            </li>
            <li>
              <PhoneIcon />
              <a href="tel:0123456789" className="hover:text-[#e91e8c] transition-colors">0123 23 24</a>
            </li>
            <li>
              <MailIcon />
              <a href="mailto:thaithiqua@gmail.com" className="hover:text-[#e91e8c] transition-colors">
                thaithiqua@gmail.com
              </a>
            </li>
          </ul>
        </div>

        {/* Col 3 – Chính sách + Thanh toán */}
        <div className="flex flex-col gap-6 md:flex-row md:gap-0 md:justify-between">
          <div>
            <h4 className="text-white font-semibold mb-3 uppercase tracking-wide text-xs">Chính sách</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              {["Chính sách vận chuyển","Chính sách đổi trả","Chính sách bảo mật","Điều khoản dịch vụ"].map(item => (
                <li key={item}><a href="#" className="hover:text-[#e91e8c] transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 uppercase tracking-wide text-xs">Phương thức thanh toán</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              {["Thanh toán khi nhận hàng","Trả trước","Momo","PayPal"].map(item => (
                <li key={item} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e91e8c] flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-gray-700 pt-4 text-center text-xs text-gray-500">
        © 2024 ZenGo. All rights reserved.
      </div>
    </footer>
  );
}

// ─── MAIN LAYOUT ──────────────────────────────────────────────────────────────
export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fdf6f4]">
      <Header />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}