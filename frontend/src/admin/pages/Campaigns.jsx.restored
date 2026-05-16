import React, { useEffect, useMemo, useState } from "react";
import SavedFilterViews from "../components/SavedFilterViews";
import { del, get, post, put } from "../lib/api";
import { adminStyles } from "../lib/adminStyles";
import { useSavedFilterViews } from "../lib/useSavedFilterViews";
import { useUrlFilterState } from "../lib/useUrlFilterState";

const campaignStatusOptions = [
    { value: "", label: "Tất cả trạng thái" },
    { value: "dang_mo_dang_ky", label: "Mở đăng ký" },
    { value: "dang_dien_ra", label: "Đang diễn ra" },
    { value: "tam_dung", label: "Tạm dừng" },
    { value: "ket_thuc", label: "Kết thúc" },
];

const campaignTypeOptions = [
    { value: "", label: "Tất cả loại" },
    { value: "voucher_san", label: "Voucher sàn" },
    { value: "flash_sale", label: "Flash sale" },
    { value: "mien_phi_van_chuyen", label: "Miễn phí vận chuyển" },
    { value: "uu_dai_shop", label: "Ưu đãi shop" },
];

const registrationStatusOptions = [
    { value: "", label: "Tất cả đăng ký" },
    { value: "cho_duyet", label: "Chờ duyệt" },
    { value: "da_duyet", label: "Đã duyệt" },
    { value: "tu_choi", label: "Từ chối" },
];

function createInitialCampaignForm() {
    return {
        ma_voucher: "",
        ten_voucher: "",
        loai: "voucher_san",
        mo_ta: "",
        thoi_gian_bat_dau: "",
        thoi_gian_ket_thuc: "",
        trang_thai: "dang_mo_dang_ky",
        gia_tri_voucher: "",
        gia_tri_don_toi_thieu: "",
        giam_toi_da: "",
        so_luong_voucher: "",
        so_luong_moi_nguoi: "1",
        muc_ho_tro_san: "",
        ghi_chu: "",
    };
}

function formatCurrency(value) {
    return `${Number(value || 0).toLocaleString("vi-VN")} đ`;
}

function getCampaignHealth(campaign) {
    const total = Number(campaign?.so_luong_voucher || 0);
    const remaining = Number(campaign?.so_luong_con_lai || 0);
    const usageRate = total > 0 ? Math.round(((total - remaining) / total) * 100) : 0;

    if (campaign?.trang_thai === "dang_dien_ra" && remaining === 0) {
        return { label: "Sold out", className: "bg-red-100 text-red-700" };
    }

    if (campaign?.trang_thai === "dang_dien_ra" && usageRate >= 80) {
        return { label: "Burn nhanh", className: "bg-orange-100 text-orange-700" };
    }

    if (campaign?.trang_thai === "dang_mo_dang_ky") {
        return { label: "Đang tuyển shop", className: "bg-blue-100 text-blue-700" };
    }

    if (campaign?.trang_thai === "dang_dien_ra") {
        return { label: "Đang chạy ổn", className: "bg-green-100 text-green-700" };
    }

    return { label: "Theo dõi", className: "bg-slate-100 text-slate-700" };
}

function getRegistrationMix(registrations) {
    return {
        approved: registrations.filter((item) => item.trang_thai === "da_duyet").length,
        pending: registrations.filter((item) => item.trang_thai === "cho_duyet").length,
        rejected: registrations.filter((item) => item.trang_thai === "tu_choi").length,
    };
}

function formatDateTime(value) {
    if (!value) {
        return "--";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString("vi-VN", {
        dateStyle: "short",
        timeStyle: "short",
    });
}

function toInputDateTime(value) {
    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 16);
}

function getCampaignStatusLabel(status) {
    switch (status) {
        case "dang_mo_dang_ky":
            return "Mở đăng ký";
        case "dang_dien_ra":
            return "Đang diễn ra";
        case "tam_dung":
            return "Tạm dừng";
        case "ket_thuc":
            return "Kết thúc";
        default:
            return status || "--";
    }
}

function getCampaignStatusClass(status) {
    switch (status) {
        case "dang_mo_dang_ky":
            return "bg-blue-100 text-blue-700";
        case "dang_dien_ra":
            return "bg-green-100 text-green-700";
        case "tam_dung":
            return "bg-yellow-100 text-yellow-700";
        case "ket_thuc":
            return "bg-slate-200 text-slate-700";
        default:
            return "bg-slate-100 text-slate-700";
    }
}

function getCampaignTypeLabel(type) {
    switch (type) {
        case "voucher_san":
            return "Voucher sàn";
        case "flash_sale":
            return "Flash sale";
        case "mien_phi_van_chuyen":
            return "Miễn phí vận chuyển";
        case "uu_dai_shop":
            return "Ưu đãi shop";
        default:
            return type || "--";
    }
}

function getRegistrationStatusClass(status) {
    switch (status) {
        case "cho_duyet":
            return "bg-yellow-100 text-yellow-700";
        case "da_duyet":
            return "bg-green-100 text-green-700";
        case "tu_choi":
            return "bg-red-100 text-red-700";
        default:
            return "bg-slate-100 text-slate-700";
    }
}

function getRegistrationStatusLabel(status) {
    switch (status) {
        case "cho_duyet":
            return "Chờ duyệt";
        case "da_duyet":
            return "Đã duyệt";
        case "tu_choi":
            return "Từ chối";
        default:
            return status || "--";
    }
}

function canDeleteCampaign(campaign) {
    return ["tam_dung", "ket_thuc"].includes(campaign?.trang_thai);
}

function normalizeNumericField(value) {
    if (value === "" || value === null || value === undefined) {
        return null;
    }

    return Number(value);
}

function buildCampaignPayload(form, isEditing) {
    const payload = {
        ten_voucher: form.ten_voucher.trim(),
        loai: form.loai,
        mo_ta: form.mo_ta.trim() || null,
        thoi_gian_bat_dau: form.thoi_gian_bat_dau,
        thoi_gian_ket_thuc: form.thoi_gian_ket_thuc,
        trang_thai: form.trang_thai,
        gia_tri_voucher: normalizeNumericField(form.gia_tri_voucher),
        gia_tri_don_toi_thieu: normalizeNumericField(form.gia_tri_don_toi_thieu),
        giam_toi_da: normalizeNumericField(form.giam_toi_da),
        so_luong_voucher: normalizeNumericField(form.so_luong_voucher),
        so_luong_moi_nguoi: normalizeNumericField(form.so_luong_moi_nguoi),
        muc_ho_tro_san: normalizeNumericField(form.muc_ho_tro_san),
        ghi_chu: form.ghi_chu.trim() || null,
    };

    if (!isEditing) {
        payload.ma_voucher = form.ma_voucher.trim();
    }

    return payload;
}

export default function Campaigns({ view = "overview" }) {
    const [campaigns, setCampaigns] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [campaignFilters, setCampaignFilters] = useUrlFilterState({
        campaignKeyword: "",
        campaignType: "",
        campaignStatus: "",
    });
    const [registrationFilters, setRegistrationFilters] = useUrlFilterState({
        registrationKeyword: "",
        registrationStatus: "",
    });
    const [campaignForm, setCampaignForm] = useState(createInitialCampaignForm());
    const [editingCampaignId, setEditingCampaignId] = useState(null);
    const [selectedCampaignId, setSelectedCampaignId] = useState(null);
    const [registrationDrafts, setRegistrationDrafts] = useState({});
    const [selectedRegistrationIds, setSelectedRegistrationIds] = useState([]);
    const [loadingCampaigns, setLoadingCampaigns] = useState(true);
    const [loadingRegistrations, setLoadingRegistrations] = useState(true);
    const [savingCampaign, setSavingCampaign] = useState(false);
    const [deletingCampaignId, setDeletingCampaignId] = useState(null);
    const [updatingRegistrationId, setUpdatingRegistrationId] = useState(null);
    const [bulkUpdatingRegistrations, setBulkUpdatingRegistrations] = useState(false);
    const [error, setError] = useState("");
    const savedViews = useSavedFilterViews(
        "admin-campaigns-views",
        { ...campaignFilters, ...registrationFilters },
        (nextFilters) => {
            setCampaignFilters((current) => ({
                ...current,
                campaignKeyword: nextFilters.campaignKeyword ?? "",
                campaignType: nextFilters.campaignType ?? "",
                campaignStatus: nextFilters.campaignStatus ?? "",
            }));
            setRegistrationFilters((current) => ({
                ...current,
                registrationKeyword: nextFilters.registrationKeyword ?? "",
                registrationStatus: nextFilters.registrationStatus ?? "",
            }));
        }
    );

    useEffect(() => {
        let mounted = true;

        async function loadCampaigns() {
            setLoadingCampaigns(true);

            try {
                const response = await get("/api/admin/campaigns", {
                    keyword: campaignFilters.campaignKeyword,
                    loai: campaignFilters.campaignType,
                    trang_thai: campaignFilters.campaignStatus,
                });
                const items = response.data || [];

                if (!mounted) {
                    return;
                }

                setCampaigns(items);
                setSelectedCampaignId((current) => {
                    if (!items.length) {
                        return null;
                    }

                    if (current && items.some((item) => item.id === current)) {
                        return current;
                    }

                    return items[0].id;
                });
            } catch (requestError) {
                if (mounted) {
                    setError(requestError.message || "Không thể tải chiến dịch.");
                }
            } finally {
                if (mounted) {
                    setLoadingCampaigns(false);
                }
            }
        }

        loadCampaigns();

        return () => {
            mounted = false;
        };
    }, [campaignFilters.campaignKeyword, campaignFilters.campaignStatus, campaignFilters.campaignType]);

    useEffect(() => {
        let mounted = true;

        async function loadRegistrations() {
            setLoadingRegistrations(true);

            try {
                const response = await get("/api/admin/campaign-registrations", {
                    keyword: registrationFilters.registrationKeyword,
                    trang_thai: registrationFilters.registrationStatus,
                });
                const items = response.data || [];

                if (!mounted) {
                    return;
                }

                setRegistrations(items);
                setSelectedRegistrationIds([]);
                setRegistrationDrafts((current) => {
                    const next = {};

                    items.forEach((item) => {
                        next[item.id] = current[item.id] || {
                            trang_thai: item.trang_thai || "cho_duyet",
                            ly_do_tu_choi: item.ly_do_tu_choi || "",
                            ghi_chu_admin: item.ghi_chu_admin || "",
                        };
                    });

                    return next;
                });
            } catch (requestError) {
                if (mounted) {
                    setError(requestError.message || "Không thể tải đăng ký chiến dịch.");
                }
            } finally {
                if (mounted) {
                    setLoadingRegistrations(false);
                }
            }
        }

        loadRegistrations();

        return () => {
            mounted = false;
        };
    }, [registrationFilters.registrationKeyword, registrationFilters.registrationStatus]);

    const selectedCampaign = useMemo(
        () => campaigns.find((item) => item.id === selectedCampaignId) || null,
        [campaigns, selectedCampaignId]
    );

    const filteredRegistrations = useMemo(() => {
        if (!selectedCampaignId) {
            return registrations;
        }

        return registrations.filter((item) => item.campaign_id === selectedCampaignId);
    }, [registrations, selectedCampaignId]);

    const summary = useMemo(
        () => ({
            totalCampaigns: campaigns.length,
            activeCampaigns: campaigns.filter((item) => item.trang_thai === "dang_dien_ra").length,
            openRegistrations: campaigns.filter((item) => item.trang_thai === "dang_mo_dang_ky").length,
            pendingRegistrations: registrations.filter((item) => item.trang_thai === "cho_duyet").length,
            soldOutCampaigns: campaigns.filter((item) => Number(item.so_luong_con_lai || 0) === 0).length,
        }),
        [campaigns, registrations]
    );

    const selectedCampaignRegistrations = useMemo(() => {
        if (!selectedCampaignId) {
            return [];
        }

        return registrations.filter((item) => item.campaign_id === selectedCampaignId);
    }, [registrations, selectedCampaignId]);

    const selectedCampaignMix = useMemo(
        () => getRegistrationMix(selectedCampaignRegistrations),
        [selectedCampaignRegistrations]
    );

    const allVisibleRegistrationsSelected =
        filteredRegistrations.length > 0 && selectedRegistrationIds.length === filteredRegistrations.length;

    const showSummaryCards = view === "overview";
    const showCampaignList = view === "list";
    const showRegistrations = view === "registrations";
    const showCreateForm = view === "create";
    const showDetailPanel = (view === "list" || view === "registrations") && Boolean(selectedCampaign);
    const showTaskLayout = showCampaignList || showRegistrations || showCreateForm || showDetailPanel;

    function resetCampaignForm() {
        setCampaignForm(createInitialCampaignForm());
        setEditingCampaignId(null);
    }

    function startEditCampaign(campaign) {
        setEditingCampaignId(campaign.id);
        setCampaignForm({
            ma_voucher: campaign.ma_voucher || "",
            ten_voucher: campaign.ten_voucher || "",
            loai: campaign.loai || "voucher_san",
            mo_ta: campaign.mo_ta || "",
            thoi_gian_bat_dau: toInputDateTime(campaign.thoi_gian_bat_dau),
            thoi_gian_ket_thuc: toInputDateTime(campaign.thoi_gian_ket_thuc),
            trang_thai: campaign.trang_thai || "dang_mo_dang_ky",
            gia_tri_voucher: campaign.gia_tri_voucher || "",
            gia_tri_don_toi_thieu: campaign.gia_tri_don_toi_thieu || "",
            giam_toi_da: campaign.giam_toi_da || "",
            so_luong_voucher: campaign.so_luong_voucher || "",
            so_luong_moi_nguoi: campaign.so_luong_moi_nguoi || "1",
            muc_ho_tro_san: campaign.muc_ho_tro_san || "",
            ghi_chu: campaign.ghi_chu || "",
        });
    }

    async function handleSaveCampaign(event) {
        event.preventDefault();
        setSavingCampaign(true);
        setError("");

        try {
            const payload = buildCampaignPayload(campaignForm, Boolean(editingCampaignId));
            const response = editingCampaignId
                ? await put(`/api/admin/campaigns/${editingCampaignId}`, payload)
                : await post("/api/admin/campaigns", payload);
            const savedCampaign = response.data;

            setCampaigns((current) => {
                if (editingCampaignId) {
                    return current.map((item) => (item.id === editingCampaignId ? { ...item, ...savedCampaign } : item));
                }

                return [savedCampaign, ...current];
            });
            setSelectedCampaignId(savedCampaign?.id || null);
            resetCampaignForm();
        } catch (requestError) {
            setError(requestError.message || "Không thể lưu chiến dịch.");
        } finally {
            setSavingCampaign(false);
        }
    }

    async function handleDeleteCampaign(campaign) {
        if (!window.confirm(`Xóa chiến dịch ${campaign.ten_voucher}?`)) {
            return;
        }

        setDeletingCampaignId(campaign.id);
        setError("");

        try {
            await del(`/api/admin/campaigns/${campaign.id}`);
            setCampaigns((current) => current.filter((item) => item.id !== campaign.id));

            if (selectedCampaignId === campaign.id) {
                setSelectedCampaignId(null);
            }

            if (editingCampaignId === campaign.id) {
                resetCampaignForm();
            }
        } catch (requestError) {
            setError(requestError.message || "Không thể xóa chiến dịch.");
        } finally {
            setDeletingCampaignId(null);
        }
    }

    function updateRegistrationDraft(registrationId, field, value) {
        setRegistrationDrafts((current) => ({
            ...current,
            [registrationId]: {
                ...current[registrationId],
                [field]: value,
            },
        }));
    }

    async function handleUpdateRegistration(registration) {
        const draft = registrationDrafts[registration.id];

        if (!draft) {
            return;
        }

        if (draft.trang_thai === "tu_choi" && !(draft.ly_do_tu_choi || "").trim()) {
            setError("Cần nhập lý do từ chối trước khi cập nhật hồ sơ.");
            return;
        }

        setUpdatingRegistrationId(registration.id);
        setError("");

        try {
            const response = await put(`/api/admin/campaign-registrations/${registration.id}`, {
                trang_thai: draft.trang_thai,
                ly_do_tu_choi:
                    draft.trang_thai === "tu_choi" ? draft.ly_do_tu_choi?.trim() || null : null,
                ghi_chu_admin: draft.ghi_chu_admin?.trim() || null,
            });

            const updatedRegistration = response.data || registration;
            setRegistrations((current) =>
                current.map((item) => (item.id === registration.id ? updatedRegistration : item))
            );
        } catch (requestError) {
            setError(requestError.message || "Không thể cập nhật hồ sơ đăng ký.");
        } finally {
            setUpdatingRegistrationId(null);
        }
    }

    async function handleQuickRegistrationUpdate(registration, trang_thai) {
        setRegistrationDrafts((current) => ({
            ...current,
            [registration.id]: {
                ...current[registration.id],
                trang_thai,
            },
        }));

        setUpdatingRegistrationId(registration.id);
        setError("");

        try {
            const response = await put(`/api/admin/campaign-registrations/${registration.id}`, {
                trang_thai,
                ly_do_tu_choi: trang_thai === "tu_choi" ? (registrationDrafts[registration.id]?.ly_do_tu_choi || null) : null,
                ghi_chu_admin: registrationDrafts[registration.id]?.ghi_chu_admin || null,
            });

            const updatedRegistration = response.data || registration;
            setRegistrations((current) =>
                current.map((item) => (item.id === registration.id ? updatedRegistration : item))
            );
        } catch (requestError) {
            setError(requestError.message || "Không thể cập nhật nhanh hồ sơ đăng ký.");
        } finally {
            setUpdatingRegistrationId(null);
        }
    }

    function toggleRegistrationSelection(registrationId) {
        setSelectedRegistrationIds((current) =>
            current.includes(registrationId)
                ? current.filter((item) => item !== registrationId)
                : [...current, registrationId]
        );
    }

    function toggleAllRegistrationSelections() {
        if (allVisibleRegistrationsSelected) {
            setSelectedRegistrationIds([]);
            return;
        }

        setSelectedRegistrationIds(filteredRegistrations.map((item) => item.id));
    }

    async function handleBulkRegistrationStatus(trang_thai) {
        if (selectedRegistrationIds.length === 0) {
            setError("Hãy chọn ít nhất một hồ sơ để cập nhật hàng loạt.");
            return;
        }

        const selectedItems = filteredRegistrations.filter((item) => selectedRegistrationIds.includes(item.id));

        if (trang_thai === "tu_choi") {
            const missingReason = selectedItems.some((item) => !(registrationDrafts[item.id]?.ly_do_tu_choi || "").trim());

            if (missingReason) {
                setError("Các hồ sơ từ chối hàng loạt cần có lý do từ chối trong draft của từng dòng.");
                return;
            }
        }

        setBulkUpdatingRegistrations(true);
        setError("");

        try {
            const responses = await Promise.all(
                selectedItems.map((item) =>
                    put(`/api/admin/campaign-registrations/${item.id}`, {
                        trang_thai,
                        ly_do_tu_choi:
                            trang_thai === "tu_choi"
                                ? registrationDrafts[item.id]?.ly_do_tu_choi?.trim() || null
                                : null,
                        ghi_chu_admin: registrationDrafts[item.id]?.ghi_chu_admin?.trim() || null,
                    })
                )
            );

            const updatedById = Object.fromEntries(
                responses.map((response) => [response.data.id, response.data])
            );

            setRegistrations((current) =>
                current.map((item) => updatedById[item.id] || item)
            );
            setSelectedRegistrationIds([]);
        } catch (requestError) {
            setError(requestError.message || "Không thể cập nhật hàng loạt hồ sơ campaign.");
        } finally {
            setBulkUpdatingRegistrations(false);
        }
    }

    return (
        <div className={adminStyles.pageStack}>
            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            {showSummaryCards ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                <div className={`${adminStyles.statCard} p-5`}><p className="text-sm text-slate-500">Tổng chiến dịch</p><h4 className="mt-2 text-3xl font-bold text-slate-800">{summary.totalCampaigns}</h4><p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">all campaigns</p></div>
                <div className={`${adminStyles.statCard} p-5`}><p className="text-sm text-slate-500">Đang diễn ra</p><h4 className="mt-2 text-3xl font-bold text-green-700">{summary.activeCampaigns}</h4><p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">live</p></div>
                <div className={`${adminStyles.statCard} p-5`}><p className="text-sm text-slate-500">Mở đăng ký</p><h4 className="mt-2 text-3xl font-bold text-blue-700">{summary.openRegistrations}</h4><p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">open signup</p></div>
                <div className={`${adminStyles.statCard} p-5`}><p className="text-sm text-slate-500">Hồ sơ chờ duyệt</p><h4 className="mt-2 text-3xl font-bold text-yellow-700">{summary.pendingRegistrations}</h4><p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">pending shops</p></div>
                <div className={`${adminStyles.statCard} p-5`}><p className="text-sm text-slate-500">Campaign cạn voucher</p><h4 className="mt-2 text-3xl font-bold text-red-700">{summary.soldOutCampaigns}</h4><p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">sold out</p></div>
            </div>
            ) : null}

            {showTaskLayout ? (
            <div className={`grid grid-cols-1 gap-6 ${view === "create" ? "xl:grid-cols-[1.1fr,0.9fr]" : "xl:grid-cols-[1.4fr,1fr]"}`}>
                {showCampaignList || showRegistrations || view === "create" ? (
                <div className="space-y-6">
                    {view === "create" ? (
                    <section className={`${adminStyles.panel} rounded-[32px] p-5 md:p-6`}>
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h4 className={adminStyles.sectionTitle}>{editingCampaignId ? "Cập nhật chiến dịch" : "Tạo chiến dịch mới"}</h4>
                            </div>
                            {editingCampaignId ? (
                                <button type="button" onClick={resetCampaignForm} className={`${adminStyles.secondaryButton} px-4 py-2`}>Tạo mới</button>
                            ) : null}
                        </div>

                        <form onSubmit={handleSaveCampaign} className="mt-5 space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <label className="space-y-2 text-sm text-slate-600"><span>Mã voucher</span><input value={campaignForm.ma_voucher} disabled={Boolean(editingCampaignId)} onChange={(event) => setCampaignForm((current) => ({ ...current, ma_voucher: event.target.value }))} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none disabled:bg-slate-100" required={!editingCampaignId} /></label>
                                <label className="space-y-2 text-sm text-slate-600"><span>Tên chiến dịch</span><input value={campaignForm.ten_voucher} onChange={(event) => setCampaignForm((current) => ({ ...current, ten_voucher: event.target.value }))} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none" required /></label>
                                <label className="space-y-2 text-sm text-slate-600"><span>Loại chiến dịch</span><select value={campaignForm.loai} onChange={(event) => setCampaignForm((current) => ({ ...current, loai: event.target.value }))} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none">{campaignTypeOptions.filter((option) => option.value).map((option) => (<option key={option.value} value={option.value}>{option.label}</option>))}</select></label>
                                <label className="space-y-2 text-sm text-slate-600"><span>Trạng thái</span><select value={campaignForm.trang_thai} onChange={(event) => setCampaignForm((current) => ({ ...current, trang_thai: event.target.value }))} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none">{campaignStatusOptions.filter((option) => option.value).map((option) => (<option key={option.value} value={option.value}>{option.label}</option>))}</select></label>
                                <label className="space-y-2 text-sm text-slate-600"><span>Bắt đầu</span><input type="datetime-local" value={campaignForm.thoi_gian_bat_dau} onChange={(event) => setCampaignForm((current) => ({ ...current, thoi_gian_bat_dau: event.target.value }))} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none" required /></label>
                                <label className="space-y-2 text-sm text-slate-600"><span>Kết thúc</span><input type="datetime-local" value={campaignForm.thoi_gian_ket_thuc} onChange={(event) => setCampaignForm((current) => ({ ...current, thoi_gian_ket_thuc: event.target.value }))} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none" required /></label>
                                <label className="space-y-2 text-sm text-slate-600"><span>Giá trị voucher</span><input type="number" min="0" value={campaignForm.gia_tri_voucher} onChange={(event) => setCampaignForm((current) => ({ ...current, gia_tri_voucher: event.target.value }))} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none" /></label>
                                <label className="space-y-2 text-sm text-slate-600"><span>Đơn tối thiểu</span><input type="number" min="0" value={campaignForm.gia_tri_don_toi_thieu} onChange={(event) => setCampaignForm((current) => ({ ...current, gia_tri_don_toi_thieu: event.target.value }))} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none" /></label>
                                <label className="space-y-2 text-sm text-slate-600"><span>Giảm tối đa</span><input type="number" min="0" value={campaignForm.giam_toi_da} onChange={(event) => setCampaignForm((current) => ({ ...current, giam_toi_da: event.target.value }))} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none" /></label>
                                <label className="space-y-2 text-sm text-slate-600"><span>Số lượng voucher</span><input type="number" min="0" value={campaignForm.so_luong_voucher} onChange={(event) => setCampaignForm((current) => ({ ...current, so_luong_voucher: event.target.value }))} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none" /></label>
                                <label className="space-y-2 text-sm text-slate-600"><span>Số lượng mỗi người</span><input type="number" min="1" value={campaignForm.so_luong_moi_nguoi} onChange={(event) => setCampaignForm((current) => ({ ...current, so_luong_moi_nguoi: event.target.value }))} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none" /></label>
                                <label className="space-y-2 text-sm text-slate-600 md:col-span-2"><span>Mức hỗ trợ sàn</span><input type="number" min="0" value={campaignForm.muc_ho_tro_san} onChange={(event) => setCampaignForm((current) => ({ ...current, muc_ho_tro_san: event.target.value }))} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none" /></label>
                            </div>

                            <label className="block space-y-2 text-sm text-slate-600"><span>Mô tả</span><textarea rows="3" value={campaignForm.mo_ta} onChange={(event) => setCampaignForm((current) => ({ ...current, mo_ta: event.target.value }))} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none" /></label>
                            <label className="block space-y-2 text-sm text-slate-600"><span>Ghi chú</span><textarea rows="3" value={campaignForm.ghi_chu} onChange={(event) => setCampaignForm((current) => ({ ...current, ghi_chu: event.target.value }))} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none" /></label>

                            <button type="submit" disabled={savingCampaign} className={`${adminStyles.primaryButton} w-full`}>
                                {savingCampaign ? "Đang lưu chiến dịch..." : editingCampaignId ? "Cập nhật chiến dịch" : "Tạo chiến dịch"}
                            </button>
                        </form>
                    </section>
                    ) : null}

                    {showCampaignList ? (
                    <section className={`${adminStyles.tableCard} p-5 md:p-6`}>
                        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <h4 className={adminStyles.sectionTitle}>Danh sách chiến dịch</h4>
                            </div>
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                <input
                                    value={campaignFilters.campaignKeyword}
                                    onChange={(event) => setCampaignFilters((current) => ({ ...current, campaignKeyword: event.target.value }))}
                                    placeholder="Mã hoặc tên chiến dịch"
                                    className="rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none"
                                />
                                <select
                                    value={campaignFilters.campaignType}
                                    onChange={(event) => setCampaignFilters((current) => ({ ...current, campaignType: event.target.value }))}
                                    className="rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none"
                                >
                                    {campaignTypeOptions.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                                <select
                                    value={campaignFilters.campaignStatus}
                                    onChange={(event) => setCampaignFilters((current) => ({ ...current, campaignStatus: event.target.value }))}
                                    className="rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none"
                                >
                                    {campaignStatusOptions.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mb-4">
                            <SavedFilterViews
                                title="Campaign presets"
                                draftName={savedViews.draftName}
                                setDraftName={savedViews.setDraftName}
                                onSave={savedViews.saveCurrentView}
                                views={savedViews.views}
                                onApply={savedViews.applyView}
                                onDelete={savedViews.deleteView}
                            />
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-3">Chiến dịch</th>
                                        <th className="px-4 py-3">Loại</th>
                                        <th className="px-4 py-3">Thời gian</th>
                                        <th className="px-4 py-3">Tình trạng</th>
                                        <th className="px-4 py-3">Voucher</th>
                                        <th className="px-4 py-3 text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingCampaigns ? (
                                        <tr><td className="px-4 py-8 text-slate-500" colSpan="6">Đang tải chiến dịch...</td></tr>
                                    ) : campaigns.length === 0 ? (
                                        <tr><td className="px-4 py-8 text-slate-500" colSpan="6">Chưa có chiến dịch phù hợp với bộ lọc hiện tại.</td></tr>
                                    ) : (
                                        campaigns.map((campaign) => (
                                            <tr key={campaign.id} className={`border-t ${selectedCampaignId === campaign.id ? "bg-[rgba(255,245,240,0.9)]" : ""}`}>
                                                <td className="px-4 py-4 align-top">
                                                    <button type="button" onClick={() => setSelectedCampaignId(campaign.id)} className="text-left">
                                                        <p className="font-semibold text-slate-800">{campaign.ten_voucher}</p>
                                                        <p className="text-xs text-slate-500">{campaign.ma_voucher}</p>
                                                    </button>
                                                </td>
                                                <td className="px-4 py-4 align-top text-slate-600">{getCampaignTypeLabel(campaign.loai)}</td>
                                                <td className="px-4 py-4 align-top text-slate-600"><p>{formatDateTime(campaign.thoi_gian_bat_dau)}</p><p className="text-xs text-slate-400">đến {formatDateTime(campaign.thoi_gian_ket_thuc)}</p></td>
                                                <td className="px-4 py-4 align-top"><div className="flex flex-col gap-2"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getCampaignStatusClass(campaign.trang_thai)}`}>{getCampaignStatusLabel(campaign.trang_thai)}</span><span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getCampaignHealth(campaign).className}`}>{getCampaignHealth(campaign).label}</span></div></td>
                                                <td className="px-4 py-4 align-top text-slate-600"><p>{formatCurrency(campaign.gia_tri_voucher)}</p><p className="text-xs text-slate-400">Còn lại {campaign.so_luong_con_lai || 0}/{campaign.so_luong_voucher || 0}</p></td>
                                                <td className="px-4 py-4 align-top text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button type="button" onClick={() => startEditCampaign(campaign)} className="rounded-[16px] border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100">Sửa</button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteCampaign(campaign)}
                                                            disabled={deletingCampaignId === campaign.id || !canDeleteCampaign(campaign)}
                                                            title={canDeleteCampaign(campaign) ? "Xóa chiến dịch" : "Chỉ xóa khi chiến dịch đã tạm dừng hoặc kết thúc"}
                                                            className="rounded-[16px] border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                                        >
                                                            {deletingCampaignId === campaign.id ? "Đang xóa..." : "Xóa"}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                    ) : null}

                    {showRegistrations ? (
                    <section className={`${adminStyles.tableCard} p-5 md:p-6`}>
                        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <h4 className={adminStyles.sectionTitle}>Duyệt đăng ký tham gia</h4>
                            </div>
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                <input
                                    value={registrationFilters.registrationKeyword}
                                    onChange={(event) => setRegistrationFilters((current) => ({ ...current, registrationKeyword: event.target.value }))}
                                    placeholder="Tên shop hoặc chiến dịch"
                                    className="rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none"
                                />
                                <select
                                    value={registrationFilters.registrationStatus}
                                    onChange={(event) => setRegistrationFilters((current) => ({ ...current, registrationStatus: event.target.value }))}
                                    className="rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none"
                                >
                                    {registrationStatusOptions.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-3">
                                <button type="button" onClick={toggleAllRegistrationSelections} className={`${adminStyles.secondaryButton} px-4 py-2`}>
                                    {allVisibleRegistrationsSelected ? "Bỏ chọn tất cả" : "Chọn tất cả hiển thị"}
                                </button>
                                <button type="button" onClick={() => handleBulkRegistrationStatus("da_duyet")} disabled={bulkUpdatingRegistrations || selectedRegistrationIds.length === 0} className="rounded-[16px] bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60">
                                    {bulkUpdatingRegistrations ? "Đang xử lý..." : `Duyệt đã chọn (${selectedRegistrationIds.length})`}
                                </button>
                                <button type="button" onClick={() => handleBulkRegistrationStatus("cho_duyet")} disabled={bulkUpdatingRegistrations || selectedRegistrationIds.length === 0} className="rounded-[16px] border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-bold text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60">
                                    Trả về chờ duyệt
                                </button>
                            </div>

                            {loadingRegistrations ? (
                                <div className={`${adminStyles.emptyState} p-6 text-sm`}>Đang tải hồ sơ đăng ký...</div>
                            ) : filteredRegistrations.length === 0 ? (
                                <div className={`${adminStyles.emptyState} p-6 text-sm`}>Không có đăng ký nào cho bộ lọc hoặc chiến dịch đang chọn.</div>
                            ) : (
                                filteredRegistrations.map((registration) => {
                                    const draft = registrationDrafts[registration.id] || {
                                        trang_thai: registration.trang_thai || "cho_duyet",
                                        ly_do_tu_choi: registration.ly_do_tu_choi || "",
                                        ghi_chu_admin: registration.ghi_chu_admin || "",
                                    };

                                    return (
                                        <div key={registration.id} className="rounded-[24px] border border-[rgba(132,86,72,0.1)] bg-white/82 p-4">
                                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                                <div className="flex gap-3">
                                                    <input type="checkbox" checked={selectedRegistrationIds.includes(registration.id)} onChange={() => toggleRegistrationSelection(registration.id)} className="mt-1 h-4 w-4 rounded border-slate-300 text-[var(--admin-primary)]" />
                                                    <div>
                                                    <p className="font-semibold text-slate-800">{registration.shop?.ten_cua_hang || "Shop không xác định"}</p>
                                                    <p className="text-sm text-slate-500">{registration.campaign?.ten_voucher || "Chiến dịch"}</p>
                                                    <p className="mt-1 text-xs text-slate-400">Chủ shop: {registration.shop?.owner?.ho_ten || "--"} • Đăng ký {formatDateTime(registration.ngay_dang_ky || registration.created_at)}</p>
                                                    </div>
                                                </div>
                                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getRegistrationStatusClass(registration.trang_thai)}`}>{getRegistrationStatusLabel(registration.trang_thai)}</span>
                                            </div>

                                            <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[180px,1fr,1fr,auto]">
                                                <select
                                                    value={draft.trang_thai}
                                                    onChange={(event) => updateRegistrationDraft(registration.id, "trang_thai", event.target.value)}
                                                    className="rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none"
                                                >
                                                    {registrationStatusOptions.filter((option) => option.value).map((option) => (
                                                        <option key={option.value} value={option.value}>{option.label}</option>
                                                    ))}
                                                </select>
                                                <input
                                                    value={draft.ly_do_tu_choi}
                                                    onChange={(event) => updateRegistrationDraft(registration.id, "ly_do_tu_choi", event.target.value)}
                                                    placeholder="Lý do từ chối nếu có"
                                                    className="rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none"
                                                />
                                                <input
                                                    value={draft.ghi_chu_admin}
                                                    onChange={(event) => updateRegistrationDraft(registration.id, "ghi_chu_admin", event.target.value)}
                                                    placeholder="Ghi chú admin"
                                                    className="rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleUpdateRegistration(registration)}
                                                    disabled={updatingRegistrationId === registration.id}
                                                    className={adminStyles.darkButton}
                                                >
                                                    {updatingRegistrationId === registration.id ? "Đang lưu..." : "Cập nhật"}
                                                </button>
                                            </div>

                                            <div className="mt-3 flex flex-wrap gap-2">
                                                <button type="button" onClick={() => handleQuickRegistrationUpdate(registration, "da_duyet")} disabled={updatingRegistrationId === registration.id} className="rounded-[16px] bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60">Duyệt nhanh</button>
                                                <button type="button" onClick={() => handleQuickRegistrationUpdate(registration, "tu_choi")} disabled={updatingRegistrationId === registration.id} className="rounded-[16px] border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60">Từ chối nhanh</button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </section>
                    ) : null}
                </div>
                ) : null}

                {showCreateForm || showDetailPanel ? (
                <aside className="space-y-6">
                    {showCreateForm && view !== "create" ? (
                    <section className={`${adminStyles.panel} rounded-[32px] p-5 md:p-6`}>
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h4 className={adminStyles.sectionTitle}>{editingCampaignId ? "Cập nhật chiến dịch" : "Tạo chiến dịch mới"}</h4>
                            </div>
                            {editingCampaignId ? (
                                <button type="button" onClick={resetCampaignForm} className={`${adminStyles.secondaryButton} px-4 py-2`}>Tạo mới</button>
                            ) : null}
                        </div>

                        <form onSubmit={handleSaveCampaign} className="mt-5 space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <label className="space-y-2 text-sm text-slate-600"><span>Mã voucher</span><input value={campaignForm.ma_voucher} disabled={Boolean(editingCampaignId)} onChange={(event) => setCampaignForm((current) => ({ ...current, ma_voucher: event.target.value }))} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none disabled:bg-slate-100" required={!editingCampaignId} /></label>
                                <label className="space-y-2 text-sm text-slate-600"><span>Tên chiến dịch</span><input value={campaignForm.ten_voucher} onChange={(event) => setCampaignForm((current) => ({ ...current, ten_voucher: event.target.value }))} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none" required /></label>
                                <label className="space-y-2 text-sm text-slate-600"><span>Loại chiến dịch</span><select value={campaignForm.loai} onChange={(event) => setCampaignForm((current) => ({ ...current, loai: event.target.value }))} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none">{campaignTypeOptions.filter((option) => option.value).map((option) => (<option key={option.value} value={option.value}>{option.label}</option>))}</select></label>
                                <label className="space-y-2 text-sm text-slate-600"><span>Trạng thái</span><select value={campaignForm.trang_thai} onChange={(event) => setCampaignForm((current) => ({ ...current, trang_thai: event.target.value }))} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none">{campaignStatusOptions.filter((option) => option.value).map((option) => (<option key={option.value} value={option.value}>{option.label}</option>))}</select></label>
                                <label className="space-y-2 text-sm text-slate-600"><span>Bắt đầu</span><input type="datetime-local" value={campaignForm.thoi_gian_bat_dau} onChange={(event) => setCampaignForm((current) => ({ ...current, thoi_gian_bat_dau: event.target.value }))} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none" required /></label>
                                <label className="space-y-2 text-sm text-slate-600"><span>Kết thúc</span><input type="datetime-local" value={campaignForm.thoi_gian_ket_thuc} onChange={(event) => setCampaignForm((current) => ({ ...current, thoi_gian_ket_thuc: event.target.value }))} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none" required /></label>
                                <label className="space-y-2 text-sm text-slate-600"><span>Giá trị voucher</span><input type="number" min="0" value={campaignForm.gia_tri_voucher} onChange={(event) => setCampaignForm((current) => ({ ...current, gia_tri_voucher: event.target.value }))} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none" /></label>
                                <label className="space-y-2 text-sm text-slate-600"><span>Đơn tối thiểu</span><input type="number" min="0" value={campaignForm.gia_tri_don_toi_thieu} onChange={(event) => setCampaignForm((current) => ({ ...current, gia_tri_don_toi_thieu: event.target.value }))} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none" /></label>
                                <label className="space-y-2 text-sm text-slate-600"><span>Giảm tối đa</span><input type="number" min="0" value={campaignForm.giam_toi_da} onChange={(event) => setCampaignForm((current) => ({ ...current, giam_toi_da: event.target.value }))} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none" /></label>
                                <label className="space-y-2 text-sm text-slate-600"><span>Số lượng voucher</span><input type="number" min="0" value={campaignForm.so_luong_voucher} onChange={(event) => setCampaignForm((current) => ({ ...current, so_luong_voucher: event.target.value }))} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none" /></label>
                                <label className="space-y-2 text-sm text-slate-600"><span>Số lượng mỗi người</span><input type="number" min="1" value={campaignForm.so_luong_moi_nguoi} onChange={(event) => setCampaignForm((current) => ({ ...current, so_luong_moi_nguoi: event.target.value }))} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none" /></label>
                                <label className="space-y-2 text-sm text-slate-600 md:col-span-2"><span>Mức hỗ trợ sàn</span><input type="number" min="0" value={campaignForm.muc_ho_tro_san} onChange={(event) => setCampaignForm((current) => ({ ...current, muc_ho_tro_san: event.target.value }))} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none" /></label>
                            </div>

                            <label className="block space-y-2 text-sm text-slate-600"><span>Mô tả</span><textarea rows="3" value={campaignForm.mo_ta} onChange={(event) => setCampaignForm((current) => ({ ...current, mo_ta: event.target.value }))} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none" /></label>
                            <label className="block space-y-2 text-sm text-slate-600"><span>Ghi chú</span><textarea rows="3" value={campaignForm.ghi_chu} onChange={(event) => setCampaignForm((current) => ({ ...current, ghi_chu: event.target.value }))} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none" /></label>

                            <button type="submit" disabled={savingCampaign} className={`${adminStyles.primaryButton} w-full`}>
                                {savingCampaign ? "Đang lưu chiến dịch..." : editingCampaignId ? "Cập nhật chiến dịch" : "Tạo chiến dịch"}
                            </button>
                        </form>
                    </section>
                    ) : null}

                    {showDetailPanel ? (
                    <section className={`${adminStyles.panel} rounded-[32px] p-5 md:p-6`}>
                        <h4 className={adminStyles.sectionTitle}>Chi tiết chiến dịch đang chọn</h4>

                        {!selectedCampaign ? (
                            <div className={`${adminStyles.emptyState} mt-4 p-6 text-sm`}>Chọn một chiến dịch để xem chi tiết.</div>
                        ) : (
                            <div className="mt-4 space-y-4 text-sm text-slate-600">
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-slate-400">{selectedCampaign.ma_voucher}</p>
                                    <p className="text-lg font-semibold text-slate-800">{selectedCampaign.ten_voucher}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="rounded-2xl bg-slate-50 p-4"><p className="text-slate-500">Đã dùng</p><p className="mt-1 text-xl font-bold text-slate-800">{selectedCampaign.so_luong_da_dung || 0}</p></div>
                                    <div className="rounded-2xl bg-slate-50 p-4"><p className="text-slate-500">Đăng ký shop</p><p className="mt-1 text-xl font-bold text-slate-800">{selectedCampaign.registrations_count || 0}</p></div>
                                </div>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div className="rounded-2xl bg-emerald-50 p-4"><p className="text-slate-500">Đã duyệt</p><p className="mt-1 text-xl font-bold text-emerald-700">{selectedCampaignMix.approved}</p></div>
                                    <div className="rounded-2xl bg-yellow-50 p-4"><p className="text-slate-500">Chờ duyệt</p><p className="mt-1 text-xl font-bold text-yellow-700">{selectedCampaignMix.pending}</p></div>
                                    <div className="rounded-2xl bg-red-50 p-4"><p className="text-slate-500">Từ chối</p><p className="mt-1 text-xl font-bold text-red-700">{selectedCampaignMix.rejected}</p></div>
                                </div>
                                <div className={`${adminStyles.detailCard} p-4`}>
                                    <p><span className="font-medium text-slate-800">Loại:</span> {getCampaignTypeLabel(selectedCampaign.loai)}</p>
                                    <p className="mt-2"><span className="font-medium text-slate-800">Trạng thái:</span> <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getCampaignStatusClass(selectedCampaign.trang_thai)}`}>{getCampaignStatusLabel(selectedCampaign.trang_thai)}</span></p>
                                    <p className="mt-2"><span className="font-medium text-slate-800">Health:</span> <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getCampaignHealth(selectedCampaign).className}`}>{getCampaignHealth(selectedCampaign).label}</span></p>
                                    <p className="mt-2"><span className="font-medium text-slate-800">Thời gian:</span> {formatDateTime(selectedCampaign.thoi_gian_bat_dau)} đến {formatDateTime(selectedCampaign.thoi_gian_ket_thuc)}</p>
                                    <p className="mt-2"><span className="font-medium text-slate-800">Giá trị voucher:</span> {formatCurrency(selectedCampaign.gia_tri_voucher)}</p>
                                    <p className="mt-2"><span className="font-medium text-slate-800">Ngưỡng áp dụng:</span> {formatCurrency(selectedCampaign.gia_tri_don_toi_thieu)}</p>
                                    <p className="mt-2"><span className="font-medium text-slate-800">Mô tả:</span> {selectedCampaign.mo_ta || "Chưa có mô tả"}</p>
                                    <p className="mt-2"><span className="font-medium text-slate-800">Ghi chú:</span> {selectedCampaign.ghi_chu || "Không có"}</p>
                                </div>
                            </div>
                        )}
                    </section>
                    ) : null}
                </aside>
                ) : null}
            </div>
            ) : null}
        </div>
    );
}