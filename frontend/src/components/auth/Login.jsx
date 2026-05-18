import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { useAuth } from "../../contexts/Authcontext.jsx";
import { useCart } from "../../contexts/CartContext.jsx";
import AuthLayout from "./Authlayout.jsx";

export default function Login() {
  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuth();
  const { onLogin } = useCart();
  const [form, setForm] = useState({ email: "", mat_khau: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErr, setFieldErr] = useState({});

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErr((current) => ({ ...current, [field]: undefined }));
    if (error) clearError();
  };

  const validate = () => {
    const errors = {};
    if (!form.email.trim()) errors.email = "Vui lòng nhập email.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = "Email không hợp lệ.";
    if (!form.mat_khau) errors.mat_khau = "Vui lòng nhập mật khẩu.";
    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length) {
      setFieldErr(errors);
      return;
    }

    const result = await login(form);
    if (!result.success) return;

    const token = localStorage.getItem("token");
    onLogin(token);

    if (result.user.vai_tro === "admin") navigate("/admin");
    else if (result.user.vai_tro === "shipper") navigate("/shipper");
    else navigate("/");
  };

  return (
    <AuthLayout
      title="Đăng nhập"
      subtitle="Chào mừng trở lại."
      switchText="Bạn chưa có tài khoản?"
      switchLink="/register"
      switchLabel="Đăng ký ngay"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && (
          <div className="flex gap-3 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <Field label="Email" error={fieldErr.email}>
          <Mail size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="email"
            value={form.email}
            onChange={(event) => handleChange("email", event.target.value)}
            placeholder="email@example.com"
            autoComplete="email"
            className={inputClass(fieldErr.email, "pl-10")}
          />
        </Field>

        <Field label="Mật khẩu" error={fieldErr.mat_khau} action={<Link to="/forgot-password" className="text-xs font-semibold text-[#f7452f]">Quên mật khẩu?</Link>}>
          <Lock size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type={showPassword ? "text" : "password"}
            value={form.mat_khau}
            onChange={(event) => handleChange("mat_khau", event.target.value)}
            placeholder="Mật khẩu"
            autoComplete="current-password"
            className={inputClass(fieldErr.mat_khau, "pl-10 pr-10")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
            aria-label="Ẩn hiện mật khẩu"
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </Field>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-sm bg-[#f7452f] text-sm font-bold text-white transition hover:bg-[#e83f24] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : null}
          Đăng nhập
        </button>
      </form>
    </AuthLayout>
  );
}

function Field({ label, error, action, children }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-sm font-bold text-slate-700">{label}</label>
        {action}
      </div>
      <div className="relative">{children}</div>
      {error && <p className="mt-1.5 text-xs font-semibold text-red-500">{error}</p>}
    </div>
  );
}

function inputClass(error, extra = "") {
  return `h-11 w-full rounded-sm border bg-white px-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 ${extra} ${
    error ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-[#f7452f]"
  }`;
}
