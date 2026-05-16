import React, { useEffect, useMemo, useState, useRef } from "react";
import SavedFilterViews from "../components/SavedFilterViews";
import { get, put } from "../lib/api";
import { Search, Filter, MoreVertical, ShieldAlert, ShieldCheck, UserPlus, RefreshCcw, Download, Trash2, Mail, Phone, MapPin, Calendar, Clock, BarChart3, TrendingUp, Users, ChevronRight, X } from "lucide-react";
import { adminStyles } from "../lib/adminStyles";
import { useSavedFilterViews } from "../lib/useSavedFilterViews";
import { useUrlFilterState } from "../lib/useUrlFilterState";

function formatCurrency(value) {
    return `${Number(value || 0).toLocaleString("vi-VN")} đ`;
}

function getShopStatusClass(status) {
    switch (status) {
        case "cho_duyet":
            return "bg-yellow-100 text-yellow-700";
        case "da_duyet":
            return "bg-green-100 text-green-700";
        case "tu_choi":
            return "bg-red-100 text-red-700";
        case "tam_khoa":
            return "bg-slate-200 text-slate-700";
        default:
            return "bg-slate-100 text-slate-700";
    }
}

function getShopStatusLabel(status) {
    switch (status) {
        case "cho_duyet":
            return "Chờ duyệt";
        case "da_duyet":
            return "Đã duyệt";
        case "tu_choi":
            return "Từ chối";
        case "tam_khoa":
            return "Tạm khóa";
        default:
            return status || "Chưa rõ";
    }
}

function getInternalStatusClass(shop) {
    if (["tu_choi", "tam_khoa"].includes(shop.trang_thai)) {
        return "bg-red-100 text-red-700";
    }

    if (shop.trang_thai === "cho_duyet") {
        return "bg-yellow-100 text-yellow-700";
    }

    return "bg-green-100 text-green-700";
}

function getInternalStatusLabel(shop) {
    if (["tu_choi", "tam_khoa"].includes(shop.trang_thai)) return "Rủi ro";
    if (shop.trang_thai === "cho_duyet") return "Cần duyệt";
    return "Bình thường";
}

export default function Shops() {
    const mounted = useRef(true);
    const [shopList, setShopList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [submittingId, setSubmittingId] = useState(null);
    const [totalShops, setTotalShops] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [globalStats, setGlobalStats] = useState({ total: 0, pending: 0, approved: 0, blocked: 0 });
    const [shopLogs, setShopLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("info"); // info, activity
    const [filters, setFilters] = useUrlFilterState({
        keyword: "",
        trang_thai: "",
    });
    const [selectedShop, setSelectedShop] = useState(null);
    const [error, setError] = useState(null);
    const savedViews = useSavedFilterViews("admin-shops-views", filters, setFilters);

    const fetchShops = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await get("/api/admin/shops", {
                ...filters,
                page: currentPage,
                per_page: perPage,
            });

            if (mounted.current) {
                setShopList(response.data || []);
                setTotalShops(response.total || 0);
                if (response.stats) {
                    setGlobalStats(response.stats);
                }
            }
        } catch {
            if (mounted.current) {
                setError("Không thể tải danh sách shop.");
            }
        } finally {
            if (mounted.current) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        mounted.current = true;
        fetchShops();
        return () => {
            mounted.current = false;
        };
    }, [filters, currentPage]);

    const handleRefresh = () => {
        if (currentPage === 1) {
            fetchShops();
        } else {
            setCurrentPage(1);
        }
    };

    const fetchShopLogs = async (ownerId) => {
        setLogsLoading(true);
        try {
            const response = await get("/api/admin/activity-logs", { user_id: ownerId });
            setShopLogs(response.data || []);
        } catch (err) {
            console.error("Failed to fetch logs:", err);
        } finally {
            setLogsLoading(false);
        }
    };

    const filteredShops = useMemo(() => {
        return shopList.filter((shop) => {
            const keyword = filters.keyword.trim().toLowerCase();
            const shopName = String(shop.ten_cua_hang || "").toLowerCase();
            const ownerName = String(shop.owner?.ho_ten || "").toLowerCase();
            const matchKeyword = !keyword || shopName.includes(keyword) || ownerName.includes(keyword);
            const matchStatus = !filters.trang_thai || shop.trang_thai === filters.trang_thai;

            return matchKeyword && matchStatus;
        });
    }, [filters, shopList]);

    const handleOpenShop = async (shop) => {
        setSelectedShop(shop);
        setActiveTab("info");
        setDetailLoading(true);
        setShopLogs([]);

        try {
            const response = await get(`/api/admin/shops/${shop.id}`);
            const fullShop = response.data || shop;
            setSelectedShop(fullShop);
            if (fullShop.owner?.id) {
                fetchShopLogs(fullShop.owner.id);
            }
        } catch {
            setError("Không thể tải chi tiết shop.");
        } finally {
            setDetailLoading(false);
        }
    };

    const handleUpdateStatus = async (shop, trang_thai) => {
        let ly_do_tu_choi;

        if (trang_thai === "tu_choi") {
            ly_do_tu_choi = window.prompt("Nhập lý do từ chối shop:", shop.ly_do_tu_choi || "");

            if (ly_do_tu_choi === null) {
                return;
            }
        }

        setSubmittingId(shop.id);
        setError(null);

        try {
            const response = await put(`/api/admin/shops/${shop.id}/status`, {
                trang_thai,
                ly_do_tu_choi,
            });
            const updatedShop = response.data || { ...shop, trang_thai, ly_do_tu_choi };

            setShopList((current) =>
                current.map((item) => (item.id === shop.id ? { ...item, ...updatedShop } : item))
            );

            if (selectedShop?.id === shop.id) {
                setSelectedShop((current) => ({ ...current, ...updatedShop }));
            }
        } catch {
            setError("Không thể cập nhật trạng thái shop.");
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
                        <h1 className={adminStyles.heroTitle}>Quản lý cửa hàng</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleRefresh}
                            disabled={loading}
                            className={adminStyles.secondaryButton}
                        >
                            <RefreshCcw size={16} className={loading ? "animate-spin mr-2" : "mr-2"} />
                            Làm mới dữ liệu
                        </button>
                        <div className="h-10 w-[1px] bg-slate-200 mx-1"></div>
                        <div className="flex flex-col items-end">
                            <span className={adminStyles.heroBadge}>CỬA HÀNG</span>
                            <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">
                                {new Date().toLocaleDateString("vi-VN")}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className={`${adminStyles.statCard} p-5`}>
                    <p className="text-sm text-slate-500">Cửa hàng</p>
                    <h4 className="mt-2 text-3xl font-bold text-slate-800">{globalStats.total}</h4>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">shop base</p>
                </div>
                <div className={`${adminStyles.statCard} p-5`}>
                    <p className="text-sm text-slate-500">Chờ duyệt</p>
                    <h4 className="mt-2 text-3xl font-bold text-yellow-700">{globalStats.pending}</h4>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">pending review</p>
                </div>
                <div className={`${adminStyles.statCard} p-5`}>
                    <p className="text-sm text-slate-500">Đã duyệt</p>
                    <h4 className="mt-2 text-3xl font-bold text-green-700">{globalStats.approved}</h4>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">live shops</p>
                </div>
                <div className={`${adminStyles.statCard} p-5`}>
                    <p className="text-sm text-slate-500">Tạm khóa</p>
                    <h4 className="mt-2 text-3xl font-bold text-red-700">{globalStats.blocked}</h4>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">risk cases</p>
                </div>
            </div>

            <div className={`${adminStyles.panel} rounded-[30px] p-5 md:p-6`}>
                <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ee4d2d]">Lọc nhanh</p>
                        <h4 className="mt-2 text-lg font-bold text-slate-900">Bộ lọc</h4>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <input
                        placeholder="Tên shop, người bán"
                        value={filters.keyword}
                        onChange={(event) => setFilters({ ...filters, keyword: event.target.value })}
                        className="rounded-2xl border border-slate-300 bg-white px-4 py-3"
                    />

                    <select
                        value={filters.trang_thai}
                        onChange={(event) => setFilters({ ...filters, trang_thai: event.target.value })}
                        className="rounded-2xl border border-slate-300 bg-white px-4 py-3"
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="cho_duyet">Chờ duyệt</option>
                        <option value="da_duyet">Đã duyệt</option>
                        <option value="tam_khoa">Tạm khóa</option>
                        <option value="tu_choi">Từ chối</option>
                    </select>

                    <button
                        onClick={() => setFilters({ keyword: "", trang_thai: "" })}
                        className={adminStyles.primaryButton}
                    >
                        Đặt lại bộ lọc
                    </button>
                </div>

                <div className="mt-4">
                    <SavedFilterViews
                        title="Preset"
                        description=""
                        draftName={savedViews.draftName}
                        setDraftName={savedViews.setDraftName}
                        onSave={savedViews.saveCurrentView}
                        views={savedViews.views}
                        onApply={savedViews.applyView}
                        onDelete={savedViews.deleteView}
                    />
                </div>
            </div>

            <div className={`${adminStyles.tableCard} p-5 md:p-6`}>
                <div className="mb-4 flex items-center justify-between">
                    <h4 className={adminStyles.sectionTitle}>Danh sách shop</h4>
                    <span className={adminStyles.chip}>Hiển thị: {shopList.length} / Tổng: {totalShops}</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr>
                                <th className="px-4 py-3">Shop</th>
                                <th className="px-4 py-3">Người bán</th>
                                <th className="px-4 py-3">Doanh thu</th>
                                <th className="px-4 py-3">Đơn</th>
                                <th className="px-4 py-3">Nội bộ</th>
                                <th className="px-4 py-3">Trạng thái</th>
                                <th className="px-4 py-3">Can thiệp</th>
                            </tr>
                        </thead>

                        <tbody>
                            {shopList.map((shop) => (
                                <tr key={shop.id} className="border-t">
                                    <td className="px-4 py-3">
                                        <button
                                            type="button"
                                            className="font-medium text-[#ee4d2d] hover:underline"
                                            onClick={() => handleOpenShop(shop)}
                                        >
                                            {shop.ten_cua_hang}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3">{shop.owner?.ho_ten || "--"}</td>
                                    <td className="px-4 py-3">{formatCurrency(shop.doanh_thu)}</td>
                                    <td className="px-4 py-3">{shop.orders_count ?? 0}</td>
                                    <td className="px-4 py-3">
                                        <span className={`rounded-full px-3 py-1 text-xs ${getInternalStatusClass(shop)}`}>
                                            {getInternalStatusLabel(shop)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`rounded-full px-3 py-1 text-xs ${getShopStatusClass(shop.trang_thai)}`}>
                                            {getShopStatusLabel(shop.trang_thai)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-2">
                                            {shop.trang_thai === "cho_duyet" && (
                                                <>
                                                    <button
                                                        onClick={() => handleUpdateStatus(shop, "da_duyet")}
                                                        disabled={submittingId === shop.id}
                                                        className="rounded-[16px] bg-green-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        Duyệt
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(shop, "tu_choi")}
                                                        disabled={submittingId === shop.id}
                                                        className="rounded-[16px] bg-red-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        Từ chối
                                                    </button>
                                                </>
                                            )}

                                            {shop.trang_thai === "da_duyet" && (
                                                <button
                                                    onClick={() => handleUpdateStatus(shop, "tam_khoa")}
                                                    disabled={submittingId === shop.id}
                                                    className="rounded-[16px] bg-red-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    Khóa
                                                </button>
                                            )}

                                            {["tam_khoa", "tu_choi"].includes(shop.trang_thai) && (
                                                <button
                                                    onClick={() => handleUpdateStatus(shop, "da_duyet")}
                                                    disabled={submittingId === shop.id}
                                                    className="rounded-[16px] bg-sky-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    Mở lại
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {!loading && shopList.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-4 py-8 text-center text-slate-500">Không có dữ liệu shop</td>
                                </tr>
                            )}

                            {loading && (
                                <tr>
                                    <td colSpan="7" className="px-4 py-8 text-center text-slate-500">Đang tải dữ liệu...</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6 flex items-center justify-between border-t pt-4">
                    <div className="text-sm text-slate-500">
                        Trang {currentPage} / {Math.ceil(totalShops / perPage) || 1}
                    </div>
                    <div className="flex gap-2">
                        <button
                            disabled={currentPage === 1 || loading}
                            onClick={() => setCurrentPage((prev) => prev - 1)}
                            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium transition hover:bg-slate-50 disabled:opacity-50"
                        >
                            Trước
                        </button>
                        <button
                            disabled={currentPage * perPage >= totalShops || loading}
                            onClick={() => setCurrentPage((prev) => prev + 1)}
                            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium transition hover:bg-slate-50 disabled:opacity-50"
                        >
                            Sau
                        </button>
                    </div>
                </div>
            </div>

            {selectedShop && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(20,11,8,0.52)] px-4 py-6 backdrop-blur-sm">
                    <div className={`${adminStyles.modalSurface} w-full max-w-4xl overflow-hidden`}>
                        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-[rgba(132,86,72,0.1)] bg-[rgba(255,250,247,0.94)] px-6 py-5 backdrop-blur-sm">
                            <div>
                                <span className={adminStyles.eyebrow}>Shop detail</span>
                                <h3 className="mt-3 text-2xl font-bold text-slate-900">{selectedShop.ten_cua_hang}</h3>
                                {detailLoading && <p className="mt-2 text-xs text-slate-400">Đang tải chi tiết shop...</p>}
                            </div>

                            <button
                                onClick={() => setSelectedShop(null)}
                                className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                            >
                                Đóng
                            </button>
                        </div>

                        <div className="flex border-b border-[rgba(132,86,72,0.1)] px-6">
                            <button
                                onClick={() => setActiveTab("info")}
                                className={`px-4 py-3 text-sm font-bold transition-colors ${
                                    activeTab === "info"
                                        ? "border-b-2 border-[#ee4d2d] text-[#ee4d2d]"
                                        : "text-slate-500 hover:text-slate-700"
                                }`}
                            >
                                Thông tin chung
                            </button>
                            <button
                                onClick={() => setActiveTab("activity")}
                                className={`px-4 py-3 text-sm font-bold transition-colors ${
                                    activeTab === "activity"
                                        ? "border-b-2 border-[#ee4d2d] text-[#ee4d2d]"
                                        : "text-slate-500 hover:text-slate-700"
                                }`}
                            >
                                Nhật ký hoạt động
                            </button>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto px-6 py-6">
                            {activeTab === "info" ? (
                                <div className="space-y-6">
                                    <p className="text-sm leading-7 text-slate-600">{selectedShop.mo_ta || "Chưa có mô tả"}</p>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className={`${adminStyles.detailCard} p-4 text-sm text-slate-700`}>
                                            <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Thông tin liên hệ</h4>
                                            <p>Người bán: {selectedShop.owner?.ho_ten || "--"}</p>
                                            <p>Email: {selectedShop.email || selectedShop.owner?.email || "--"}</p>
                                            <p>SĐT: {selectedShop.so_dien_thoai || selectedShop.owner?.so_dien_thoai || "--"}</p>
                                            <p>Địa chỉ lấy hàng: {selectedShop.dia_chi_lay_hang || "--"}</p>
                                        </div>

                                        <div className={`${adminStyles.detailCard} p-4 text-sm text-slate-700`}>
                                            <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Hiệu suất hoạt động</h4>
                                            <p>Doanh thu: {formatCurrency(selectedShop.doanh_thu)}</p>
                                            <p>Đơn hàng: {selectedShop.orders_count ?? 0}</p>
                                            <p>Sản phẩm: {selectedShop.san_phams_count ?? 0}</p>
                                            <p>Trạng thái: {getShopStatusLabel(selectedShop.trang_thai)}</p>
                                        </div>
                                    </div>

                                    {selectedShop.ly_do_tu_choi && (
                                        <div className={`${adminStyles.detailCard} p-4 text-sm text-slate-700`}>
                                            <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Lý do từ chối</h4>
                                            <p>{selectedShop.ly_do_tu_choi}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Lịch sử thay đổi hệ thống</h4>
                                    {logsLoading ? (
                                        <div className="py-10 text-center text-slate-500">Đang tải nhật ký...</div>
                                    ) : shopLogs.length > 0 ? (
                                        <div className="overflow-hidden rounded-2xl border border-slate-200">
                                            <table className="w-full text-left text-sm">
                                                <thead className="bg-slate-50">
                                                    <tr>
                                                        <th className="px-4 py-3 font-semibold text-slate-700">Thời gian</th>
                                                        <th className="px-4 py-3 font-semibold text-slate-700">Hành động</th>
                                                        <th className="px-4 py-3 font-semibold text-slate-700">Mô tả</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {shopLogs.map((log) => (
                                                        <tr key={log.id} className="border-t">
                                                            <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                                                                {new Date(log.created_at).toLocaleString("vi-VN")}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span className="rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-bold uppercase text-blue-600">
                                                                    {log.hanh_dong}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-slate-700">{log.mo_ta}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="py-10 text-center text-slate-500">Chưa có hoạt động nào được ghi nhận cho shop này.</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}