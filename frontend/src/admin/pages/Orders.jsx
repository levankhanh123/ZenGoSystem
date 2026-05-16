import React, { useEffect, useMemo, useState, useRef } from "react";
import { Search, Filter, MoreVertical, ShieldAlert, ShieldCheck, UserPlus, RefreshCcw, Download, Trash2, Mail, Phone, MapPin, Calendar, Clock, BarChart3, TrendingUp, Users, ChevronRight, X, AlertCircle, CheckCircle2 } from "lucide-react";
import SavedFilterViews from "../components/SavedFilterViews";
import { get, put } from "../lib/api";
import { adminStyles } from "../lib/adminStyles";
import { useSavedFilterViews } from "../lib/useSavedFilterViews";
import { useUrlFilterState } from "../lib/useUrlFilterState";

function getOrderStatusClass(status) {
    switch (status) {
        case "cho_xac_nhan":
            return "bg-yellow-100 text-yellow-700";
        case "dang_giao":
            return "bg-blue-100 text-blue-700";
        case "da_giao":
            return "bg-green-100 text-green-700";
        case "da_huy":
            return "bg-red-100 text-red-700";
        default:
            return "bg-slate-100 text-slate-700";
    }
}

function getOrderStatusLabel(status) {
    switch (status) {
        case "cho_xac_nhan":
            return "Chờ xác nhận";
        case "dang_giao":
            return "Đang giao";
        case "da_giao":
            return "Đã giao";
        case "da_huy":
            return "Đã hủy";
        default:
            return status || "Chưa rõ";
    }
}

function getPaymentStatusClass(status) {
    switch (status) {
        case "da_thanh_toan":
            return "bg-green-100 text-green-700";
        case "chua_thanh_toan":
            return "bg-red-100 text-red-700";
        default:
            return "bg-slate-100 text-slate-700";
    }
}

function getPaymentStatusLabel(status) {
    switch (status) {
        case "da_thanh_toan":
            return "Đã thanh toán";
        case "chua_thanh_toan":
            return "Chưa thanh toán";
        default:
            return status || "Chưa rõ";
    }
}

function getVerifyStatusClass(status) {
    switch (status) {
        case "cho_he_thong_xac_nhan":
            return "bg-sky-100 text-sky-700";
        case "can_admin_xac_nhan":
            return "bg-orange-100 text-orange-700";
        case "da_xac_nhan":
            return "bg-green-100 text-green-700";
        default:
            return "bg-slate-100 text-slate-700";
    }
}

function getVerifyStatusLabel(status) {
    switch (status) {
        case "cho_he_thong_xac_nhan":
            return "Chờ hệ thống xử lý";
        case "can_admin_xac_nhan":
            return "Cần admin can thiệp";
        case "da_xac_nhan":
            return "Đã xác minh";
        default:
            return status || "Chưa rõ";
    }
}

function getProcessTypeLabel(type) {
    switch (type) {
        case "tu_dong":
            return "Tự động";
        case "thu_cong":
            return "Thủ công";
        default:
            return type || "--";
    }
}

function getRiskReasonLabel(reason) {
    switch (reason) {
        case "gia_tri_cao":
            return "Giá trị cao";
        case "khach_rui_ro":
            return "Khách rủi ro";
        case "thanh_toan_nghi_ngo":
            return "Thanh toán nghi ngờ";
        default:
            return reason || "Bất thường";
    }
}

export default function Orders() {
    const mounted = useRef(true);
    const [orderList, setOrderList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [submittingId, setSubmittingId] = useState(null);
    const [totalOrders, setTotalOrders] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [globalStats, setGlobalStats] = useState({ total: 0, abnormal: 0, need_review: 0, delivered: 0 });
    const [activeTab, setActiveTab] = useState("info"); // info, history
    const [filters, setFilters] = useUrlFilterState({
        keyword: "",
        loai_xu_ly: "",
        bat_thuong: "",
    });
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [error, setError] = useState(null);
    const savedViews = useSavedFilterViews("admin-orders-views", filters, setFilters);

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await get("/api/admin/orders", {
                ...filters,
                page: currentPage,
                per_page: perPage,
            });

            if (mounted.current) {
                setOrderList(response.data || []);
                setTotalOrders(response.total || 0);
                if (response.stats) {
                    setGlobalStats(response.stats);
                }
            }
        } catch {
            if (mounted.current) {
                setError("Không thể tải danh sách đơn hàng.");
            }
        } finally {
            if (mounted.current) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        mounted.current = true;
        fetchOrders();
        return () => {
            mounted.current = false;
        };
    }, [filters, currentPage]);

    const handleRefresh = () => {
        if (currentPage === 1) {
            fetchOrders();
        } else {
            setCurrentPage(1);
        }
    };

    const summary = useMemo(
        () => ({
            total: orderList.length,
            abnormal: orderList.filter((order) => order.bat_thuong).length,
            needReview: orderList.filter(
                (order) => order.trang_thai_xac_nhan === "can_admin_xac_nhan"
            ).length,
            delivered: orderList.filter((order) => order.trang_thai_don_hang === "da_giao").length,
        }),
        [orderList]
    );

    const filteredOrders = useMemo(() => {
        return orderList.filter((order) => {
            const keyword = filters.keyword.trim().toLowerCase();
            const orderCode = String(order.ma_don_hang || "").toLowerCase();
            const buyerName = String(order.buyer?.ho_ten || order.ten_nguoi_nhan || "").toLowerCase();
            const shopName = String(order.shop?.ten_cua_hang || "").toLowerCase();
            const matchKeyword = !keyword || orderCode.includes(keyword) || buyerName.includes(keyword) || shopName.includes(keyword);
            const matchLoaiXuLy = !filters.loai_xu_ly || order.loai_xu_ly === filters.loai_xu_ly;
            const matchBatThuong = filters.bat_thuong === "" ? true : String(order.bat_thuong) === filters.bat_thuong;

            return matchKeyword && matchLoaiXuLy && matchBatThuong;
        });
    }, [filters, orderList]);

    const handleOpenOrder = async (order) => {
        setSelectedOrder(order);
        setActiveTab("info");
        setDetailLoading(true);

        try {
            const response = await get(`/api/admin/orders/${order.id}`);
            setSelectedOrder(response.data || order);
        } catch {
            setError("Không thể tải chi tiết đơn hàng.");
        } finally {
            setDetailLoading(false);
        }
    };

    const handleVerifyOrder = async (order) => {
        setSubmittingId(order.id);
        setError(null);

        try {
            const response = await put(`/api/admin/orders/${order.id}/status`, {
                trang_thai_xac_nhan: "da_xac_nhan",
                bat_thuong: false,
                ly_do_bat_thuong: [],
                loai_xu_ly: "thu_cong",
                ghi_chu_lich_su: "Admin xác minh đơn hàng từ màn hình quản trị.",
            });
            const updatedOrder = response.data || {
                ...order,
                trang_thai_xac_nhan: "da_xac_nhan",
                bat_thuong: false,
                ly_do_bat_thuong: [],
            };

            setOrderList((current) =>
                current.map((item) => (item.id === order.id ? { ...item, ...updatedOrder } : item))
            );

            if (selectedOrder?.id === order.id) {
                setSelectedOrder((current) => ({ ...current, ...updatedOrder }));
            }
        } catch {
            setError("Không thể cập nhật trạng thái kiểm tra đơn hàng.");
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
                        <h1 className={adminStyles.heroTitle}>Quản lý đơn hàng</h1>
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
                            <span className={adminStyles.heroBadge}>ĐƠN HÀNG</span>
                            <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">
                                {new Date().toLocaleDateString("vi-VN")}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className={`${adminStyles.statCard} p-5`}>
                    <p className="text-sm text-slate-500">Đơn hàng</p>
                    <h4 className="mt-2 text-3xl font-bold text-slate-800">{globalStats.total}</h4>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">all orders</p>
                </div>
                <div className={`${adminStyles.statCard} p-5`}>
                    <p className="text-sm text-slate-500">Đơn bất thường</p>
                    <h4 className="mt-2 text-3xl font-bold text-red-700">{globalStats.abnormal}</h4>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">risk flagged</p>
                </div>
                <div className={`${adminStyles.statCard} p-5`}>
                    <p className="text-sm text-slate-500">Cần admin can thiệp</p>
                    <h4 className="mt-2 text-3xl font-bold text-yellow-700">{globalStats.need_review}</h4>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">manual review</p>
                </div>
                <div className={`${adminStyles.statCard} p-5`}>
                    <p className="text-sm text-slate-500">Đã giao</p>
                    <h4 className="mt-2 text-3xl font-bold text-green-700">{globalStats.delivered}</h4>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">completed</p>
                </div>
            </div>

            <div className={`${adminStyles.panel} rounded-[30px] p-5 md:p-6`}>
                <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ee4d2d]">Lọc nhanh</p>
                        <h4 className="mt-2 text-lg font-bold text-slate-900">Bộ lọc</h4>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <input
                        type="text"
                        placeholder="Tìm mã đơn, khách hàng, cửa hàng"
                        value={filters.keyword}
                        onChange={(event) => setFilters({ ...filters, keyword: event.target.value })}
                        className="rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none"
                    />

                    <select
                        value={filters.loai_xu_ly}
                        onChange={(event) => setFilters({ ...filters, loai_xu_ly: event.target.value })}
                        className="rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none"
                    >
                        <option value="">Tất cả loại xử lý</option>
                        <option value="tu_dong">Tự động</option>
                        <option value="thu_cong">Thủ công</option>
                    </select>

                    <select
                        value={filters.bat_thuong}
                        onChange={(event) => setFilters({ ...filters, bat_thuong: event.target.value })}
                        className="rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none"
                    >
                        <option value="">Tất cả đơn</option>
                        <option value="true">Đơn bất thường</option>
                        <option value="false">Đơn bình thường</option>
                    </select>

                    <button
                        type="button"
                        onClick={() => setFilters({ keyword: "", loai_xu_ly: "", bat_thuong: "" })}
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
                    <h4 className={adminStyles.sectionTitle}>Danh sách đơn hàng toàn sàn</h4>
                    <span className={adminStyles.chip}>Hiển thị: {orderList.length} / Tổng: {totalOrders}</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead>
                            <tr>
                                <th className="px-4 py-3">Mã đơn</th>
                                <th className="px-4 py-3">Khách hàng</th>
                                <th className="px-4 py-3">Cửa hàng</th>
                                <th className="px-4 py-3">Tổng tiền</th>
                                <th className="px-4 py-3">Trạng thái đơn</th>
                                <th className="px-4 py-3">Thanh toán</th>
                                <th className="px-4 py-3">Kiểm tra</th>
                                <th className="px-4 py-3">Loại xử lý</th>
                                <th className="px-4 py-3">Dấu hiệu rủi ro</th>
                                <th className="px-4 py-3">Can thiệp</th>
                            </tr>
                        </thead>

                        <tbody>
                            {orderList.map((order) => (
                                <tr key={order.id} className="border-t align-top">
                                    <td className="px-4 py-3 font-medium text-slate-800">
                                        <button type="button" onClick={() => handleOpenOrder(order)} className="text-left text-[#ee4d2d] hover:underline">
                                            {order.ma_don_hang}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3">{order.buyer?.ho_ten || order.ten_nguoi_nhan}</td>
                                    <td className="px-4 py-3">{order.shop?.ten_cua_hang || "--"}</td>
                                    <td className="px-4 py-3">{Number(order.tong_tien || 0).toLocaleString("vi-VN")} đ</td>
                                    <td className="px-4 py-3">
                                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${getOrderStatusClass(order.trang_thai_don_hang)}`}>
                                            {getOrderStatusLabel(order.trang_thai_don_hang)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${getPaymentStatusClass(order.trang_thai_thanh_toan)}`}>
                                            {getPaymentStatusLabel(order.trang_thai_thanh_toan)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${getVerifyStatusClass(order.trang_thai_xac_nhan)}`}>
                                            {getVerifyStatusLabel(order.trang_thai_xac_nhan)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">{getProcessTypeLabel(order.loai_xu_ly)}</td>
                                    <td className="px-4 py-3">
                                        {order.bat_thuong ? (
                                            <div className="flex flex-wrap gap-1">
                                                {(order.ly_do_bat_thuong || ["bat_thuong"]).map((reason) => (
                                                    <span key={reason} className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                                                        {getRiskReasonLabel(reason)}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">Bình thường</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            type="button"
                                            onClick={() => handleVerifyOrder(order)}
                                            disabled={submittingId === order.id || (!order.bat_thuong && order.trang_thai_xac_nhan === "da_xac_nhan")}
                                            className="rounded-[16px] bg-sky-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                                        >
                                            {submittingId === order.id ? "Đang cập nhật" : "Xác minh"}
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {!loading && orderList.length === 0 && (
                                <tr>
                                    <td colSpan="10" className="px-4 py-8 text-center text-slate-500">Không có dữ liệu đơn hàng</td>
                                </tr>
                            )}

                            {loading && (
                                <tr>
                                    <td colSpan="10" className="px-4 py-8 text-center text-slate-500">Đang tải dữ liệu...</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6 flex items-center justify-between border-t pt-4">
                    <div className="text-sm text-slate-500">
                        Trang {currentPage} / {Math.ceil(totalOrders / perPage) || 1}
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
                            disabled={currentPage * perPage >= totalOrders || loading}
                            onClick={() => setCurrentPage((prev) => prev + 1)}
                            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium transition hover:bg-slate-50 disabled:opacity-50"
                        >
                            Sau
                        </button>
                    </div>
                </div>
            </div>

            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(20,11,8,0.52)] px-4 py-6 backdrop-blur-sm">
                    <div className={`${adminStyles.modalSurface} w-full max-w-5xl overflow-hidden`}>
                        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-[rgba(132,86,72,0.1)] bg-[rgba(255,250,247,0.94)] px-6 py-5 backdrop-blur-sm">
                            <div>
                                <span className={adminStyles.eyebrow}>Order detail</span>
                                <h3 className="mt-3 text-xl font-bold text-slate-800">Đơn hàng {selectedOrder.ma_don_hang}</h3>
                                {detailLoading && <p className="mt-2 text-xs text-slate-400">Đang tải chi tiết đơn hàng...</p>}
                            </div>

                            <button
                                onClick={() => setSelectedOrder(null)}
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
                                Thông tin & Sản phẩm
                            </button>
                            <button
                                onClick={() => setActiveTab("history")}
                                className={`px-4 py-3 text-sm font-bold transition-colors ${
                                    activeTab === "history"
                                        ? "border-b-2 border-[#ee4d2d] text-[#ee4d2d]"
                                        : "text-slate-500 hover:text-slate-700"
                                }`}
                            >
                                Lịch sử & Nhật ký
                            </button>
                        </div>

                        <div className="max-h-[65vh] overflow-y-auto px-6 py-6">
                            {activeTab === "info" ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                        <div className={`${adminStyles.detailCard} p-4 text-sm text-slate-700`}>
                                            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Người nhận & Địa chỉ</h4>
                                            <p>Khách hàng: {selectedOrder.buyer?.ho_ten || selectedOrder.ten_nguoi_nhan}</p>
                                            <p>Shop: {selectedOrder.shop?.ten_cua_hang || "--"}</p>
                                            <p>Người nhận: {selectedOrder.ten_nguoi_nhan}</p>
                                            <p>SĐT: {selectedOrder.so_dien_thoai_nguoi_nhan}</p>
                                            <p>Địa chỉ: {selectedOrder.dia_chi_nhan}</p>
                                        </div>

                                        <div className={`${adminStyles.detailCard} p-4 text-sm text-slate-700`}>
                                            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Trạng thái hiện tại</h4>
                                            <p>Đơn hàng: {getOrderStatusLabel(selectedOrder.trang_thai_don_hang)}</p>
                                            <p>Thanh toán: {getPaymentStatusLabel(selectedOrder.trang_thai_thanh_toan)}</p>
                                            <p>Kiểm tra: {getVerifyStatusLabel(selectedOrder.trang_thai_xac_nhan)}</p>
                                            <p>Loại xử lý: {getProcessTypeLabel(selectedOrder.loai_xu_ly)}</p>
                                            <p>Giao hàng: {selectedOrder.delivery?.trang_thai || "--"}</p>
                                            <p className="mt-2 font-bold text-[#ee4d2d]">Tổng tiền: {Number(selectedOrder.tong_tien || 0).toLocaleString("vi-VN")} đ</p>
                                        </div>
                                    </div>

                                    <div className={`${adminStyles.detailCard} p-4`}>
                                        <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Danh sách sản phẩm</h4>
                                        <div className="space-y-3">
                                            {(selectedOrder.chi_tiet_don_hang || []).map((item) => (
                                                <div key={item.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-400">IMG</div>
                                                        <div>
                                                            <p className="font-medium text-slate-800">{item.san_pham?.ten_san_pham || "Sản phẩm không tồn tại"}</p>
                                                            <p className="text-xs text-slate-500">Số lượng: {item.so_luong} x {Number(item.gia_ban).toLocaleString("vi-VN")} đ</p>
                                                        </div>
                                                    </div>
                                                    <p className="font-bold text-slate-700">{Number(item.thanh_tien).toLocaleString("vi-VN")} đ</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {selectedOrder.bat_thuong && (
                                        <div className={`${adminStyles.detailCard} border-red-200 bg-red-50 p-4`}>
                                            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-red-600">Cảnh báo rủi ro</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {(selectedOrder.ly_do_bat_thuong || []).map((reason) => (
                                                    <span key={reason} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-red-700 shadow-sm">
                                                        {getRiskReasonLabel(reason)}
                                                    </span>
                                                ))}
                                            </div>
                                            {selectedOrder.ly_do_huy && <p className="mt-3 text-sm text-red-700">Lý do hủy: {selectedOrder.ly_do_huy}</p>}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Lịch sử thay đổi trạng thái</h4>
                                        <div className="space-y-4">
                                            {(selectedOrder.lich_su_trang_thai || []).map((history, idx) => (
                                                <div key={history.id} className="relative flex gap-4 pl-6">
                                                    {idx !== (selectedOrder.lich_su_trang_thai.length - 1) && (
                                                        <div className="absolute left-[7px] top-6 h-full w-[2px] bg-slate-200" />
                                                    )}
                                                    <div className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#ee4d2d] shadow-sm" />
                                                    <div className="flex-1">
                                                        <p className="text-xs text-slate-500">{new Date(history.created_at).toLocaleString("vi-VN")}</p>
                                                        <p className="mt-1 font-medium text-slate-800">
                                                            {getOrderStatusLabel(history.trang_thai_cu)} → {getOrderStatusLabel(history.trang_thai_moi)}
                                                        </p>
                                                        {history.ghi_chu && <p className="mt-1 text-sm italic text-slate-600 text-sm">"{history.ghi_chu}"</p>}
                                                        <p className="mt-1 text-[10px] text-slate-400">Cập nhật bởi: {history.nguoi_cap_nhat?.ho_ten || "Hệ thống"}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {(selectedOrder.lich_su_trang_thai || []).length === 0 && (
                                                <p className="text-sm text-slate-500 italic">Chưa có lịch sử thay đổi.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}