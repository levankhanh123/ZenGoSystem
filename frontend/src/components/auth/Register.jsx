import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Check, Eye, EyeOff, Loader2, Lock, Mail, Phone, User } from "lucide-react";
import { useAuth } from "../../contexts/Authcontext.jsx";
import AuthLayout from "./Authlayout.jsx";

export default function Register() {
  const navigate = useNavigate();
  const { register, loading, error, clearError } = useAuth();
  const [form, setForm] = useState({
    ho_ten: "",
    email: "",
    so_dien_thoai: "",
    mat_khau: "",
    xac_nhan_mk: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [fieldErr, setFieldErr] = useState({});

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErr((current) => ({ ...current, [field]: undefined }));
    if (error) clearError();
  };

  const validate = () => {
    const errors = {};
    if (!form.ho_ten.trim()) errors.ho_ten = "Vui lòng nhập họ tên.";
    else if (form.ho_ten.trim().length < 3) errors.ho_ten = "Họ tên cần ít nhất 3 ký tự.";

    if (!form.email.trim()) errors.email = "Vui lòng nhập email.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = "Email không hợp lệ.";

    if (form.so_dien_thoai && !/^(0[3-9]\d{8})$/.test(form.so_dien_thoai)) {
      errors.so_dien_thoai = "Số điện thoại không hợp lệ.";
    }

    if (!form.mat_khau) errors.mat_khau = "Vui lòng nhập mật khẩu.";
    else if (form.mat_khau.length < 8) errors.mat_khau = "Mật khẩu cần ít nhất 8 ký tự.";

    if (form.mat_khau !== form.xac_nhan_mk) errors.xac_nhan_mk = "Mật khẩu xác nhận không khớp.";
    if (!agreed) errors.terms = "Bạn cần đồng ý với điều khoản sử dụng.";
    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length) {
      setFieldErr(errors);
      return;
    }

    const result = await register({
      ho_ten: form.ho_ten.trim(),
      email: form.email.trim(),
      so_dien_thoai: form.so_dien_thoai.trim() || undefined,
      mat_khau: form.mat_khau,
    });

    if (result.success) navigate("/");
  };

  return (
    <AuthLayout
      title="Tạo tài khoản"
      subtitle="Thông tin cơ bản."
      switchText="Bạn đã có tài khoản?"
      switchLink="/login"
      switchLabel="Đăng nhập"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && (
          <div className="flex gap-3 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <Field label="Họ và tên" error={fieldErr.ho_ten}>
          <User size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={form.ho_ten}
            onChange={(event) => handleChange("ho_ten", event.target.value)}
            placeholder="Nguyễn Văn A"
            autoComplete="name"
            className={inputClass(fieldErr.ho_ten, "pl-10")}
          />
        </Field>

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

        <Field label="Số điện thoại" error={fieldErr.so_dien_thoai}>
          <Phone size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="tel"
            value={form.so_dien_thoai}
            onChange={(event) => handleChange("so_dien_thoai", event.target.value)}
            placeholder="0912345678"
            autoComplete="tel"
            className={inputClass(fieldErr.so_dien_thoai, "pl-10")}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Mật khẩu" error={fieldErr.mat_khau}>
            <Lock size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              value={form.mat_khau}
              onChange={(event) => handleChange("mat_khau", event.target.value)}
              placeholder="Ít nhất 8 ký tự"
              autoComplete="new-password"
              className={inputClass(fieldErr.mat_khau, "pl-10 pr-10")}
            />
            <ToggleButton active={showPassword} onClick={() => setShowPassword((value) => !value)} />
          </Field>

          <Field label="Xác nhận" error={fieldErr.xac_nhan_mk}>
            <Lock size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type={showConfirm ? "text" : "password"}
              value={form.xac_nhan_mk}
              onChange={(event) => handleChange("xac_nhan_mk", event.target.value)}
              placeholder="Nhập lại mật khẩu"
              autoComplete="new-password"
              className={inputClass(fieldErr.xac_nhan_mk, "pl-10 pr-10")}
            />
            <ToggleButton active={showConfirm} onClick={() => setShowConfirm((value) => !value)} />
          </Field>
        </div>

        <button
          type="button"
          onClick={() => {
            setAgreed((value) => !value);
            setFieldErr((current) => ({ ...current, terms: undefined }));
          }}
          className="flex items-start gap-3 text-left text-sm text-slate-600"
        >
          <span
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border ${
              agreed ? "border-[#f7452f] bg-[#f7452f] text-white" : "border-slate-300 bg-white"
            }`}
          >
            {agreed && <Check size={14} />}
          </span>
          Tôi đồng ý với điều khoản sử dụng và chính sách bảo mật của ZenGo.
        </button>
        {fieldErr.terms && <p className="-mt-2 text-xs font-semibold text-red-500">{fieldErr.terms}</p>}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-sm bg-[#f7452f] text-sm font-bold text-white transition hover:bg-[#e83f24] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : null}
          Đăng ký
        </button>
      </form>
    </AuthLayout>
  );
}

function ToggleButton({ active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
      aria-label="Ẩn hiện mật khẩu"
    >
      {active ? <EyeOff size={17} /> : <Eye size={17} />}
    </button>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-bold text-slate-700">{label}</label>
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
