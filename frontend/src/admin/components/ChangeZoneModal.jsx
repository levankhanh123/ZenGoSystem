import React, { useState, useEffect } from 'react';
import { adminStyles } from '../lib/adminStyles';
import { get, post, put } from '../lib/api';
import { X, MapPin, Loader2 } from 'lucide-react';

export default function ChangeZoneModal({ shipper, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState({
        id: shipper?.shipper_profile?.district_id || '',
        name: shipper?.shipper_profile?.khu_vuc || ''
    });
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
        setSelectedDistrict({ id: '', name: '' });

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
        setSelectedDistrict({
            id: districtId,
            name: district ? district.DistrictName : ''
        });
    };

    const handleSubmit = async () => {
        if (!selectedDistrict.id) return;
        
        setLoading(true);
        setError('');

        try {
            await put(`/api/admin/shippers/${shipper.id}/zone`, {
                district_id: selectedDistrict.id,
                khu_vuc: selectedDistrict.name
            });
            onSuccess();
        } catch (err) {
            setError(err.message || 'Có lỗi xảy ra khi đổi vùng');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className={`${adminStyles.modalSurface} w-full max-w-md overflow-hidden flex flex-col`}>
                <div className="flex items-center justify-between border-b border-slate-100 p-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Đổi vùng hoạt động</h3>
                        <p className="text-sm text-slate-500 mt-1">Shipper: {shipper.ho_ten}</p>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 hover:bg-slate-100 transition">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {error && (
                        <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Tỉnh/Thành phố</label>
                            <select 
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-sky-500 transition text-sm appearance-none bg-white"
                                value={selectedProvince}
                                onChange={handleProvinceChange}
                            >
                                <option value="">Chọn Tỉnh/Thành</option>
                                {provinces.map(p => (
                                    <option key={p.ProvinceID} value={p.ProvinceID}>{p.ProvinceName}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Quận/Huyện mới</label>
                            <div className="relative">
                                <select 
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-sky-500 transition text-sm appearance-none bg-white"
                                    value={selectedDistrict.id}
                                    onChange={handleDistrictChange}
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

                        <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
                            <p className="text-xs text-amber-700 leading-relaxed">
                                <strong>Lưu ý:</strong> Khi đổi vùng, Shipper sẽ chỉ nhận được các đơn hàng mới phát sinh tại khu vực này. Các đơn hàng đang giao sẽ không bị ảnh hưởng.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-100 p-6 flex items-center justify-end gap-3 bg-slate-50/50">
                    <button onClick={onClose} className={adminStyles.secondaryButton}>Hủy bỏ</button>
                    <button 
                        onClick={handleSubmit}
                        disabled={loading || !selectedDistrict.id}
                        className={`${adminStyles.primaryButton} min-w-[120px] flex items-center justify-center gap-2`}
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : 'Xác nhận đổi'}
                    </button>
                </div>
            </div>
        </div>
    );
}
