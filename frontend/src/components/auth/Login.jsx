import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../../contexts/Authcontext.jsx";
import { useCart } from "../../contexts/CartContext.jsx";
import AuthLayout from "./Authlayout.jsx";

/**
 * Login  —  /login
 */
export default function Login() {
  const navigate                               = useNavigate();
  const { login, loading, error, clearError }  = useAuth();  // ✅ set user → navbar hiện tên
  const { onLogin }                            = useCart();   // ✅ fetch giỏ hàng đúng user

  const [form, setForm]         = useState({ email: "", mat_khau: "" });
  const [showPw, setShowPw]     = useState(false);
  const [remember, setRemember] = useState(false);
  const [fieldErr, setFieldErr] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.email.trim())                     errs.email    = "Vui lòng nhập email.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email    = "Email không hợp lệ.";
    if (!form.mat_khau)                         errs.mat_khau = "Vui lòng nhập mật khẩu.";
    return errs;
  };

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    setFieldErr(e => ({ ...e, [field]: undefined }));
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErr(errs); return; }

    // AuthContext.login(): gọi API + setUser(res.user) + localStorage.setItem("token")
    const result = await login(form);

    if (result.success) {
      // Báo CartContext fetch giỏ hàng của user vừa login (không cần F5)
      const token = localStorage.getItem("token");
      onLogin(token);

      // Điều hướng dựa trên vai trò
      if (result.user.vai_tro === "admin") {
        navigate("/admin");
      } else if (result.user.vai_tro === "shipper") {
        navigate("/shipper");
      } else {
        // Seller và User thường sẽ vào trang chủ trước
        navigate("/");
      }
    }
  };

  return (
    <AuthLayout
      title="Chào mừng trở lại!"
      subtitle="Đăng nhập để tiếp tục mua sắm tại ZenGo"
      switchText="Chưa có tài khoản?"
      switchLink="/register"
      switchLabel="Đăng ký ngay"
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>

        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200
                          text-red-700 rounded-2xl px-4 py-3.5 animate-fade-in">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
            Email *
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="email" autoComplete="email"
              value={form.email}
              onChange={e => handleChange("email", e.target.value)}
              placeholder="email@example.com"
              className={inputCls(fieldErr.email)}
              style={{ paddingLeft: "2.75rem" }}
            />
          </div>
          {fieldErr.email && <FieldError msg={fieldErr.email} />}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Mật khẩu *</label>
            <Link to="/forgot-password" className="text-xs text-[#e8175d] font-bold hover:underline">
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type={showPw ? "text" : "password"} autoComplete="current-password"
              value={form.mat_khau}
              onChange={e => handleChange("mat_khau", e.target.value)}
              placeholder="Nhập mật khẩu"
              className={inputCls(fieldErr.mat_khau)}
              style={{ paddingLeft: "2.75rem", paddingRight: "3rem" }}
            />
            <button type="button" onClick={() => setShowPw(s => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {fieldErr.mat_khau && <FieldError msg={fieldErr.mat_khau} />}
        </div>

        {/* Remember */}
        <label className="flex items-center gap-3 cursor-pointer group select-none">
          <div
            onClick={() => setRemember(r => !r)}
            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center
                        transition-all duration-150 shrink-0 cursor-pointer
                        ${remember ? "bg-[#e8175d] border-[#e8175d]" : "border-gray-300 group-hover:border-pink-400"}`}
          >
            {remember && (
              <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <span className="text-sm text-gray-600 font-medium">Ghi nhớ đăng nhập</span>
        </label>

        {/* Submit */}
        <button
          type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2
                     bg-gradient-to-r from-[#e8175d] to-[#ff6b35]
                     hover:from-[#c0114d] hover:to-[#e8175d]
                     text-white font-extrabold py-3.5 rounded-2xl shadow-lg
                     hover:shadow-xl hover:-translate-y-0.5
                     active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed
                     transition-all duration-200 text-base"
        >
          {loading ? <><Loader2 size={18} className="animate-spin" /> Đang đăng nhập...</> : "Đăng nhập →"}
        </button>

        <Divider />


      </form>
    </AuthLayout>
  );
}

const inputCls = (err) => `
  w-full px-4 py-3 rounded-2xl border-2 text-sm text-gray-800 bg-white
  outline-none placeholder:text-gray-400 transition-all duration-150
  ${err
    ? "border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100"
    : "border-gray-200 focus:border-[#e8175d] focus:ring-2 focus:ring-pink-100"
  }
`;

const FieldError = ({ msg }) => (
  <p className="flex items-center gap-1.5 text-red-500 text-xs font-semibold mt-1.5">
    <AlertCircle size={12} /> {msg}
  </p>
);

const Divider = () => (
  <div className="flex items-center gap-3">
    <div className="flex-1 h-px bg-gray-200" />
    <span className="text-xs text-gray-400 font-medium whitespace-nowrap">hoặc tiếp tục với</span>
    <div className="flex-1 h-px bg-gray-200" />
  </div>
);
