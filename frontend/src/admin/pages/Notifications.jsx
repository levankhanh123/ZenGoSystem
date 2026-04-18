import React, { useEffect, useEffectEvent, useMemo, useState } from "react";
import SavedFilterViews from "../components/SavedFilterViews";
import { del, get, post, put } from "../lib/api";
import { adminStyles } from "../lib/adminStyles";
import { getSocketClient } from "../lib/socketClient";
import { useSavedFilterViews } from "../lib/useSavedFilterViews";
import { useUrlFilterState } from "../lib/useUrlFilterState";

function formatDateTime(value) {
    if (!value) {
        return "--";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "--";
    }

    return date.toLocaleString("vi-VN");
}

function getNotificationTypeMeta(type) {
    switch (type) {
        case "alert":
            return {
                label: "Cảnh báo vận hành",
                chipClass: "bg-red-50 text-red-700 border-red-200",
            };
        case "system":
            return {
                label: "Hệ thống",
                chipClass: "bg-slate-100 text-slate-700 border-slate-200",
            };
        case "promotion":
            return {
                label: "Khuyến mãi",
                chipClass: "bg-violet-50 text-violet-700 border-violet-200",
            };
        case "payment":
            return {
                label: "Thanh toán",
                chipClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
            };
        case "refund":
            return {
                label: "Hoàn tiền",
                chipClass: "bg-amber-50 text-amber-700 border-amber-200",
            };
        case "campaign":
            return {
                label: "Campaign",
                chipClass: "bg-sky-50 text-sky-700 border-sky-200",
            };
        default:
            return {
                label: "Thông báo chung",
                chipClass: "bg-orange-50 text-orange-700 border-orange-200",
            };
    }
}

function getRoleLabel(role) {
    switch (role) {
        case "customer":
        case "nguoi_mua":
            return "Người mua";
        case "shop":
        case "nguoi_ban":
            return "Người bán";
        case "shipper":
        case "giao_hang":
            return "Shipper";
        case "admin":
        case "quan_tri":
            return "Admin";
        default:
            return role || "Không xác định";
    }
}

function getReadStateMeta(isRead) {
    return isRead
        ? {
              label: "Đã đọc",
              chipClass: "bg-slate-100 text-slate-600 border-slate-200",
          }
        : {
              label: "Chưa đọc",
              chipClass: "bg-red-50 text-red-700 border-red-200",
          };
}

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [type, setType] = useState("general");
    const [role, setRole] = useState("customer");
    const [userId, setUserId] = useState("");
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({ totalCount: 0, unreadCount: 0 });
    const [selectedIds, setSelectedIds] = useState([]);
    const [filters, setFilters] = useUrlFilterState({
        keyword: "",
        role: "",
        type: "",
        readState: "",
        userId: "",
    });

    const unreadCount = useMemo(() => stats.unreadCount, [stats.unreadCount]);
    const savedViews = useSavedFilterViews("admin-notifications-views", filters, setFilters);
    const alertCount = useMemo(
        () => notifications.filter((item) => item.loai_thong_bao === "alert").length,
        [notifications]
    );
    const allVisibleSelected = notifications.length > 0 && selectedIds.length === notifications.length;
    const currentScopeLabel = userId
        ? `Gửi riêng cho ${users.find((user) => String(user.id) === userId)?.ho_ten || "tài khoản đã chọn"}`
        : `Gửi cho toàn bộ ${getRoleLabel(role).toLowerCase()}`;

    const fetchNotifications = async (nextFilters = filters) => {
        setLoading(true);
        try {
            const response = await get("/api/admin/notifications", {
                keyword: nextFilters.keyword,
                vai_tro: nextFilters.role,
                loai_thong_bao: nextFilters.type,
                da_doc: nextFilters.readState === "" ? undefined : nextFilters.readState === "read",
                nguoi_dung_id: nextFilters.userId || undefined,
            });
            setNotifications(response.data || []);
            setStats({
                totalCount: response.total_count || 0,
                unreadCount: response.unread_count || 0,
            });
            setSelectedIds([]);
        } catch {
            setError("Không thể tải thông báo.");
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await get("/api/admin/users");
            setUsers(response.data || []);
        } catch {
            setUsers([]);
        }
    };

    useEffect(() => {
        fetchNotifications();
        fetchUsers();
    }, []);

    useEffect(() => {
        fetchNotifications(filters);
    }, [filters.keyword, filters.readState, filters.role, filters.type, filters.userId]);

    const handleRealtimeNotificationChange = useEffectEvent((payload) => {
        const changedNotification = payload?.notification;
        const deletedNotificationId = payload?.notification_id;

        if (changedNotification && filters.userId && String(changedNotification.nguoi_dung_id) !== String(filters.userId)) {
            return;
        }

        if (changedNotification && filters.type && changedNotification.loai_thong_bao !== filters.type) {
            return;
        }

        if (changedNotification && filters.readState === "read" && !changedNotification.da_doc) {
            return;
        }

        if (changedNotification && filters.readState === "unread" && changedNotification.da_doc) {
            return;
        }

        if (deletedNotificationId && !notifications.some((item) => item.id === deletedNotificationId)) {
            return;
        }

        fetchNotifications(filters);
    });

    useEffect(() => {
        const socket = getSocketClient();

        socket.connect();
        socket.emit("join_room", "admin.notifications");
        socket.on("notification.created", handleRealtimeNotificationChange);
        socket.on("notification.updated", handleRealtimeNotificationChange);
        socket.on("notification.deleted", handleRealtimeNotificationChange);

        return () => {
            socket.emit("leave_room", "admin.notifications");
            socket.off("notification.created", handleRealtimeNotificationChange);
            socket.off("notification.updated", handleRealtimeNotificationChange);
            socket.off("notification.deleted", handleRealtimeNotificationChange);
        };
    }, [handleRealtimeNotificationChange]);

    const handleCreate = async (event) => {
        event.preventDefault();
        setError(null);

        if (!title || !message) {
            setError("Tiêu đề và nội dung không được để trống.");
            return;
        }

        try {
            const payload = {
                tieu_de: title,
                noi_dung: message,
                loai_thong_bao: type,
            };

            if (userId) {
                payload.nguoi_dung_id = Number(userId);
            } else {
                payload.vai_tro = role;
            }

            if (userId) {
                await post("/api/admin/notifications", payload);
            } else {
                await post("/api/admin/notifications/broadcast", payload);
            }

            setTitle("");
            setMessage("");
            setType("general");
            setUserId("");
            await fetchNotifications(filters);
        } catch (requestError) {
            setError(requestError.message || "Lỗi khi gửi thông báo.");
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await put(`/api/admin/notifications/${id}/read`, {});
            await fetchNotifications(filters);
        } catch {
            setError("Lỗi khi cập nhật trạng thái thông báo.");
        }
    };

    const handleDelete = async (id) => {
        try {
            await del(`/api/admin/notifications/${id}`);
            await fetchNotifications(filters);
        } catch {
            setError("Lỗi khi xóa thông báo.");
        }
    };

    const handleToggleAll = () => {
        if (allVisibleSelected) {
            setSelectedIds([]);
            return;
        }

        setSelectedIds(notifications.map((item) => item.id));
    };

    const handleToggleOne = (id) => {
        setSelectedIds((current) =>
            current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
        );
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) {
            setError("Hãy chọn ít nhất một thông báo để xóa.");
            return;
        }

        setActionLoading(true);
        setError(null);

        try {
            await del("/api/admin/notifications", { ids: selectedIds });
            await fetchNotifications(filters);
        } catch (requestError) {
            setError(requestError.message || "Không thể xóa loạt thông báo đã chọn.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleMarkScopeAsRead = async () => {
        setActionLoading(true);
        setError(null);

        try {
            const payload = {};

            if (filters.userId) {
                payload.nguoi_dung_id = Number(filters.userId);
            } else if (filters.role) {
                payload.vai_tro = filters.role;
            }

            await put("/api/admin/notifications/read-all", payload);
            await fetchNotifications(filters);
        } catch (requestError) {
            setError(requestError.message || "Không thể đánh dấu đã đọc theo phạm vi hiện tại.");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className={adminStyles.pageStack}>
            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className={`${adminStyles.statCard} p-5`}>
                    <p className="text-sm text-slate-500">Tổng lượt gửi</p>
                    <h4 className="mt-2 text-3xl font-bold text-slate-800">{stats.totalCount}</h4>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">notification volume</p>
                </div>
                <div className={`${adminStyles.statCard} p-5`}>
                    <p className="text-sm text-slate-500">Chưa đọc</p>
                    <h4 className="mt-2 text-3xl font-bold text-[var(--admin-primary)]">{unreadCount}</h4>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">pending reads</p>
                </div>
                <div className={`${adminStyles.statCard} p-5`}>
                    <p className="text-sm text-slate-500">Cảnh báo vận hành</p>
                    <h4 className="mt-2 text-3xl font-bold text-red-700">{alertCount}</h4>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">alert traffic</p>
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.45fr_0.9fr]">
                <section className={`${adminStyles.tableCard} p-6`}>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className={adminStyles.sectionTitle}>Nhật ký thông báo</h2>
                                <p className="mt-1 text-sm text-slate-500">Theo dõi broadcast, cảnh báo hệ thống và thông báo gửi theo tài khoản.</p>
                            </div>
                            <span className={adminStyles.chip}>Chưa đọc: {unreadCount}</span>
                        </div>

                        <div>
                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                                <input
                                    value={filters.keyword}
                                    onChange={(event) => setFilters((current) => ({ ...current, keyword: event.target.value }))}
                                    className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                                    placeholder="Tìm theo tiêu đề, nội dung, người nhận"
                                />
                                <select value={filters.role} onChange={(event) => setFilters((current) => ({ ...current, role: event.target.value, userId: current.userId && event.target.value === "" ? current.userId : current.userId }))} className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none">
                                    <option value="">Tất cả vai trò</option>
                                    <option value="customer">Người mua</option>
                                    <option value="shop">Người bán</option>
                                    <option value="shipper">Shipper</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <select value={filters.type} onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value }))} className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none">
                                    <option value="">Tất cả loại</option>
                                    <option value="general">Chung</option>
                                    <option value="system">Hệ thống</option>
                                    <option value="alert">Cảnh báo</option>
                                    <option value="promotion">Khuyến mãi</option>
                                    <option value="payment">Payment</option>
                                    <option value="refund">Refund</option>
                                    <option value="campaign">Campaign</option>
                                </select>
                                <select value={filters.readState} onChange={(event) => setFilters((current) => ({ ...current, readState: event.target.value }))} className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none">
                                    <option value="">Mọi trạng thái đọc</option>
                                    <option value="unread">Chưa đọc</option>
                                    <option value="read">Đã đọc</option>
                                </select>
                                <select value={filters.userId} onChange={(event) => setFilters((current) => ({ ...current, userId: event.target.value }))} className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none">
                                    <option value="">Tất cả tài khoản</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.ho_ten || user.name} ({user.vai_tro})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button type="button" onClick={handleToggleAll} className={adminStyles.secondaryButton}>
                                {allVisibleSelected ? "Bỏ chọn" : "Chọn tất cả"}
                            </button>
                            <button type="button" disabled={actionLoading} onClick={handleMarkScopeAsRead} className="rounded-[16px] bg-sky-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60">
                                {actionLoading ? "Đang xử lý..." : filters.userId ? "Đọc hết tài khoản này" : filters.role ? "Đọc hết nhóm này" : "Đọc hết toàn bộ"}
                            </button>
                            <button type="button" disabled={actionLoading || selectedIds.length === 0} onClick={handleBulkDelete} className="rounded-[16px] border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60">
                                Xóa đã chọn ({selectedIds.length})
                            </button>
                            <button type="button" onClick={() => setFilters({ keyword: "", role: "", type: "", readState: "", userId: "" })} className={adminStyles.secondaryButton}>
                                Xóa bộ lọc
                            </button>
                        </div>

                        <SavedFilterViews
                            title="Preset thông báo"
                            draftName={savedViews.draftName}
                            setDraftName={savedViews.setDraftName}
                            onSave={savedViews.saveCurrentView}
                            views={savedViews.views}
                            onApply={savedViews.applyView}
                            onDelete={savedViews.deleteView}
                        />
                    </div>

                    {loading ? (
                        <div className="py-20 text-center text-slate-500">Đang tải...</div>
                    ) : (
                        <div className="mt-6 space-y-4">
                            {notifications.length === 0 ? (
                                <div className={`${adminStyles.emptyState} p-8 text-center text-sm`}>Chưa có thông báo.</div>
                            ) : (
                                notifications.map((notification) => (
                                    <article
                                        key={notification.id}
                                        className={`rounded-[24px] border px-5 py-4 transition ${
                                            notification.da_doc
                                                ? "border-[rgba(132,86,72,0.12)] bg-[rgba(255,250,247,0.72)]"
                                                : "border-[rgba(238,77,45,0.2)] bg-[rgba(255,242,237,0.88)]"
                                        }`}
                                    >
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="flex gap-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(notification.id)}
                                                    onChange={() => handleToggleOne(notification.id)}
                                                    className="mt-1 h-4 w-4 rounded border-slate-300 text-[var(--admin-primary)]"
                                                />
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2 text-xs">
                                                        <span className={`rounded-full border px-3 py-1 font-semibold ${getNotificationTypeMeta(notification.loai_thong_bao).chipClass}`}>
                                                            {getNotificationTypeMeta(notification.loai_thong_bao).label}
                                                        </span>
                                                        <span className={`rounded-full border px-3 py-1 font-semibold ${getReadStateMeta(notification.da_doc).chipClass}`}>
                                                            {getReadStateMeta(notification.da_doc).label}
                                                        </span>
                                                        <span className="text-slate-400">{formatDateTime(notification.created_at)}</span>
                                                    </div>

                                                    <h3 className="mt-3 text-lg font-semibold text-slate-900">{notification.tieu_de}</h3>
                                                    <p className="mt-2 whitespace-pre-line text-slate-700">{notification.noi_dung}</p>

                                                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                                                        <span>
                                                            Nhận bởi: {notification.user?.ho_ten || notification.user?.name || "--"}
                                                        </span>
                                                        <span>
                                                            Vai trò: {getRoleLabel(notification.user?.vai_tro || notification.target_role)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 text-right">
                                                {!notification.da_doc && (
                                                    <button
                                                        onClick={() => handleMarkAsRead(notification.id)}
                                                        className="rounded-[16px] bg-sky-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-sky-700"
                                                    >
                                                        Đánh dấu đọc
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(notification.id)}
                                                    className={`${adminStyles.secondaryButton} px-4 py-2`}
                                                >
                                                    Xóa
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                ))
                            )}
                        </div>
                    )}
                </section>

                <aside className={`${adminStyles.panel} rounded-[32px] p-6`}>
                    <h2 className={adminStyles.sectionTitle}>Tạo thông báo</h2>
                    <p className="mt-1 text-sm text-slate-500">Soạn broadcast theo vai trò hoặc gửi riêng cho một tài khoản cụ thể.</p>

                    <div className="mt-4 rounded-[20px] border border-[rgba(132,86,72,0.1)] bg-[rgba(255,248,244,0.82)] p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--admin-primary)]">Phạm vi gửi</p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">{currentScopeLabel}</p>
                        <p className="mt-1 text-xs text-slate-500">Để trống tài khoản cụ thể nếu muốn broadcast theo nhóm.</p>
                    </div>

                    <form onSubmit={handleCreate} className="mt-5 space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Tiêu đề</label>
                            <input
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                                placeholder="Ví dụ: Đơn hàng cần bổ sung chứng từ"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Nội dung</label>
                            <textarea
                                value={message}
                                onChange={(event) => setMessage(event.target.value)}
                                className="h-32 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                                placeholder="Nội dung ngắn, rõ hành động tiếp theo, thời hạn hoặc hướng dẫn cần làm."
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Loại thông báo</label>
                            <select value={type} onChange={(event) => setType(event.target.value)} className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none">
                                <option value="general">Thông báo chung</option>
                                <option value="system">Hệ thống</option>
                                <option value="alert">Cảnh báo vận hành</option>
                                <option value="promotion">Khuyến mãi</option>
                                <option value="payment">Thanh toán</option>
                                <option value="refund">Hoàn tiền</option>
                                <option value="campaign">Campaign</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Gửi tới</label>
                            <div className="grid gap-3">
                                <select value={role} onChange={(event) => setRole(event.target.value)} className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none">
                                    <option value="customer">Người mua</option>
                                    <option value="shop">Người bán</option>
                                    <option value="shipper">Shipper</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <select value={userId} onChange={(event) => setUserId(event.target.value)} className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none">
                                    <option value="">Gửi cho toàn bộ nhóm đã chọn</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.ho_ten || user.name} ({getRoleLabel(user.vai_tro)})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button type="submit" className={adminStyles.primaryButton}>
                            Gửi thông báo
                        </button>
                    </form>
                </aside>
            </div>
        </div>
    );
}