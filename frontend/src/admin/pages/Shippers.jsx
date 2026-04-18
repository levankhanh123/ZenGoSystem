import React, { useEffect, useMemo, useState } from "react";
import { get, put } from "../lib/api";
import { adminStyles } from "../lib/adminStyles";

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
    const [filters, setFilters] = useState({
        keyword: "",
        trang_thai: "",
        trang_thai_noi_bo: "",
    });
    const [selectedShipper, setSelectedShipper] = useState(null);
    const [interventionForm, setInterventionForm] = useState(getInitialInterventionForm(null));
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;

        const fetchShippers = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await get("/api/admin/shippers", {
                    keyword: filters.keyword,
                    trang_thai: filters.trang_thai,
                });

                if (mounted) {
                    setShippers(response.data || []);
                }
            } catch {
                if (mounted) {
                    setError("Không thể tải danh sách shipper.");
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        fetchShippers();

        return () => {
            mounted = false;
        };
    }, [filters.keyword, filters.trang_thai]);

    useEffect(() => {
        setInterventionForm(getInitialInterventionForm(selectedShipper));
    }, [selectedShipper]);

    const filteredShippers = useMemo(() => {
        return shippers.filter((shipper) => {
            const internalStatus = shipper.shipper_profile?.trang_thai_noi_bo || "";

            return !filters.trang_thai_noi_bo || internalStatus === filters.trang_thai_noi_bo;
        });
    }, [filters.trang_thai_noi_bo, shippers]);

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
            <section className={adminStyles.pageHero}>
                <div>
                    <span className={adminStyles.eyebrow}>Giao hàng</span>
                    <h3 className="mt-4 max-w-3xl text-3xl font-extrabold tracking-tight text-slate-900 md:text-[2.25rem] md:leading-[1.1]">
                        Điều phối và theo dõi shipper.
                    </h3>
                </div>
            </section>

            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
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

            <div className={`${adminStyles.panel} rounded-[30px] p-5 md:p-6`}>
                <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--admin-primary)]">Lọc nhanh</p>
                        <h4 className="mt-2 text-lg font-bold text-slate-900">Bộ lọc</h4>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <input
                        placeholder="Tên, email, số điện thoại"
                        value={filters.keyword}
                        onChange={(event) => setFilters({ ...filters, keyword: event.target.value })}
                        className="rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none"
                    />

                    <select
                        value={filters.trang_thai}
                        onChange={(event) => setFilters({ ...filters, trang_thai: event.target.value })}
                        className="rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none"
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="hoat_dong">Hoạt động</option>
                        <option value="khoa">Tạm khóa</option>
                    </select>

                    <select
                        value={filters.trang_thai_noi_bo}
                        onChange={(event) => setFilters({ ...filters, trang_thai_noi_bo: event.target.value })}
                        className="rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none"
                    >
                        <option value="">Tất cả mức vận hành</option>
                        <option value="binh_thuong">Bình thường</option>
                        <option value="canh_bao">Cảnh báo</option>
                        <option value="rui_ro">Rủi ro</option>
                    </select>

                    <button
                        type="button"
                        onClick={() => setFilters({ keyword: "", trang_thai: "", trang_thai_noi_bo: "" })}
                        className={adminStyles.primaryButton}
                    >
                        Đặt lại bộ lọc
                    </button>
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
                                    <th className="px-4 py-3">Shipper</th>
                                    <th className="px-4 py-3">Khu vực</th>
                                    <th className="px-4 py-3">Hiệu suất</th>
                                    <th className="px-4 py-3">Vận hành</th>
                                    <th className="px-4 py-3">Ký quỹ / công nợ</th>
                                    <th className="px-4 py-3">Thao tác</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredShippers.map((shipper) => {
                                    const profile = shipper.shipper_profile || {};
                                    const health = getHealthLabel(shipper);

                                    return (
                                        <tr key={shipper.id} className="border-t align-top">
                                            <td className="px-4 py-4">
                                                <div>
                                                    <p className="font-semibold text-slate-800">{shipper.ho_ten}</p>
                                                    <p className="text-slate-500">{profile.ma_shipper || "--"}</p>
                                                    <p className="text-slate-500">{shipper.so_dien_thoai || shipper.email}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-slate-600">{profile.khu_vuc || "--"}</td>
                                            <td className="px-4 py-4 text-slate-600">
                                                <p>Đơn hôm nay: {profile.don_hom_nay || 0}</p>
                                                <p>Đang giao: {profile.don_dang_giao || 0}</p>
                                                <p>Tỷ lệ đúng hạn: {formatPercent(profile.ty_le_dung_han)}</p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex flex-col gap-2">
                                                    <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${getUserStatusClass(shipper.trang_thai)}`}>
                                                        {getUserStatusLabel(shipper.trang_thai)}
                                                    </span>
                                                    <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${getInternalStatusClass(profile.trang_thai_noi_bo)}`}>
                                                        {getInternalStatusLabel(profile.trang_thai_noi_bo)}
                                                    </span>
                                                    <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${health.className}`}>
                                                        {health.label}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-slate-600">
                                                <p>Ký quỹ: {formatCurrency(profile.ky_quy_hien_tai)}</p>
                                                <p>Công nợ: {formatCurrency(profile.cong_no_hien_tai)}</p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenShipper(shipper)}
                                                    className={adminStyles.darkButton}
                                                >
                                                    Xem chi tiết
                                                </button>
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
        </div>
    );
}