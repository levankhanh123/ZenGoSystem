import React, { useEffect, useMemo, useState } from "react";
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
    const [orderList, setOrderList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [submittingId, setSubmittingId] = useState(null);
    const [filters, setFilters] = useUrlFilterState({
        keyword: "",
        loai_xu_ly: "",
        bat_thuong: "",
    });
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [error, setError] = useState(null);
    const savedViews = useSavedFilterViews("admin-orders-views", filters, setFilters);

    useEffect(() => {
        let mounted = true;

        const fetchOrders = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await get("/api/admin/orders", {
                    keyword: filters.keyword,
                    loai_xu_ly: filters.loai_xu_ly,
                    bat_thuong: filters.bat_thuong,
                });

                if (mounted) {
                    setOrderList(response.data || []);
                }
            } catch {
                if (mounted) {
                    setError("Không thể tải danh sách đơn hàng.");
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        fetchOrders();

        return () => {
            mounted = false;
        };
    }, [filters.bat_thuong, filters.keyword, filters.loai_xu_ly]);

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
            <section className={adminStyles.pageHero}>
                <div>
                    <span className={adminStyles.eyebrow}>Đơn hàng</span>
                    <h3 className="mt-4 max-w-3xl text-3xl font-extrabold tracking-tight text-slate-900 md:text-[2.25rem] md:leading-[1.1]">
                        Kiểm soát đơn hàng và case rủi ro.
                    </h3>
                </div>
            </section>

            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className={`${adminStyles.statCard} p-5`}>
                    <p className="text-sm text-slate-500">Đơn hàng</p>
                    <h4 className="mt-2 text-3xl font-bold text-slate-800">{summary.total}</h4>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">all orders</p>
                </div>
                <div className={`${adminStyles.statCard} p-5`}>
                    <p className="text-sm text-slate-500">Đơn bất thường</p>
                    <h4 className="mt-2 text-3xl font-bold text-red-700">{summary.abnormal}</h4>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">risk flagged</p>
                </div>
                <div className={`${adminStyles.statCard} p-5`}>
                    <p className="text-sm text-slate-500">Cần admin can thiệp</p>
                    <h4 className="mt-2 text-3xl font-bold text-yellow-700">{summary.needReview}</h4>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">manual review</p>
                </div>
                <div className={`${adminStyles.statCard} p-5`}>
                    <p className="text-sm text-slate-500">Đã giao</p>
                    <h4 className="mt-2 text-3xl font-bold text-green-700">{summary.delivered}</h4>
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
                    <span className={adminStyles.chip}>Tổng: {filteredOrders.length}</span>
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
                            {filteredOrders.map((order) => (
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

                            {!loading && filteredOrders.length === 0 && (
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
            </div>

            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(20,11,8,0.52)] px-4 py-6 backdrop-blur-sm">
                    <div className={`${adminStyles.modalSurface} w-full max-w-4xl`}>
                        <div className="sticky top-0 border-b border-[rgba(132,86,72,0.1)] bg-[rgba(255,250,247,0.94)] px-6 py-5 backdrop-blur-sm">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <span className={adminStyles.eyebrow}>Order detail</span>
                                    <h3 className="mt-3 text-xl font-bold text-slate-800">Đơn hàng {selectedOrder.ma_don_hang}</h3>
                                    <p className="mt-2 text-sm text-slate-500">
                                        {detailLoading ? "Đang tải chi tiết đơn hàng..." : "Thông tin chi tiết và tình trạng vận hành."}
                                    </p>
                                </div>

                                <button onClick={() => setSelectedOrder(null)} className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">
                                    Đóng
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-2">
                            <div className={`${adminStyles.detailCard} p-4 text-sm text-slate-700`}>
                                <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Thông tin chung</h4>
                                <p>Khách hàng: {selectedOrder.buyer?.ho_ten || selectedOrder.ten_nguoi_nhan}</p>
                                <p>Shop: {selectedOrder.shop?.ten_cua_hang || "--"}</p>
                                <p>Người nhận: {selectedOrder.ten_nguoi_nhan}</p>
                                <p>SĐT: {selectedOrder.so_dien_thoai_nguoi_nhan}</p>
                                <p>Địa chỉ: {selectedOrder.dia_chi_nhan}</p>
                                <p>Tổng tiền: {Number(selectedOrder.tong_tien || 0).toLocaleString("vi-VN")} đ</p>
                            </div>

                            <div className={`${adminStyles.detailCard} p-4 text-sm text-slate-700`}>
                                <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Trạng thái vận hành</h4>
                                <p>Đơn hàng: {getOrderStatusLabel(selectedOrder.trang_thai_don_hang)}</p>
                                <p>Thanh toán: {getPaymentStatusLabel(selectedOrder.trang_thai_thanh_toan)}</p>
                                <p>Kiểm tra: {getVerifyStatusLabel(selectedOrder.trang_thai_xac_nhan)}</p>
                                <p>Loại xử lý: {getProcessTypeLabel(selectedOrder.loai_xu_ly)}</p>
                                <p>Giao hàng: {selectedOrder.delivery?.trang_thai || "--"}</p>
                            </div>

                            <div className={`${adminStyles.detailCard} p-4 text-sm text-slate-700 lg:col-span-2`}>
                                <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Dấu hiệu rủi ro</h4>
                                {(selectedOrder.ly_do_bat_thuong || []).length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedOrder.ly_do_bat_thuong.map((reason) => (
                                            <span key={reason} className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                                                {getRiskReasonLabel(reason)}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p>Không có dấu hiệu rủi ro đang mở.</p>
                                )}

                                {selectedOrder.ly_do_huy && <p className="mt-3">Lý do hủy: {selectedOrder.ly_do_huy}</p>}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}