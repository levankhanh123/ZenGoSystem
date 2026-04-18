import React, { useEffect, useMemo, useState } from "react";
import SavedFilterViews from "../components/SavedFilterViews";
import { get, put } from "../lib/api";
import { adminStyles } from "../lib/adminStyles";
import { useSavedFilterViews } from "../lib/useSavedFilterViews";
import { useUrlFilterState } from "../lib/useUrlFilterState";

function getStatusClass(status) {
    return status === "hoat_dong"
        ? "bg-green-100 text-green-700"
        : "bg-red-100 text-red-700";
}

function getStatusLabel(status) {
    return status === "hoat_dong" ? "Hoạt động" : "Bị khóa";
}

function formatCurrency(value) {
    return `${Number(value || 0).toLocaleString("vi-VN")} đ`;
}

function formatGender(gender) {
    switch (gender) {
        case "nam":
            return "Nam";
        case "nu":
            return "Nữ";
        default:
            return "Khác";
    }
}

function getBuyerRiskLevel(user) {
    const cancelRate =
        (user.tong_don_hang || 0) > 0
            ? ((user.don_huy || 0) / user.tong_don_hang) * 100
            : 0;

    if (user.trang_thai === "khoa" || cancelRate >= 40) {
        return "rui_ro";
    }

    if (cancelRate >= 20) {
        return "canh_bao";
    }

    return "binh_thuong";
}

function getBuyerRiskClass(level) {
    switch (level) {
        case "binh_thuong":
            return "bg-green-50 text-green-700";
        case "canh_bao":
            return "bg-yellow-100 text-yellow-700";
        case "rui_ro":
            return "bg-red-100 text-red-700";
        default:
            return "bg-slate-100 text-slate-700";
    }
}

function getBuyerRiskLabel(level) {
    switch (level) {
        case "binh_thuong":
            return "Bình thường";
        case "canh_bao":
            return "Cảnh báo";
        case "rui_ro":
            return "Rủi ro";
        default:
            return "Chưa phân loại";
    }
}

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [submittingId, setSubmittingId] = useState(null);
    const [bulkSubmitting, setBulkSubmitting] = useState(false);
    const [filters, setFilters] = useUrlFilterState({
        keyword: "",
        trang_thai: "",
        muc_do_noi_bo: "",
    });
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [bulkForm, setBulkForm] = useState({
        trang_thai: "",
        ghi_chu: "",
    });
    const [selectedUser, setSelectedUser] = useState(null);
    const [error, setError] = useState(null);
    const savedViews = useSavedFilterViews("admin-users-views", filters, setFilters);

    useEffect(() => {
        let mounted = true;

        const fetchUsers = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await get("/api/admin/users", {
                    vai_tro: "nguoi_mua",
                    keyword: filters.keyword,
                    trang_thai: filters.trang_thai,
                });

                if (mounted) {
                    setUsers(response.data || []);
                }
            } catch {
                if (mounted) {
                    setError("Không thể tải danh sách người mua.");
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        fetchUsers();

        return () => {
            mounted = false;
        };
    }, [filters.keyword, filters.trang_thai]);

    const summaryStats = useMemo(() => {
        return {
            tongNguoiMua: users.length,
            dangHoatDong: users.filter((u) => u.trang_thai === "hoat_dong").length,
            biKhoa: users.filter((u) => u.trang_thai === "khoa").length,
            tongChiTieu: users.reduce((sum, u) => sum + Number(u.tong_chi_tieu || 0), 0),
        };
    }, [users]);

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const riskLevel = getBuyerRiskLevel(user);

            return !filters.muc_do_noi_bo || riskLevel === filters.muc_do_noi_bo;
        });
    }, [filters.muc_do_noi_bo, users]);

    const riskSignals = useMemo(() => {
        return {
            warning: filteredUsers.filter((user) => getBuyerRiskLevel(user) === "canh_bao").length,
            highRisk: filteredUsers.filter((user) => getBuyerRiskLevel(user) === "rui_ro").length,
        };
    }, [filteredUsers]);

    const selectedVisibleCount = selectedUserIds.filter((id) => filteredUsers.some((user) => user.id === id)).length;

    useEffect(() => {
        setSelectedUserIds((current) => current.filter((id) => filteredUsers.some((user) => user.id === id)));
    }, [filteredUsers]);

    const handleOpenUser = async (user) => {
        setSelectedUser(user);
        setDetailLoading(true);

        try {
            const response = await get(`/api/admin/users/${user.id}`);
            setSelectedUser(response.data || user);
        } catch {
            setError("Không thể tải chi tiết người dùng.");
        } finally {
            setDetailLoading(false);
        }
    };

    const handleToggleStatus = async (user) => {
        const nextStatus = user.trang_thai === "hoat_dong" ? "khoa" : "hoat_dong";

        setSubmittingId(user.id);
        setError(null);

        try {
            const response = await put(`/api/admin/users/${user.id}/status`, {
                trang_thai: nextStatus,
            });
            const updatedUser = response.data || { ...user, trang_thai: nextStatus };

            setUsers((current) =>
                current.map((item) => (item.id === user.id ? { ...item, ...updatedUser } : item))
            );

            if (selectedUser?.id === user.id) {
                setSelectedUser((current) => ({ ...current, ...updatedUser }));
            }
        } catch {
            setError("Không thể cập nhật trạng thái người dùng.");
        } finally {
            setSubmittingId(null);
        }
    };

    const handleToggleUserSelection = (userId) => {
        setSelectedUserIds((current) =>
            current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId]
        );
    };

    const handleToggleAllUsers = () => {
        setSelectedUserIds((current) =>
            current.length === filteredUsers.length ? [] : filteredUsers.map((user) => user.id)
        );
    };

    const handleBulkStatusUpdate = async () => {
        if (selectedUserIds.length === 0 || !bulkForm.trang_thai) {
            setError("Cần chọn buyer và trạng thái trước khi cập nhật hàng loạt.");
            return;
        }

        setBulkSubmitting(true);
        setError(null);

        try {
            const response = await put("/api/admin/users/status/bulk", {
                ids: selectedUserIds,
                trang_thai: bulkForm.trang_thai,
                ghi_chu: bulkForm.ghi_chu || null,
            });
            const updatedUsers = response.data || [];

            setUsers((current) =>
                current.map((user) => {
                    const updatedUser = updatedUsers.find((item) => item.id === user.id);
                    return updatedUser ? { ...user, ...updatedUser } : user;
                })
            );

            if (selectedUser && selectedUserIds.includes(selectedUser.id)) {
                const updatedSelectedUser = updatedUsers.find((item) => item.id === selectedUser.id);

                if (updatedSelectedUser) {
                    setSelectedUser((current) => ({ ...current, ...updatedSelectedUser }));
                }
            }

            setSelectedUserIds([]);
            setBulkForm({ trang_thai: "", ghi_chu: "" });
        } catch {
            setError("Không thể cập nhật trạng thái buyer theo lô.");
        } finally {
            setBulkSubmitting(false);
        }
    };

    return (
        <div className={adminStyles.pageStack}>
            <section className={adminStyles.pageHero}>
                <div>
                    <span className={adminStyles.eyebrow}>Người mua</span>
                    <h3 className="mt-4 max-w-3xl text-3xl font-extrabold tracking-tight text-slate-900 md:text-[2.25rem] md:leading-[1.1]">
                        Kiểm soát người mua và tài khoản rủi ro.
                    </h3>
                </div>
            </section>

            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className={`${adminStyles.statCard} p-5`}>
                    <p className="text-sm text-slate-500">Người mua</p>
                    <h4 className="mt-2 text-3xl font-bold text-slate-800">{summaryStats.tongNguoiMua}</h4>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">buyer base</p>
                </div>

                <div className={`${adminStyles.statCard} p-5`}>
                    <p className="text-sm text-slate-500">Đang hoạt động</p>
                    <h4 className="mt-2 text-3xl font-bold text-green-700">{summaryStats.dangHoatDong}</h4>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">healthy</p>
                </div>

                <div className={`${adminStyles.statCard} p-5`}>
                    <p className="text-sm text-slate-500">Bị khóa</p>
                    <h4 className="mt-2 text-3xl font-bold text-red-700">{summaryStats.biKhoa}</h4>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">blocked</p>
                </div>

                <div className={`${adminStyles.statCard} p-5`}>
                    <p className="text-sm text-slate-500">Chi tiêu</p>
                    <h4 className="mt-2 text-3xl font-bold text-blue-700">{formatCurrency(summaryStats.tongChiTieu)}</h4>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">gmv from buyers</p>
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
                        type="text"
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
                        <option value="khoa">Bị khóa</option>
                    </select>

                    <select
                        value={filters.muc_do_noi_bo}
                        onChange={(event) => setFilters({ ...filters, muc_do_noi_bo: event.target.value })}
                        className="rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none"
                    >
                        <option value="">Tất cả mức độ nội bộ</option>
                        <option value="binh_thuong">Bình thường</option>
                        <option value="canh_bao">Cảnh báo</option>
                        <option value="rui_ro">Rủi ro</option>
                    </select>

                    <button
                        type="button"
                        onClick={() =>
                            setFilters({
                                keyword: "",
                                trang_thai: "",
                                muc_do_noi_bo: "",
                            })
                        }
                        className={adminStyles.primaryButton}
                    >
                        Đặt lại bộ lọc
                    </button>
                </div>

                <div className="mt-5 space-y-4">
                    <SavedFilterViews
                        views={savedViews.views}
                        draftName={savedViews.draftName}
                        setDraftName={savedViews.setDraftName}
                        onSave={savedViews.saveCurrentView}
                        onApply={savedViews.applyView}
                        onDelete={savedViews.deleteView}
                        title="Preset"
                        description=""
                    />

                    <div className="rounded-[26px] border border-[rgba(132,86,72,0.12)] bg-[linear-gradient(180deg,#fff7f3,#ffffff)] p-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ee4d2d]">Cập nhật loạt</p>
                            </div>
                            <button
                                type="button"
                                onClick={handleToggleAllUsers}
                                className={`${adminStyles.secondaryButton} px-4 py-2`}
                            >
                                {filteredUsers.length > 0 && selectedVisibleCount === filteredUsers.length ? "Bỏ chọn tất cả" : "Chọn tất cả danh sách"}
                            </button>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[0.9fr,1.5fr,auto]">
                            <select
                                value={bulkForm.trang_thai}
                                onChange={(event) => setBulkForm((current) => ({ ...current, trang_thai: event.target.value }))}
                                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none"
                            >
                                <option value="">Chọn trạng thái batch</option>
                                <option value="hoat_dong">Hoạt động</option>
                                <option value="khoa">Khóa tài khoản</option>
                            </select>

                            <input
                                type="text"
                                value={bulkForm.ghi_chu}
                                onChange={(event) => setBulkForm((current) => ({ ...current, ghi_chu: event.target.value }))}
                                placeholder="Ghi chú nội bộ"
                                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none"
                            />

                            <button
                                type="button"
                                onClick={handleBulkStatusUpdate}
                                disabled={bulkSubmitting || selectedUserIds.length === 0 || !bulkForm.trang_thai}
                                className={adminStyles.primaryButton}
                            >
                                {bulkSubmitting ? "Đang xử lý..." : `Cập nhật ${selectedUserIds.length} buyer`}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className={`${adminStyles.tableCard} p-5 md:p-6`}>
                <div className="mb-4 flex items-center justify-between">
                    <h4 className={adminStyles.sectionTitle}>Danh sách người mua</h4>
                    <span className={adminStyles.chip}>Tổng: {filteredUsers.length}</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead>
                            <tr>
                                <th className="px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={filteredUsers.length > 0 && selectedVisibleCount === filteredUsers.length}
                                        onChange={handleToggleAllUsers}
                                    />
                                </th>
                                <th className="px-4 py-3">ID</th>
                                <th className="px-4 py-3">Họ tên</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">SĐT</th>
                                <th className="px-4 py-3">Tổng đơn</th>
                                <th className="px-4 py-3">Chi tiêu</th>
                                <th className="px-4 py-3">Nội bộ</th>
                                <th className="px-4 py-3">Trạng thái</th>
                                <th className="px-4 py-3">Can thiệp</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredUsers.map((user) => {
                                const riskLevel = getBuyerRiskLevel(user);

                                return (
                                    <tr key={user.id} className="border-t align-top">
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedUserIds.includes(user.id)}
                                                onChange={() => handleToggleUserSelection(user.id)}
                                            />
                                        </td>
                                        <td className="px-4 py-3">{user.id}</td>
                                        <td
                                            className="cursor-pointer px-4 py-3 font-medium text-[#ee4d2d] hover:underline"
                                            onClick={() => handleOpenUser(user)}
                                        >
                                            {user.ho_ten}
                                        </td>
                                        <td className="px-4 py-3">{user.email}</td>
                                        <td className="px-4 py-3">{user.so_dien_thoai}</td>
                                        <td className="px-4 py-3">{user.tong_don_hang ?? 0}</td>
                                        <td className="px-4 py-3 font-medium text-slate-800">
                                            {formatCurrency(user.tong_chi_tieu)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${getBuyerRiskClass(riskLevel)}`}>
                                                {getBuyerRiskLabel(riskLevel)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(user.trang_thai)}`}>
                                                {getStatusLabel(user.trang_thai)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                type="button"
                                                onClick={() => handleToggleStatus(user)}
                                                disabled={submittingId === user.id}
                                                className={`rounded-[16px] px-3 py-2 text-xs font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                                    user.trang_thai === "hoat_dong"
                                                        ? "bg-red-500 hover:bg-red-600"
                                                        : "bg-green-600 hover:bg-green-700"
                                                }`}
                                            >
                                                {submittingId === user.id
                                                    ? "Đang cập nhật"
                                                    : user.trang_thai === "hoat_dong"
                                                    ? "Khóa"
                                                    : "Mở"}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}

                            {!loading && filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan="10" className="px-4 py-8 text-center text-slate-500">
                                        Không có dữ liệu người mua
                                    </td>
                                </tr>
                            )}

                            {loading && (
                                <tr>
                                    <td colSpan="10" className="px-4 py-8 text-center text-slate-500">
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(20,11,8,0.52)] px-4 py-6 backdrop-blur-sm">
                    <div className={`${adminStyles.modalSurface} w-full max-w-5xl`}>
                        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-[rgba(132,86,72,0.1)] bg-[rgba(255,250,247,0.94)] px-6 py-5 backdrop-blur-sm">
                            <div className="flex items-center gap-4">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl font-bold text-slate-700">
                                    {selectedUser.ho_ten?.charAt(0)}
                                </div>

                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-xl font-bold text-slate-800">{selectedUser.ho_ten}</h3>
                                        <span className="rounded-full bg-[rgba(238,77,45,0.08)] px-3 py-1 text-xs font-medium text-[var(--admin-primary)]">
                                            Người mua
                                        </span>
                                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(selectedUser.trang_thai)}`}>
                                            {getStatusLabel(selectedUser.trang_thai)}
                                        </span>
                                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${getBuyerRiskClass(getBuyerRiskLevel(selectedUser))}`}>
                                            {getBuyerRiskLabel(getBuyerRiskLevel(selectedUser))}
                                        </span>
                                    </div>

                                    <p className="mt-2 text-sm text-slate-500">Hồ sơ hành vi người mua trên sàn</p>
                                    {detailLoading && (
                                        <p className="mt-2 text-xs text-slate-400">Đang tải chi tiết...</p>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedUser(null)}
                                className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                            >
                                Đóng
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-2">
                            <div className="space-y-6">
                                <div className={`${adminStyles.detailCard} p-4`}>
                                    <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Thông tin cá nhân</h4>

                                    <div className="space-y-3 text-sm text-slate-700">
                                        <p>Họ tên: {selectedUser.ho_ten}</p>
                                        <p>Ngày sinh: {selectedUser.ngay_sinh || "--"}</p>
                                        <p>Giới tính: {formatGender(selectedUser.gioi_tinh)}</p>
                                        <p>Email: {selectedUser.email}</p>
                                        <p>Số điện thoại: {selectedUser.so_dien_thoai || "--"}</p>
                                        <p>Địa chỉ: {selectedUser.dia_chi_mac_dinh || "--"}</p>
                                        <p>
                                            Ngày tham gia: {selectedUser.created_at
                                                ? new Date(selectedUser.created_at).toLocaleString("vi-VN")
                                                : "--"}
                                        </p>
                                    </div>
                                </div>

                                <div className={`${adminStyles.detailCard} p-4`}>
                                    <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Ghi chú nội bộ</h4>
                                    <p className="text-sm text-slate-700">{selectedUser.ghi_chu || "Không có ghi chú"}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className={`${adminStyles.detailCard} p-4`}>
                                    <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Hành vi mua hàng</h4>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="rounded-2xl bg-slate-50 p-4">
                                            <p className="text-slate-500">Tổng đơn hàng</p>
                                            <p className="mt-2 font-semibold text-slate-800">{selectedUser.tong_don_hang ?? 0}</p>
                                        </div>

                                        <div className="rounded-2xl bg-slate-50 p-4">
                                            <p className="text-slate-500">Tổng chi tiêu</p>
                                            <p className="mt-2 font-semibold text-blue-700">{formatCurrency(selectedUser.tong_chi_tieu)}</p>
                                        </div>

                                        <div className="rounded-2xl bg-slate-50 p-4">
                                            <p className="text-slate-500">Đơn hoàn tất</p>
                                            <p className="mt-2 font-semibold text-green-700">{selectedUser.don_hoan_tat ?? 0}</p>
                                        </div>

                                        <div className="rounded-2xl bg-slate-50 p-4">
                                            <p className="text-slate-500">Đơn hủy</p>
                                            <p className="mt-2 font-semibold text-red-700">{selectedUser.don_huy ?? 0}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className={`${adminStyles.detailCard} p-4`}>
                                    <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Đánh giá rủi ro nội bộ</h4>
                                    <div className="space-y-3 text-sm text-slate-700">
                                        <p>
                                            Mức độ:{" "}
                                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${getBuyerRiskClass(getBuyerRiskLevel(selectedUser))}`}>
                                                {getBuyerRiskLabel(getBuyerRiskLevel(selectedUser))}
                                            </span>
                                        </p>
                                        <p>Thông báo: {selectedUser.thong_bao_count ?? 0}</p>
                                        <p>Khiếu nại: {selectedUser.complaints_count ?? 0}</p>
                                        <p>Hội thoại hỗ trợ: {selectedUser.conversations_count ?? 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}