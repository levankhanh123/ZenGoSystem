import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye, EyeOff, Mail, Lock, User, Phone,
  AlertCircle, Loader2, CheckCircle
} from "lucide-react";
import { useAuth } from "../../contexts/Authcontext.jsx";
import AuthLayout from "./AuthLayout.jsx";

/**
 * Register  —  /register
 * Mapping với bảng nguoi_dung:
 *   ho_ten, email, so_dien_thoai, mat_khau, vai_tro (mặc định "user")
 */
export default function Register() {
  const navigate = useNavigate();
  const { register, loading, error, clearError } = useAuth();

  const [form, setForm] = useState({
    ho_ten:        "",
    email:         "",
    so_dien_thoai: "",
    mat_khau:      "",
    xac_nhan_mk:   "",
  });
  const [showPw,  setShowPw]  = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [agreed,  setAgreed]  = useState(false);
  const [fieldErr,setFieldErr]= useState({});
  const [step,    setStep]    = useState(1); // 1: thông tin cơ bản, 2: mật khẩu

  /* ── Field change ── */
  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    setFieldErr(e => ({ ...e, [field]: undefined }));
    if (error) clearError();
  };

  /* ── Password strength ── */
  const pwStrength = (() => {
    const p = form.mat_khau;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8)           s++;
    if (/[A-Z]/.test(p))         s++;
    if (/[0-9]/.test(p))         s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();
  const pwLabels = ["", "Yếu", "Trung bình", "Khá mạnh", "Rất mạnh"];
  const pwColors = ["", "bg-red-400", "bg-yellow-400", "bg-blue-400", "bg-green-500"];

  /* ── Step 1 validation ── */
  const validateStep1 = () => {
    const errs = {};
    if (!form.ho_ten.trim())          errs.ho_ten = "Vui lòng nhập họ và tên.";
    else if (form.ho_ten.trim().length < 3) errs.ho_ten = "Họ tên ít nhất 3 ký tự.";
    if (!form.email.trim())           errs.email  = "Vui lòng nhập email.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Email không hợp lệ.";
    if (form.so_dien_thoai && !/^(0[3-9]\d{8})$/.test(form.so_dien_thoai))
      errs.so_dien_thoai = "Số điện thoại không hợp lệ (VD: 0912345678).";
    return errs;
  };

  /* ── Step 2 validation ── */
  const validateStep2 = () => {
    const errs = {};
    if (!form.mat_khau)          errs.mat_khau  = "Vui lòng nhập mật khẩu.";
    else if (form.mat_khau.length < 8) errs.mat_khau = "Mật khẩu ít nhất 8 ký tự.";
    if (form.mat_khau !== form.xac_nhan_mk) errs.xac_nhan_mk = "Mật khẩu xác nhận không khớp.";
    if (!agreed)                 errs.terms     = "Bạn phải đồng ý với điều khoản.";
    return errs;
  };

  const handleNext = (e) => {
    e.preventDefault();
    const errs = validateStep1();
    if (Object.keys(errs).length) { setFieldErr(errs); return; }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateStep2();
    if (Object.keys(errs).length) { setFieldErr(errs); return; }

    const result = await register({
      ho_ten:        form.ho_ten.trim(),
      email:         form.email.trim(),
      so_dien_thoai: form.so_dien_thoai.trim() || undefined,
      mat_khau:      form.mat_khau,
    });

    if (result.success) {
      navigate("/");
    }
  };

  return (
    <AuthLayout
      title={step === 1 ? "Tạo tài khoản mới 🎉" : "Thiết lập mật khẩu 🔒"}
      subtitle={step === 1
        ? "Điền thông tin để bắt đầu mua sắm tại ZenGo"
        : "Tạo mật khẩu bảo mật cho tài khoản của bạn"}
      switchText="Đã có tài khoản?"
      switchLink="/login"
      switchLabel="Đăng nhập"
    >
      {/* ── Step indicator ── */}
      <StepIndicator current={step} />

      {/* ── API Error ── */}
      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200
                        text-red-700 rounded-2xl px-4 py-3.5 mb-5 animate-fade-in">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          Step 1: Thông tin cơ bản
      ═══════════════════════════════════════════ */}
      {step === 1 && (
        <form onSubmit={handleNext} className="space-y-5" noValidate>

          {/* Ho ten */}
          <div>
            <label className={labelCls}>Họ và tên *</label>
            <div className="relative">
              <User size={16} className={iconCls} />
              <input type="text" autoComplete="name"
                     value={form.ho_ten}
                     onChange={e => handleChange("ho_ten", e.target.value)}
                     placeholder="Nguyễn Văn A"
                     className={inputCls(fieldErr.ho_ten)}
                     style={{ paddingLeft:"2.75rem" }} />
            </div>
            {fieldErr.ho_ten && <FieldError msg={fieldErr.ho_ten} />}
          </div>

          {/* Email */}
          <div>
            <label className={labelCls}>Email *</label>
            <div className="relative">
              <Mail size={16} className={iconCls} />
              <input type="email" autoComplete="email"
                     value={form.email}
                     onChange={e => handleChange("email", e.target.value)}
                     placeholder="email@example.com"
                     className={inputCls(fieldErr.email)}
                     style={{ paddingLeft:"2.75rem" }} />
            </div>
            {fieldErr.email && <FieldError msg={fieldErr.email} />}
          </div>

          {/* So dien thoai */}
          <div>
            <label className={labelCls}>
              Số điện thoại
              <span className="text-gray-400 font-normal normal-case ml-1">(tùy chọn)</span>
            </label>
            <div className="relative">
              <Phone size={16} className={iconCls} />
              <input type="tel" autoComplete="tel"
                     value={form.so_dien_thoai}
                     onChange={e => handleChange("so_dien_thoai", e.target.value)}
                     placeholder="0912 345 678"
                     className={inputCls(fieldErr.so_dien_thoai)}
                     style={{ paddingLeft:"2.75rem" }} />
            </div>
            {fieldErr.so_dien_thoai && <FieldError msg={fieldErr.so_dien_thoai} />}
          </div>

          {/* Vai tro (readonly) */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3
                          flex items-center gap-3">
            <span className="text-xl">🛍️</span>
            <div>
              <p className="text-sm font-bold text-blue-800">Vai trò: Người dùng</p>
              <p className="text-xs text-blue-600 mt-0.5">
                Bạn có thể mua sắm và đánh giá sản phẩm
              </p>
            </div>
          </div>

          <button type="submit"
                  className="w-full bg-gradient-to-r from-[#e8175d] to-[#ff6b35]
                             hover:from-[#c0114d] hover:to-[#e8175d] text-white
                             font-extrabold py-3.5 rounded-2xl shadow-lg hover:shadow-xl
                             hover:-translate-y-0.5 active:scale-95 transition-all text-base">
            Tiếp theo →
          </button>
        </form>
      )}

      {/* ═══════════════════════════════════════════
          Step 2: Mật khẩu
      ═══════════════════════════════════════════ */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>

          {/* Recap thông tin */}
          <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3
                          flex items-center gap-3">
            <CheckCircle size={18} className="text-green-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-green-800 truncate">{form.ho_ten}</p>
              <p className="text-xs text-green-600 truncate">{form.email}</p>
            </div>
            <button type="button" onClick={() => setStep(1)}
                    className="ml-auto text-xs text-green-700 font-bold hover:underline shrink-0">
              Sửa
            </button>
          </div>

          {/* Mat khau */}
          <div>
            <label className={labelCls}>Mật khẩu *</label>
            <div className="relative">
              <Lock size={16} className={iconCls} />
              <input type={showPw ? "text" : "password"} autoComplete="new-password"
                     value={form.mat_khau}
                     onChange={e => handleChange("mat_khau", e.target.value)}
                     placeholder="Ít nhất 8 ký tự"
                     className={inputCls(fieldErr.mat_khau)}
                     style={{ paddingLeft:"2.75rem", paddingRight:"3rem" }} />
              <button type="button" onClick={() => setShowPw(s => !s)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {fieldErr.mat_khau && <FieldError msg={fieldErr.mat_khau} />}

            {/* Strength bar */}
            {form.mat_khau && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300
                                             ${i <= pwStrength ? pwColors[pwStrength] : "bg-gray-200"}`} />
                  ))}
                </div>
                <p className={`text-xs font-semibold ${
                  pwStrength <= 1 ? "text-red-500"
                  : pwStrength === 2 ? "text-yellow-600"
                  : pwStrength === 3 ? "text-blue-600"
                  : "text-green-600"
                }`}>
                  Độ mạnh: {pwLabels[pwStrength]}
                </p>
              </div>
            )}
          </div>

          {/* Xac nhan mat khau */}
          <div>
            <label className={labelCls}>Xác nhận mật khẩu *</label>
            <div className="relative">
              <Lock size={16} className={iconCls} />
              <input type={showCPw ? "text" : "password"} autoComplete="new-password"
                     value={form.xac_nhan_mk}
                     onChange={e => handleChange("xac_nhan_mk", e.target.value)}
                     placeholder="Nhập lại mật khẩu"
                     className={inputCls(fieldErr.xac_nhan_mk)}
                     style={{ paddingLeft:"2.75rem", paddingRight:"3rem" }} />
              <button type="button" onClick={() => setShowCPw(s => !s)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showCPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {fieldErr.xac_nhan_mk && <FieldError msg={fieldErr.xac_nhan_mk} />}
            {/* Match indicator */}
            {form.xac_nhan_mk && form.mat_khau === form.xac_nhan_mk && (
              <p className="flex items-center gap-1.5 text-green-600 text-xs font-semibold mt-1.5">
                <CheckCircle size={12} /> Mật khẩu khớp!
              </p>
            )}
          </div>

          {/* Terms */}
          <div>
            <label className="flex items-start gap-3 cursor-pointer group select-none">
              <div
                onClick={() => { setAgreed(a => !a); setFieldErr(e => ({ ...e, terms:undefined })); }}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center
                            shrink-0 mt-0.5 transition-all duration-150 cursor-pointer
                            ${agreed
                              ? "bg-[#e8175d] border-[#e8175d]"
                              : fieldErr.terms
                                ? "border-red-400"
                                : "border-gray-300 group-hover:border-pink-400"}`}
              >
                {agreed && (
                  <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                    <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span className="text-sm text-gray-600 leading-relaxed">
                Tôi đồng ý với{" "}
                <a href="#" className="text-[#e8175d] font-bold hover:underline">Điều khoản dịch vụ</a>
                {" "}và{" "}
                <a href="#" className="text-[#e8175d] font-bold hover:underline">Chính sách bảo mật</a>
                {" "}của ZenGo
              </span>
            </label>
            {fieldErr.terms && <FieldError msg={fieldErr.terms} />}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(1)}
                    className="flex-none px-5 py-3.5 border-2 border-gray-200 rounded-2xl
                               font-bold text-gray-600 hover:border-gray-300
                               active:scale-95 transition-all text-sm">
              ← Quay lại
            </button>
            <button type="submit" disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2
                               bg-gradient-to-r from-[#e8175d] to-[#ff6b35]
                               hover:from-[#c0114d] hover:to-[#e8175d]
                               text-white font-extrabold py-3.5 rounded-2xl shadow-lg
                               hover:shadow-xl hover:-translate-y-0.5 active:scale-95
                               disabled:opacity-70 disabled:cursor-not-allowed
                               transition-all duration-200 text-base">
              {loading
                ? <><Loader2 size={18} className="animate-spin" /> Đang tạo...</>
                : "🎉 Tạo tài khoản"
              }
            </button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}

/* ─── Step indicator ─────────────────────────────────────── */
function StepIndicator({ current }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {[1, 2].map((s, i) => (
        <div key={s} className="flex items-center gap-2 flex-1">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center
                           text-sm font-extrabold transition-all duration-300
                           ${current >= s
                             ? "bg-[#e8175d] text-white shadow-md"
                             : "bg-gray-200 text-gray-400"}`}>
            {current > s ? (
              <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            ) : s}
          </div>
          <span className={`text-xs font-bold transition-colors ${current >= s ? "text-[#e8175d]" : "text-gray-400"}`}>
            {s === 1 ? "Thông tin" : "Mật khẩu"}
          </span>
          {i < 1 && (
            <div className={`flex-1 h-0.5 rounded-full transition-all duration-300
                             ${current > s ? "bg-[#e8175d]" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Shared style helpers ───────────────────────────────── */
const labelCls = "block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide";

const iconCls  = "absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none";

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