import React, { useState, useEffect } from 'react';
import { adminStyles } from '../lib/adminStyles';
import { get, post } from '../lib/api';
import { X, User, Phone, Mail, Lock, MapPin, CreditCard, Camera, Loader2 } from 'lucide-react';

export default function AddShipperModal({ onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState('');
    const [formData, setFormData] = useState({
        ho_ten: '',
        so_dien_thoai: '',
        email: '',
        mat_khau: 'ZenGo@2026',
        district_id: '',
        khu_vuc: '', // District name
        cccd: '',
        portrait: null
    });
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await get('/api/ghn/provinces');
                setProvinces(response.data || []);
            } catch (err) {
                console.error('Error fetching provinces:', err);
            }
        };
        fetchProvinces();
    }, []);

    const handleProvinceChange = async (e) => {
        const provinceId = e.target.value;
        setSelectedProvince(provinceId);
        setDistricts([]);
        setFormData(prev => ({ ...prev, district_id: '', khu_vuc: '' }));

        if (provinceId) {
            try {
                const response = await post('/api/ghn/districts', { province_id: parseInt(provinceId) });
                setDistricts(response.data || []);
            } catch (err) {
                console.error('Error fetching districts:', err);
            }
        }
    };

    const handleDistrictChange = (e) => {
        const districtId = e.target.value;
        const district = districts.find(d => d.DistrictID === parseInt(districtId));
        setFormData(prev => ({ 
            ...prev, 
            district_id: districtId, 
            khu_vuc: district ? district.DistrictName : '' 
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, portrait: file }));
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key]) data.append(key, formData[key]);
        });

        try {
            await post('/api/admin/shippers', data);
            onSuccess();
        } catch (err) {
            setError(err.message || 'Có lỗi xảy ra khi tạo shipper');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className={`${adminStyles.modalSurface} w-full max-w-2xl overflow-hidden flex flex-col`}>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 p-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Thêm Shipper mới</h3>
                        <p className="text-sm text-slate-500 mt-1">Cấp tài khoản và phân quyền cho nhân viên giao hàng</p>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 hover:bg-slate-100 transition">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
                    {error && (
                        <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {/* Portrait Upload Section */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-3xl bg-slate-100 border-2 border-dashed border-slate-300 overflow-hidden flex items-center justify-center group-hover:border-[var(--admin-primary)] transition-all">
                                {preview ? (
                                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <Camera size={32} className="text-slate-400 group-hover:text-[var(--admin-primary)]" />
                                )}
                            </div>
                            <input 
                                type="file" 
                                id="portrait-upload" 
                                accept="image/*" 
                                onChange={handleFileChange} 
                                className="hidden" 
                            />
                            <label 
                                htmlFor="portrait-upload"
                                className="absolute -bottom-2 -right-2 bg-white shadow-lg rounded-xl p-2 cursor-pointer hover:bg-slate-50 transition border border-slate-100"
                            >
                                <Camera size={18} className="text-[var(--admin-primary)]" />
                            </label>
                        </div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Ảnh chân dung shipper</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Identify Info */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <User size={16} className="text-sky-500" />
                                Thông tin định danh
                            </h4>
                            
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Họ và tên</label>
                                    <div className="relative">
                                        <input 
                                            type="text" required
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-sky-500 transition text-sm"
                                            placeholder="Nguyễn Văn A"
                                            value={formData.ho_ten}
                                            onChange={e => setFormData({...formData, ho_ten: e.target.value})}
                                        />
                                        <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Số điện thoại</label>
                                    <div className="relative">
                                        <input 
                                            type="tel" required
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-sky-500 transition text-sm"
                                            placeholder="0987654321"
                                            value={formData.so_dien_thoai}
                                            onChange={e => setFormData({...formData, so_dien_thoai: e.target.value})}
                                        />
                                        <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Email</label>
                                    <div className="relative">
                                        <input 
                                            type="email" required
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-sky-500 transition text-sm"
                                            placeholder="shipper@zengo.vn"
                                            value={formData.email}
                                            onChange={e => setFormData({...formData, email: e.target.value})}
                                        />
                                        <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Mật khẩu (mặc định)</label>
                                    <div className="relative">
                                        <input 
                                            type="text" required
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-sky-500 transition text-sm"
                                            value={formData.mat_khau}
                                            onChange={e => setFormData({...formData, mat_khau: e.target.value})}
                                        />
                                        <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Business & Legal Info */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <MapPin size={16} className="text-rose-500" />
                                Nghiệp vụ & Pháp lý
                            </h4>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Tỉnh/Thành phố</label>
                                    <select 
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-sky-500 transition text-sm appearance-none bg-white"
                                        value={selectedProvince}
                                        onChange={handleProvinceChange}
                                        required
                                    >
                                        <option value="">Chọn Tỉnh/Thành</option>
                                        {provinces.map(p => (
                                            <option key={p.ProvinceID} value={p.ProvinceID}>{p.ProvinceName}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Khu vực phụ trách (Quận/Huyện)</label>
                                    <div className="relative">
                                        <select 
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-sky-500 transition text-sm appearance-none bg-white"
                                            value={formData.district_id}
                                            onChange={handleDistrictChange}
                                            required
                                            disabled={!selectedProvince}
                                        >
                                            <option value="">Chọn Quận/Huyện</option>
                                            {districts.map(d => (
                                                <option key={d.DistrictID} value={d.DistrictID}>{d.DistrictName}</option>
                                            ))}
                                        </select>
                                        <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Số CCCD/CMND</label>
                                    <div className="relative">
                                        <input 
                                            type="text" required
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-sky-500 transition text-sm"
                                            placeholder="012345678901"
                                            value={formData.cccd}
                                            onChange={e => setFormData({...formData, cccd: e.target.value})}
                                        />
                                        <CreditCard size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="border-t border-slate-100 p-6 flex items-center justify-end gap-3 bg-slate-50/50">
                    <button 
                        type="button"
                        onClick={onClose}
                        className={adminStyles.secondaryButton}
                    >
                        Hủy bỏ
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`${adminStyles.primaryButton} min-w-[140px] flex items-center justify-center gap-2`}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Đang xử lý...
                            </>
                        ) : 'Lưu Shipper'}
                    </button>
                </div>
            </div>
        </div>
    );
}
