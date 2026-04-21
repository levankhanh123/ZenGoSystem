// components/account/ProfileTab.jsx
import { useState, useRef } from "react";
import { Camera, Save, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";

const inputCls = `w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm
  text-gray-800 bg-white outline-none
  focus:border-[#e8175d] focus:ring-2 focus:ring-pink-100
  placeholder:text-gray-400 transition-all duration-150`;

export default function ProfileTab({ user, onUpdate, onAvatarChange, onChangePassword }) {
  const [form, setForm] = useState({
    ho_ten:        user.ho_ten,
    email:         user.email,
    so_dien_thoai: user.so_dien_thoai ?? "",
  });
  const [passwords, setPasswords] = useState({ mat_khau_cu: "", mat_khau_moi: "", xac_nhan: "" });
  const [showPw,   setShowPw]     = useState({ cu: false, moi: false, xn: false });
  const [avatar,   setAvatar]     = useState(user.anh_dai_dien);

  // Feedback states
  const [profileState, setProfileState] = useState(null); // null | "saving" | "ok" | "err"
  const [profileErr,   setProfileErr]   = useState("");
  const [pwState,      setPwState]      = useState(null);
  const [pwErr,        setPwErr]        = useState("");
  const [avatarLoading, setAvatarLoading] = useState(false);

  const fileRef = useRef(null);
  const initials = user.ho_ten.split(" ").slice(-2).map((w) => w[0].toUpperCase()).join("");

  /* ── Handlers ── */
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileState("saving");
    setProfileErr("");
    try {
      await onUpdate(form);
      setProfileState("ok");
      setTimeout(() => setProfileState(null), 2500);
    } catch (err) {
      setProfileState("err");
      setProfileErr(err.message);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    setPwErr("");
    if (passwords.mat_khau_moi.length < 8) { setPwErr("Mật khẩu mới phải có ít nhất 8 ký tự."); return; }
    if (passwords.mat_khau_moi !== passwords.xac_nhan) { setPwErr("Xác nhận mật khẩu không khớp."); return; }
    setPwState("saving");
    try {
      await onChangePassword({ mat_khau_cu: passwords.mat_khau_cu, mat_khau_moi: passwords.mat_khau_moi });
      setPwState("ok");
      setPasswords({ mat_khau_cu: "", mat_khau_moi: "", xac_nhan: "" });
      setTimeout(() => setPwState(null), 2500);
    } catch (err) {
      setPwState("err");
      setPwErr(err.message);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatar(URL.createObjectURL(file));
    setAvatarLoading(true);
    try {
      await onAvatarChange(file);
    } catch {
      /* silent */
    } finally {
      setAvatarLoading(false);
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("vi-VN") : "—";

  return (
    <div className="space-y-6">
      <SectionHeader title="Thông tin cá nhân" sub="Cập nhật ảnh đại diện và thông tin cá nhân của bạn" />

      {/* ── Avatar + basic info ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-8">

          {/* Avatar */}
          <div className="flex flex-col items-center gap-3 shrink-0">
            <div className="relative">
              <div className={`w-28 h-28 rounded-full overflow-hidden border-4 border-pink-100
                shadow-md flex items-center justify-center bg-pink-50
                ${avatarLoading ? "opacity-50" : ""}`}>
                {avatar
                  ? <img src={avatar} alt="" className="w-full h-full object-cover" />
                  : <span className="text-3xl font-extrabold text-[#e8175d]">{initials}</span>
                }
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={avatarLoading}
                className="absolute bottom-0 right-0 w-8 h-8 bg-[#e8175d] rounded-full
                  flex items-center justify-center shadow-lg border-2 border-white
                  hover:bg-[#c0114d] transition-colors disabled:opacity-50"
              >
                <Camera size={14} className="text-white" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <p className="text-xs text-gray-400 text-center max-w-[120px]">JPG, PNG tối đa 2MB</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSaveProfile} className="flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Họ và tên *">
                <input type="text" required value={form.ho_ten}
                  onChange={(e) => setForm((f) => ({ ...f, ho_ten: e.target.value }))}
                  className={inputCls} placeholder="Nguyễn Văn A" />
              </Field>
              <Field label="Email *">
                <input type="email" required value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className={inputCls} placeholder="email@example.com" />
              </Field>
              <Field label="Số điện thoại">
                <input type="tel" value={form.so_dien_thoai}
                  onChange={(e) => setForm((f) => ({ ...f, so_dien_thoai: e.target.value }))}
                  className={inputCls} placeholder="0900 000 000" />
              </Field>
              <Field label="Vai trò">
                <input type="text" readOnly value="Người mua"
                  className={`${inputCls} bg-gray-50 text-gray-400 cursor-default`} />
              </Field>
            </div>

            <div className="flex gap-6 pt-1 text-xs text-gray-400">
              <span>Tham gia: <strong className="text-gray-500">{formatDate(user.created_at)}</strong></span>
              <span>Trạng thái: <strong className="text-green-600">Đang hoạt động</strong></span>
            </div>

            {profileErr && (
              <p className="flex items-center gap-1.5 text-red-500 text-xs font-semibold">
                <AlertCircle size={13} /> {profileErr}
              </p>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={profileState === "saving"}
                className="flex items-center gap-2 bg-[#e8175d] hover:bg-[#c0114d]
                  text-white font-bold px-6 py-2.5 rounded-xl shadow hover:shadow-lg
                  active:scale-95 transition-all text-sm disabled:opacity-60">
                <Save size={15} />
                {profileState === "saving" ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
              {profileState === "ok" && (
                <span className="flex items-center gap-1.5 text-green-600 text-sm font-semibold">
                  <CheckCircle size={15} /> Đã lưu!
                </span>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* ── Change password ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-extrabold text-gray-800 mb-4">🔒 Đổi mật khẩu</h3>
        <form onSubmit={handleSavePassword} className="space-y-4 max-w-md">
          <Field label="Mật khẩu hiện tại *">
            <PasswordInput value={passwords.mat_khau_cu}
              onChange={(v) => setPasswords((p) => ({ ...p, mat_khau_cu: v }))}
              show={showPw.cu} onToggle={() => setShowPw((s) => ({ ...s, cu: !s.cu }))}
              placeholder="Nhập mật khẩu hiện tại" />
          </Field>
          <Field label="Mật khẩu mới *">
            <PasswordInput value={passwords.mat_khau_moi}
              onChange={(v) => setPasswords((p) => ({ ...p, mat_khau_moi: v }))}
              show={showPw.moi} onToggle={() => setShowPw((s) => ({ ...s, moi: !s.moi }))}
              placeholder="Ít nhất 8 ký tự" />
            {passwords.mat_khau_moi && <StrengthBar password={passwords.mat_khau_moi} />}
          </Field>
          <Field label="Xác nhận mật khẩu mới *">
            <PasswordInput value={passwords.xac_nhan}
              onChange={(v) => setPasswords((p) => ({ ...p, xac_nhan: v }))}
              show={showPw.xn} onToggle={() => setShowPw((s) => ({ ...s, xn: !s.xn }))}
              placeholder="Nhập lại mật khẩu mới" />
          </Field>

          {pwErr && (
            <p className="flex items-center gap-1.5 text-red-500 text-xs font-semibold">
              <AlertCircle size={13} /> {pwErr}
            </p>
          )}

          <div className="flex items-center gap-3">
            <button type="submit" disabled={pwState === "saving"}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white
                font-bold px-6 py-2.5 rounded-xl active:scale-95 transition-all text-sm disabled:opacity-60">
              <Save size={15} />
              {pwState === "saving" ? "Đang lưu..." : "Đổi mật khẩu"}
            </button>
            {pwState === "ok" && (
              <span className="flex items-center gap-1.5 text-green-600 text-sm font-semibold">
                <CheckCircle size={15} /> Đã đổi!
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Sub-components ── */
function SectionHeader({ title, sub }) {
  return (
    <div>
      <h2 className="text-xl font-extrabold text-gray-900">{title}</h2>
      {sub && <p className="text-sm text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

function PasswordInput({ value, onChange, show, onToggle, placeholder }) {
  return (
    <div className="relative">
      <input type={show ? "text" : "password"} required value={value}
        onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className={`${inputCls} pr-10`} />
      <button type="button" onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}

function StrengthBar({ password }) {
  let score = 0;
  if (password.length >= 8)           score++;
  if (/[A-Z]/.test(password))         score++;
  if (/[0-9]/.test(password))         score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const labels = ["", "Yếu", "Trung bình", "Khá", "Mạnh"];
  const colors = ["", "bg-red-400", "bg-yellow-400", "bg-blue-400", "bg-green-500"];
  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300
            ${i <= score ? colors[score] : "bg-gray-200"}`} />
        ))}
      </div>
      {score > 0 && (
        <p className={`text-xs mt-1 font-semibold ${
          score <= 1 ? "text-red-500" : score === 2 ? "text-yellow-600" : score === 3 ? "text-blue-600" : "text-green-600"
        }`}>
          Độ mạnh: {labels[score]}
        </p>
      )}
    </div>
  );
}