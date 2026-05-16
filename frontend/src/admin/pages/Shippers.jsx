import React, { useEffect, useMemo, useState } from "react";
import { get, put } from "../lib/api";
import { adminStyles } from "../lib/adminStyles";
import AddShipperModal from "../components/AddShipperModal";
import ChangeZoneModal from "../components/ChangeZoneModal";
import { UserPlus, MapPin, ShieldAlert, ShieldCheck, History, MoreVertical, Search, Filter, Loader2, RefreshCcw } from "lucide-react";

function formatCurrency(value) {
    return `${Number(value || 0).toLocaleString("vi-VN")} đ`;
}

function formatDate(value) {
    if (!value) {
        return "--";
    }

    return new Date(value).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatPercent(value) {
    return `${Number(value || 0).toLocaleString("vi-VN", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    })}%`;
}

function formatRating(value) {
    return Number(value || 0).toLocaleString("vi-VN", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    });
}

function getUserStatusClass(status) {
    return status === "hoat_dong" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700";
}

function getUserStatusLabel(status) {
    return status === "hoat_dong" ? "Hoạt động" : "Tạm khóa";
}

function getInternalStatusClass(status) {
    switch (status) {
        case "binh_thuong":
            return "bg-green-100 text-green-700";
        case "canh_bao":
            return "bg-yellow-100 text-yellow-700";
        case "rui_ro":
            return "bg-red-100 text-red-700";
        default:
            return "bg-slate-100 text-slate-700";
    }
}

function getInternalStatusLabel(status) {
    switch (status) {
        case "binh_thuong":
            return "Bình thường";
        case "canh_bao":
            return "Cảnh báo";
        case "rui_ro":
            return "Rủi ro";
        default:
            return status || "--";
    }
}

function getHealthLabel(shipper) {
    const internalStatus = shipper.shipper_profile?.trang_thai_noi_bo;

    if (shipper.trang_thai === "khoa" || internalStatus === "rui_ro") {
        return { label: "Cần can thiệp", className: "bg-red-100 text-red-700" };
    }

    if (internalStatus === "canh_bao") {
        return { label: "Theo dõi", className: "bg-yellow-100 text-yellow-700" };
    }

    return { label: "Ổn định", className: "bg-green-100 text-green-700" };
}

function getInitialInterventionForm(shipper) {
    return {
        trang_thai: shipper?.trang_thai || "hoat_dong",
        trang_thai_noi_bo: shipper?.shipper_profile?.trang_thai_noi_bo || "binh_thuong",
        ly_do_can_thiep_gan_nhat: shipper?.shipper_profile?.ly_do_can_thiep_gan_nhat || "",
        ghi_chu: shipper?.shipper_profile?.ghi_chu || "",
    };
}

export default function Shippers() {
    const [shippers, setShippers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [submittingId, setSubmittingId] = useState(null);
    const [selectedShipper, setSelectedShipper] = useState(null);
    const [interventionForm, setInterventionForm] = useState(getInitialInterventionForm(null));
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showChangeZoneModal, setShowChangeZoneModal] = useState(false);
    const [shipperToChange, setShipperToChange] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState("");

    const [filters, setFilters] = useState({
        keyword: "",
        trang_thai: "",
        district_id: "",
    });

    const fetchShippers = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await get("/api/admin/shippers", {
                keyword: filters.keyword,
                trang_thai: filters.trang_thai,
                district_id: filters.district_id,
            });

            setShippers(response.data || []);
        } catch {
            setError("Không thể tải danh sách shipper.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShippers();
    }, [filters.keyword, filters.trang_thai, filters.district_id, refreshKey]);

    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await get("/api/ghn/provinces");
                setProvinces(response.data || []);
            } catch (err) {
                console.error("Error fetching provinces:", err);
            }
        };
        fetchProvinces();
    }, []);

    const handleProvinceChange = async (e) => {
        const provinceId = e.target.value;
        setSelectedProvince(provinceId);
        setDistricts([]);
        setFilters(prev => ({ ...prev, district_id: "" }));

        if (provinceId) {
            try {
                const { post: apiPost } = await import("../lib/api");
                const res = await apiPost("/api/ghn/districts", { province_id: parseInt(provinceId) });
                setDistricts(res.data || []);
            } catch (err) {
                console.error("Error fetching districts:", err);
            }
        }
    };

    const handleToggleStatus = async (shipper) => {
        if (!window.confirm(`Bạn có chắc chắn muốn ${shipper.trang_thai === 'hoat_dong' ? 'khóa' : 'mở khóa'} tài khoản shipper này?`)) return;
        
        try {
            await put(`/api/admin/shippers/${shipper.id}/toggle-status`);
            setRefreshKey(prev => prev + 1);
        } catch (err) {
            setError(err.message || "Không thể cập nhật trạng thái");
        }
    };

    useEffect(() => {
        setInterventionForm(getInitialInterventionForm(selectedShipper));
    }, [selectedShipper]);

    const filteredShippers = useMemo(() => {
        return shippers.filter((shipper) => {
            const internalStatus = shipper.shipper_profile?.trang_thai_noi_bo || "";
            return true;
        });
    }, [shippers]);

    const summary = useMemo(
        () => ({
            total: shippers.length,
            active: shippers.filter((item) => item.trang_thai === "hoat_dong").length,
            locked: shippers.filter((item) => item.trang_thai === "khoa").length,
            flagged: shippers.filter((item) => {
                const internalStatus = item.shipper_profile?.trang_thai_noi_bo;
                return internalStatus === "canh_bao" || internalStatus === "rui_ro";
            }).length,
        }),
        [shippers]
    );

    const handleOpenShipper = async (shipper) => {
        setSelectedShipper(shipper);
        setDetailLoading(true);
        setError(null);

        try {
            const response = await get(`/api/admin/shippers/${shipper.id}`);
            setSelectedShipper(response.data || shipper);
        } catch {
            setError("Không thể tải chi tiết shipper.");
        } finally {
            setDetailLoading(false);
        }
    };

    const handleIntervene = async () => {
        if (!selectedShipper) {
            return;
        }

        if (!interventionForm.ly_do_can_thiep_gan_nhat.trim()) {
            setError("Cần nhập lý do can thiệp trước khi lưu.");
            return;
        }

        setSubmittingId(selectedShipper.id);
        setError(null);

        try {
            const response = await put(`/api/admin/shippers/${selectedShipper.id}/intervene`, interventionForm);
            const updatedShipper = response.data || selectedShipper;

            setShippers((current) =>
                current.map((item) =>
                    item.id === selectedShipper.id ? { ...item, ...updatedShipper } : item
                )
            );
            setSelectedShipper(updatedShipper);
        } catch {
            setError("Không thể cập nhật trạng thái can thiệp shipper.");
        } finally {
            setSubmittingId(null);
        }
    };

    return (
        <div className={adminStyles.pageStack}>
            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            <div className={adminStyles.heroHeader}>
                <div className="flex items-center justify-between">
                    <div>
                        <span className={adminStyles.eyebrow}>Trung tâm vận hành</span>
                        <h1 className={adminStyles.heroTitle}>Quản lý vận chuyển</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setShowAddModal(true)}
                            className={adminStyles.primaryButton}
                        >
                            <UserPlus size={16} className="mr-2" />
                            Thêm Shipper mới
                        </button>
                        <div className="h-10 w-[1px] bg-slate-200 mx-1"></div>
                        <div className="flex flex-col items-end">
                            <span className={adminStyles.heroBadge}>SHIPPER</span>
                            <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">
                                {new Date().toLocaleDateString("vi-VN")}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 xl:grid-cols-3 mb-6">
                <div className={`${adminStyles.panel} p-5 flex flex-col md:flex-row gap-4 items-end`}>
                    <div className="flex-1 w-full">
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Tìm kiếm</label>
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-sky-500 transition text-sm"
                                placeholder="Tên, Email, Số điện thoại..."
                                value={filters.keyword}
                                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                            />
                            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>

                    <div className="w-full md:w-48">
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Trạng thái</label>
                        <select
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-sky-500 transition text-sm appearance-none bg-white"
                            value={filters.trang_thai}
                            onChange={(e) => setFilters({ ...filters, trang_thai: e.target.value })}
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="hoat_dong">Đang hoạt động</option>
                            <option value="khoa">Đã bị khóa</option>
                        </select>
                    </div>
                </div>

                <div className={`${adminStyles.panel} p-5 flex flex-col md:flex-row gap-4 items-end md:col-span-2`}>
                    <div className="flex-1 w-full">
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Khu vực (Tỉnh/Thành)</label>
                        <select
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-sky-500 transition text-sm appearance-none bg-white"
                            value={selectedProvince}
                            onChange={handleProvinceChange}
                        >
                            <option value="">Tất cả Tỉnh/Thành</option>
                            {provinces.map(p => (
                                <option key={p.ProvinceID} value={p.ProvinceID}>{p.ProvinceName}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1 w-full">
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Quận/Huyện</label>
                        <select
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-sky-500 transition text-sm appearance-none bg-white"
                            value={filters.district_id}
                            onChange={(e) => setFilters({ ...filters, district_id: e.target.value })}
                            disabled={!selectedProvince}
                        >
                            <option value="">Tất cả Quận/Huyện</option>
                            {districts.map(d => (
                                <option key={d.DistrictID} value={d.DistrictID}>{d.DistrictName}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
                <div className={`${adminStyles.statCard} p-5`}>
                    <p className="text-sm text-slate-500">Shipper</p>
                    <h4 className="mt-2 text-3xl font-bold text-slate-800">{summary.total}</h4>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">fleet size</p>
                </div>
                <div className={`${adminStyles.statCard} p-5`}>
                    <p className="text-sm text-slate-500">Đang hoạt động</p>
                    <h4 className="mt-2 text-3xl font-bold text-green-700">{summary.active}</h4>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">active</p>
                </div>
                <div className={`${adminStyles.statCard} p-5`}>
                    <p className="text-sm text-slate-500">Tạm khóa</p>
                    <h4 className="mt-2 text-3xl font-bold text-red-700">{summary.locked}</h4>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">locked</p>
                </div>
                <div className={`${adminStyles.statCard} p-5`}>
                    <p className="text-sm text-slate-500">Cần theo dõi</p>
                    <h4 className="mt-2 text-3xl font-bold text-yellow-700">{summary.flagged}</h4>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">flagged ops</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                <div className={`${adminStyles.tableCard} p-5 md:p-6 xl:col-span-7`}>
                    <div className="mb-4 flex items-center justify-between">
                        <h4 className={adminStyles.sectionTitle}>Danh sách shipper</h4>
                        <span className={adminStyles.chip}>Tổng: {filteredShippers.length}</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead>
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Shipper</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Khu vực (Zone)</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Công việc</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Tài chính</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredShippers.map((shipper) => {
                                    const profile = shipper.shipper_profile || {};
                                    const workloadPercent = Math.min(((profile.don_dang_giao || 0) / (profile.suc_chua_don_hang || 5)) * 100, 100);
                                    
                                    return (
                                        <tr key={shipper.id} className="group hover:bg-slate-50/50 transition">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 overflow-hidden rounded-xl bg-slate-100 ring-2 ring-white shadow-sm">
                                                        <img
                                                            src={shipper.anh_dai_dien || "https://ui-avatars.com/api/?name=" + shipper.ho_ten}
                                                            alt={shipper.ho_ten}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 group-hover:text-[var(--admin-primary)] transition">{shipper.ho_ten}</p>
                                                        <p className="text-[11px] font-medium text-slate-400 uppercase">{profile.ma_shipper || "SHP_NEW"}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                                                    <MapPin size={14} className="text-rose-500" />
                                                    {profile.khu_vuc || "Chưa gán"}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="space-y-2 max-w-[120px]">
                                                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase">
                                                        <span>Đang giao</span>
                                                        <span>{profile.don_dang_giao || 0}/{profile.suc_chua_don_hang || 5}</span>
                                                    </div>
                                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                                                        <div 
                                                            className={`h-full transition-all duration-500 ${workloadPercent > 80 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                                                            style={{ width: `${workloadPercent}%` }} 
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-[13px] text-slate-600">
                                                <p className="font-medium text-slate-900">{formatCurrency(profile.cong_no_hien_tai)}</p>
                                                <p className="text-[11px] text-slate-400">Công nợ</p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenShipper(shipper)}
                                                        className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition shadow-sm"
                                                        title="Xem chi tiết"
                                                    >
                                                        <History size={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setShipperToChange(shipper);
                                                            setShowChangeZoneModal(true);
                                                        }}
                                                        className="p-2 rounded-xl bg-white border border-slate-200 text-rose-500 hover:bg-rose-50 transition shadow-sm"
                                                        title="Đổi vùng"
                                                    >
                                                        <MapPin size={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleStatus(shipper)}
                                                        className={`p-2 rounded-xl bg-white border border-slate-200 transition shadow-sm ${shipper.trang_thai === 'hoat_dong' ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                                                        title={shipper.trang_thai === 'hoat_dong' ? "Khóa tài khoản" : "Mở khóa"}
                                                    >
                                                        {shipper.trang_thai === 'hoat_dong' ? <ShieldAlert size={16} /> : <ShieldCheck size={16} />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {!loading && filteredShippers.length === 0 && (
                            <div className="px-4 py-8 text-center text-sm text-slate-500">Không tìm thấy shipper phù hợp.</div>
                        )}

                        {loading && (
                            <div className="px-4 py-8 text-center text-sm text-slate-500">Đang tải danh sách shipper...</div>
                        )}
                    </div>
                </div>

                <div className={`${adminStyles.panel} rounded-[32px] p-5 md:p-6 xl:col-span-5`}>
                    <div className="mb-4">
                        <h4 className={adminStyles.sectionTitle}>Chi tiết vận hành</h4>
                    </div>

                    {!selectedShipper && (
                        <div className={`${adminStyles.emptyState} px-4 py-10 text-center text-sm`}>Chưa chọn shipper nào.</div>
                    )}

                    {selectedShipper && (
                        <div className="space-y-5">
                            <div className={`${adminStyles.detailCard} bg-slate-50 p-4`}>
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <h5 className="text-lg font-semibold text-slate-800">{selectedShipper.ho_ten}</h5>
                                        <p className="text-sm text-slate-500">{selectedShipper.shipper_profile?.ma_shipper || "--"}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getUserStatusClass(selectedShipper.trang_thai)}`}>
                                            {getUserStatusLabel(selectedShipper.trang_thai)}
                                        </span>
                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getInternalStatusClass(selectedShipper.shipper_profile?.trang_thai_noi_bo)}`}>
                                            {getInternalStatusLabel(selectedShipper.shipper_profile?.trang_thai_noi_bo)}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-slate-600 md:grid-cols-2">
                                    <p>Email: {selectedShipper.email}</p>
                                    <p>SĐT: {selectedShipper.so_dien_thoai || "--"}</p>
                                    <p>Khu vực: {selectedShipper.shipper_profile?.khu_vuc || "--"}</p>
                                    <p>Can thiệp gần nhất: {formatDate(selectedShipper.shipper_profile?.lan_can_thiep_gan_nhat)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className={`${adminStyles.detailCard} p-4`}>
                                    <h6 className="font-semibold text-slate-800">Hiệu suất</h6>
                                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                                        <p>Tổng đơn đã giao: {selectedShipper.shipper_profile?.tong_don_giao || 0}</p>
                                        <p>Đơn đang giao: {selectedShipper.shipper_profile?.don_dang_giao || 0}</p>
                                        <p>Đơn thất bại: {selectedShipper.shipper_profile?.don_that_bai || 0}</p>
                                        <p>Tỷ lệ đúng hạn: {formatPercent(selectedShipper.shipper_profile?.ty_le_dung_han)}</p>
                                        <p>Tỷ lệ thất bại: {formatPercent(selectedShipper.shipper_profile?.ty_le_that_bai)}</p>
                                        <p>Đánh giá TB: {formatRating(selectedShipper.shipper_profile?.danh_gia_trung_binh)}</p>
                                    </div>
                                </div>

                                <div className={`${adminStyles.detailCard} p-4`}>
                                    <h6 className="font-semibold text-slate-800">Tài chính</h6>
                                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                                        <p>Đơn hôm nay: {selectedShipper.shipper_profile?.don_hom_nay || 0}</p>
                                        <p>Đơn tuần này: {selectedShipper.shipper_profile?.don_tuan_nay || 0}</p>
                                        <p>Đơn tháng này: {selectedShipper.shipper_profile?.don_thang_nay || 0}</p>
                                        <p>Ký quỹ hiện tại: {formatCurrency(selectedShipper.shipper_profile?.ky_quy_hien_tai)}</p>
                                        <p>Công nợ hiện tại: {formatCurrency(selectedShipper.shipper_profile?.cong_no_hien_tai)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className={`${adminStyles.detailCard} p-4`}>
                                <h6 className="font-semibold text-slate-800">Cập nhật can thiệp vận hành</h6>

                                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <select
                                        value={interventionForm.trang_thai}
                                        onChange={(event) => setInterventionForm({ ...interventionForm, trang_thai: event.target.value })}
                                        className="rounded-2xl border border-slate-300 px-4 py-3 outline-none"
                                    >
                                        <option value="hoat_dong">Hoạt động</option>
                                        <option value="khoa">Tạm khóa</option>
                                    </select>

                                    <select
                                        value={interventionForm.trang_thai_noi_bo}
                                        onChange={(event) => setInterventionForm({ ...interventionForm, trang_thai_noi_bo: event.target.value })}
                                        className="rounded-2xl border border-slate-300 px-4 py-3 outline-none"
                                    >
                                        <option value="binh_thuong">Bình thường</option>
                                        <option value="canh_bao">Cảnh báo</option>
                                        <option value="rui_ro">Rủi ro</option>
                                    </select>
                                </div>

                                <textarea
                                    value={interventionForm.ly_do_can_thiep_gan_nhat}
                                    onChange={(event) => setInterventionForm({ ...interventionForm, ly_do_can_thiep_gan_nhat: event.target.value })}
                                    rows={3}
                                    placeholder="Lý do can thiệp"
                                    className="mt-4 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none"
                                />

                                <textarea
                                    value={interventionForm.ghi_chu}
                                    onChange={(event) => setInterventionForm({ ...interventionForm, ghi_chu: event.target.value })}
                                    rows={4}
                                    placeholder="Ghi chú nội bộ"
                                    className="mt-4 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none"
                                />

                                <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                                    Lý do gần nhất: {selectedShipper.shipper_profile?.ly_do_can_thiep_gan_nhat || "Chưa có"}
                                </div>

                                <button
                                    type="button"
                                    onClick={handleIntervene}
                                    disabled={submittingId === selectedShipper.id || detailLoading}
                                    className="mt-4 rounded-[16px] bg-sky-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
                                >
                                    {submittingId === selectedShipper.id ? "Đang lưu..." : "Lưu can thiệp"}
                                </button>
                            </div>

                            {detailLoading && <div className="text-sm text-slate-500">Đang tải chi tiết shipper...</div>}
                        </div>
                    )}
                </div>
            </div>

            {showAddModal && (
                <AddShipperModal 
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false);
                        setRefreshKey(prev => prev + 1);
                    }}
                />
            )}
            {showChangeZoneModal && (
                <ChangeZoneModal 
                    shipper={shipperToChange}
                    onClose={() => {
                        setShowChangeZoneModal(false);
                        setShipperToChange(null);
                    }}
                    onSuccess={() => {
                        setShowChangeZoneModal(false);
                        setShipperToChange(null);
                        setRefreshKey(prev => prev + 1);
                    }}
                />
            )}
        </div>
    );
}