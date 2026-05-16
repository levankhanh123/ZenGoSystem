// components/account/AddressTab.jsx
import { useState, useEffect } from "react";
import { Plus, MapPin, Pencil, Trash2, CheckCircle, Star, X, Save, Loader2 } from "lucide-react";
import { useAddresses, useGhn } from "../../hooks/useAccount.js";

const EMPTY_FORM = { 
  ten_nguoi_nhan: "", 
  so_dien_thoai: "", 
  dia_chi_chi_tiet: "", 
  province_id: "",
  district_id: "",
  ward_code: "",
  la_mac_dinh: 0 
};
const iCls = `w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm outline-none
  focus:border-[#e8175d] focus:ring-2 focus:ring-pink-100 transition-all`;

export default function AddressTab() {
  const { addresses, loading, addAddress, updateAddress, deleteAddress, setDefault } = useAddresses();
  const [modal,    setModal]    = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [saving,   setSaving]   = useState(false);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (modal.mode === "add") await addAddress(form);
      else                      await updateAddress(form.id, form);
      setModal(null);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    await deleteAddress(id);
    setDeleting(null);
  };

  if (loading) return <TabSkeleton />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">Địa chỉ giao hàng</h2>
          <p className="text-sm text-gray-500 mt-0.5">Quản lý địa chỉ nhận hàng của bạn</p>
        </div>
        <button onClick={() => setModal({ mode: "add", data: { ...EMPTY_FORM } })}
          className="flex items-center gap-2 bg-[#e8175d] hover:bg-[#c0114d] text-white
            font-bold px-5 py-2.5 rounded-xl shadow hover:shadow-lg active:scale-95 transition-all text-sm">
          <Plus size={16} /> Thêm địa chỉ
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200
          flex flex-col items-center justify-center py-16 gap-4">
          <MapPin size={40} className="text-gray-300" />
          <div className="text-center">
            <p className="font-bold text-gray-500">Chưa có địa chỉ nào</p>
            <p className="text-sm text-gray-400 mt-1">Thêm địa chỉ để đặt hàng nhanh hơn</p>
          </div>
          <button onClick={() => setModal({ mode: "add", data: { ...EMPTY_FORM } })}
            className="flex items-center gap-2 bg-[#e8175d] text-white font-bold px-5 py-2.5 rounded-xl active:scale-95 transition-all text-sm">
            <Plus size={15} /> Thêm địa chỉ đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...addresses].sort((a, b) => b.la_mac_dinh - a.la_mac_dinh).map((addr) => (
            <div key={addr.id} className={`bg-white rounded-2xl p-5 border-2 transition-all duration-200
              ${addr.la_mac_dinh ? "border-[#e8175d] shadow-md" : "border-gray-100 hover:border-pink-200"}`}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-extrabold text-gray-800 text-sm">{addr.ten_nguoi_nhan}</p>
                  <span className="text-xs text-gray-400">|</span>
                  <p className="text-sm text-gray-500">{addr.so_dien_thoai}</p>
                  {addr.la_mac_dinh === 1 && (
                    <span className="flex items-center gap-1 bg-[#e8175d]/10 text-[#e8175d]
                      text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-[#e8175d]/20">
                      <Star size={9} className="fill-[#e8175d]" /> Mặc định
                    </span>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => setModal({ mode: "edit", data: { ...addr } })}
                    className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-blue-50 hover:text-blue-600
                      flex items-center justify-center text-gray-400 transition-all"><Pencil size={13} /></button>
                  <button onClick={() => setDeleting(addr.id)}
                    className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-red-50 hover:text-red-500
                      flex items-center justify-center text-gray-400 transition-all"><Trash2 size={13} /></button>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed flex items-start gap-1.5">
                <MapPin size={13} className="text-[#e8175d] shrink-0 mt-0.5" />{addr.dia_chi_chi_tiet}
              </p>
              {addr.la_mac_dinh === 0 && (
                <button onClick={() => setDefault(addr.id)}
                  className="mt-3 text-xs text-[#e8175d] font-bold hover:underline flex items-center gap-1">
                  <CheckCircle size={12} /> Đặt làm mặc định
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }} onClick={() => setModal(null)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-extrabold text-gray-900">
                {modal.mode === "edit" ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
              </h3>
              <button onClick={() => setModal(null)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200
                flex items-center justify-center"><X size={15} className="text-gray-600" /></button>
            </div>
            <ModalForm initial={modal.data} saving={saving} onSave={handleSave} onClose={() => setModal(null)} isEdit={modal.mode === "edit"} />
          </div>
        </div>
      )}

      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }} onClick={() => setDeleting(null)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center" onClick={(e) => e.stopPropagation()}>
            <span className="text-5xl">🗑️</span>
            <h3 className="text-lg font-extrabold text-gray-900 mt-4">Xoá địa chỉ?</h3>
            <p className="text-sm text-gray-500 mt-2">Bạn có chắc muốn xoá địa chỉ này không?</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setDeleting(null)} className="flex-1 py-3 border-2 border-gray-200 rounded-2xl font-bold text-gray-600 hover:border-gray-300 active:scale-95 transition-all">Huỷ</button>
              <button onClick={() => handleDelete(deleting)} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-2xl shadow active:scale-95 transition-all">Xoá</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ModalForm({ initial, saving, onSave, onClose, isEdit }) {
  const [form, setForm] = useState({ ...initial });
  const { fetchProvinces, fetchDistricts, fetchWards } = useGhn();
  
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingLoc, setLoadingLoc] = useState(false);

// Load provinces on mount
  useEffect(() => {
    fetchProvinces().then(setProvinces);
  }, [fetchProvinces]);

  // Load districts when province_id changes
  useEffect(() => {
    if (form.province_id) {
      setLoadingLoc(true);
      fetchDistricts(form.province_id).then(d => {
        setDistricts(d);
        setLoadingLoc(false);
      });
    } else {
      setDistricts([]);
    }
  }, [form.province_id, fetchDistricts]);

  // Load wards when district_id changes
  useEffect(() => {
    if (form.district_id) {
      setLoadingLoc(true);
      fetchWards(form.district_id).then(w => {
        setWards(w);
        setLoadingLoc(false);
      });
    } else {
      setWards([]);
    }
  }, [form.district_id, fetchWards]);

  const handleProvinceChange = (e) => {
    setForm(f => ({ ...f, province_id: e.target.value, district_id: "", ward_code: "" }));
  };

  const handleDistrictChange = (e) => {
    setForm(f => ({ ...f, district_id: e.target.value, ward_code: "" }));
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Tên người nhận *</label>
          <input type="text" required value={form.ten_nguoi_nhan}
            onChange={(e) => setForm((f) => ({ ...f, ten_nguoi_nhan: e.target.value }))}
            className={iCls} placeholder="Nguyễn Văn A" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Số điện thoại *</label>
          <input type="tel" required value={form.so_dien_thoai}
            onChange={(e) => setForm((f) => ({ ...f, so_dien_thoai: e.target.value }))}
            className={iCls} placeholder="0900 000 000" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Tỉnh / Thành phố *</label>
          <select required value={form.province_id} onChange={handleProvinceChange} className={iCls}>
            <option value="">-- Chọn --</option>
            {provinces.map(p => <option key={p.ProvinceID} value={p.ProvinceID}>{p.ProvinceName}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Quận / Huyện *</label>
          <select required value={form.district_id} onChange={handleDistrictChange} disabled={!form.province_id} className={iCls}>
            <option value="">-- Chọn --</option>
            {districts.map(d => <option key={d.DistrictID} value={d.DistrictID}>{d.DistrictName}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Phường / Xã *</label>
          <select required value={form.ward_code} onChange={(e) => setForm(f => ({ ...f, ward_code: e.target.value }))} disabled={!form.district_id} className={iCls}>
            <option value="">-- Chọn --</option>
            {wards.map(w => <option key={w.WardCode} value={w.WardCode}>{w.WardName}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Địa chỉ chi tiết *</label>
        <textarea required rows={2} value={form.dia_chi_chi_tiet}
          onChange={(e) => setForm((f) => ({ ...f, dia_chi_chi_tiet: e.target.value }))}
          className={`${iCls} resize-none`} placeholder="Số nhà, tên đường..." />
      </div>
      <label className="flex items-center gap-3 cursor-pointer group">
        <div onClick={() => setForm((f) => ({ ...f, la_mac_dinh: f.la_mac_dinh ? 0 : 1 }))}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer
            ${form.la_mac_dinh ? "bg-[#e8175d] border-[#e8175d]" : "border-gray-300 group-hover:border-pink-400"}`}>
          {form.la_mac_dinh ? <CheckCircle size={13} className="text-white" /> : null}
        </div>
        <span className="text-sm font-semibold text-gray-700">Đặt làm địa chỉ mặc định</span>
      </label>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="flex-1 py-3 border-2 border-gray-200 rounded-2xl font-bold text-gray-600 hover:border-gray-300 active:scale-95 transition-all text-sm">Huỷ</button>
        <button type="submit" disabled={saving}
          className="flex-1 py-3 bg-[#e8175d] hover:bg-[#c0114d] text-white font-extrabold rounded-2xl shadow active:scale-95 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-60">
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {isEdit ? "Cập nhật" : "Thêm địa chỉ"}
        </button>
      </div>
    </form>
  );
}

function TabSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1,2,3].map((i) => <div key={i} className="bg-white rounded-2xl p-5 h-28 border border-gray-100" />)}
    </div>
  );
}