import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import SavedFilterViews from "../components/SavedFilterViews";
import RejectionModal from "../components/RejectionModal";
import { del, get, post, put } from "../lib/api";
import { adminStyles } from "../lib/adminStyles";
import { useSavedFilterViews } from "../lib/useSavedFilterViews";
import { useUrlFilterState } from "../lib/useUrlFilterState";

const campaignStatusOptions = [
    { value: "", label: "Tất cả trạng thái" },
    { value: "mo_dang_ky", label: "Mở đăng ký" },
    { value: "Đang diễn ra", label: "Đang diễn ra" },
    { value: "Sắp diễn ra", label: "Sắp diễn ra" },
    { value: "Tạm dừng", label: "Tạm dừng" },
    { value: "Đã kết thúc", label: "Kết thúc" },
    { value: "huy_bo", label: "Đã hủy" },
    { value: "bi_khoa", label: "Bị khóa" },
];

const campaignTypeOptions = [
    { value: "", label: "Tất cả loại" },
    { value: "voucher_san", label: "Voucher sàn" },
    { value: "flash_sale", label: "Flash sale" },
    { value: "mien_phi_van_chuyen", label: "Miễn phí vận chuyển" },
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
        mo_ta_rich: "",
        thoi_gian_bat_dau: "",
        thoi_gian_ket_thuc: "",
        han_dang_ky: "",
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

const getCampaignStatusLabel = (status) => {
    switch (status) {
        case "mo_dang_ky": return "Mở đăng ký";
        case "dang_dien_ra":
        case "Đang diễn ra": return "Đang diễn ra";
        case "sap_dien_ra":
        case "Sắp diễn ra": return "Sắp diễn ra";
        case "tam_dung":
        case "Tạm dừng": return "Tạm dừng";
        case "ket_thuc":
        case "Đã kết thúc": return "Kết thúc";
        case "huy_bo": return "Đã hủy";
        case "bi_khoa": return "Bị khóa";
        case "Dong_dang_ky": return "Đóng đăng ký";
        case "het_luot": return "Hết lượt";
        default: return status;
    }
};

function getCampaignStatusClass(status) {
    switch (status) {
        case "mo_dang_ky":
        case "dang_mo_dang_ky":
            return "bg-blue-100 text-blue-700";
        case "dang_dien_ra":
        case "Đang diễn ra":
            return "bg-green-100 text-green-700";
        case "sap_dien_ra":
        case "Sắp diễn ra":
            return "bg-sky-100 text-sky-700";
        case "tam_dung":
        case "Tạm dừng":
            return "bg-yellow-100 text-yellow-700";
        case "ket_thuc":
        case "Đã kết thúc":
            return "bg-slate-200 text-slate-700";
        case "bi_khoa":
            return "bg-red-100 text-red-700";
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

function generateCampaignCode(name) {
    if (!name) return "";

    // Remove Vietnamese accents
    const normalized = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Extract uppercase letters and numbers
    const acronym = normalized
        .split(/\s+/)
        .map(word => word[0])
        .join("")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");

    const year = new Date().getFullYear();
    return `${acronym}_${year}`;
}

function buildCampaignPayload(form, isEditing) {
    const payload = {
        ten_voucher: form.ten_voucher.trim(),
        loai: form.loai,
        mo_ta: form.mo_ta.trim() || null,
        mo_ta_rich: form.mo_ta_rich || null,
        thoi_gian_bat_dau: form.thoi_gian_bat_dau,
        thoi_gian_ket_thuc: form.thoi_gian_ket_thuc,
        han_dang_ky: form.han_dang_ky,
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
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const urlCampaignId = searchParams.get("campaign_id");
    const [campaigns, setCampaigns] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [campaignFilters, setCampaignFilters] = useUrlFilterState({
        keyword: "",
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
    const [rejectionModal, setRejectionModal] = useState({ isOpen: false, registration: null, isBulk: false });
    const savedViews = useSavedFilterViews(
        "admin-campaigns-views",
        { ...campaignFilters, ...registrationFilters },
        (nextFilters) => {
            setCampaignFilters((current) => ({
                ...current,
                keyword: nextFilters.keyword ?? "",
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
        if (urlCampaignId) {
            setSelectedCampaignId(Number(urlCampaignId));
        }
    }, [urlCampaignId]);

    useEffect(() => {
        let mounted = true;

        async function loadCampaigns() {
            setLoadingCampaigns(true);

            try {
                const endpoint = view === "shop-vouchers" ? "/api/admin/shop-vouchers" : "/api/admin/campaigns";
                const response = await get(endpoint, {
                    keyword: campaignFilters.keyword,
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
                    setError(requestError.message || "Không thể tải dữ liệu.");
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
    }, [campaignFilters.keyword, campaignFilters.campaignStatus, campaignFilters.campaignType, view]);

    useEffect(() => {
        let mounted = true;

        async function loadRegistrations() {
            setLoadingRegistrations(true);

            try {
                const response = await get("/api/admin/campaign-registrations", {
                    keyword: registrationFilters.registrationKeyword,
                    trang_thai: registrationFilters.registrationStatus,
                    campaign_id: urlCampaignId || null,
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
        return registrations;
    }, [registrations]);

    const summary = useMemo(
        () => ({
            totalCampaigns: campaigns.length,
            activeCampaigns: campaigns.filter((item) => ["dang_dien_ra", "Đang diễn ra"].includes(item.trang_thai)).length,
            openRegistrations: campaigns.filter((item) => ["dang_mo_dang_ky", "mo_dang_ky"].includes(item.trang_thai)).length,
            pendingRegistrations: registrations.filter((item) => item.trang_thai === "cho_duyet").length,
            soldOutCampaigns: campaigns.filter((item) => Number(item.so_luong_con_lai || 0) === 0 || (item.so_luong_voucher > 0 && item.so_luong_da_dung >= item.so_luong_voucher)).length,
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
    const showShopVouchers = view === "shop-vouchers";
    const showCreateForm = (view === "create" || Boolean(editingCampaignId)) && view !== "shop-vouchers";
    const showDetailPanel = (view === "list" || view === "registrations" || view === "shop-vouchers") && Boolean(selectedCampaign);
    const showTaskLayout = showCampaignList || showRegistrations || showCreateForm || showShopVouchers || showDetailPanel;

    function resetCampaignForm() {
        setCampaignForm(createInitialCampaignForm());
        setEditingCampaignId(null);
    }

    function handleAutoGenerateCode() {
        const suggestedCode = generateCampaignCode(campaignForm.ten_voucher);
        setCampaignForm(prev => ({ ...prev, ma_voucher: suggestedCode }));
    }

    const handleNameChange = (e) => {
        const name = e.target.value;
        setCampaignForm(prev => {
            const nextForm = { ...prev, ten_voucher: name };
            // Auto generate code if it's empty or looks like a previous auto-gen
            if (!editingCampaignId && (!prev.ma_voucher || prev.ma_voucher.includes("_202"))) {
                nextForm.ma_voucher = generateCampaignCode(name);
            }
            return nextForm;
        });
    };

    function startEditCampaign(campaign) {
        setEditingCampaignId(campaign.id);
        setCampaignForm({
            ma_voucher: campaign.ma_voucher || "",
            ten_voucher: campaign.ten_voucher || "",
            loai: campaign.loai || "voucher_san",
            mo_ta: campaign.mo_ta || "",
            mo_ta_rich: campaign.mo_ta_rich || "",
            thoi_gian_bat_dau: toInputDateTime(campaign.thoi_gian_bat_dau),
            thoi_gian_ket_thuc: toInputDateTime(campaign.thoi_gian_ket_thuc),
            han_dang_ky: toInputDateTime(campaign.han_dang_ky),
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

        if (view === "shop-vouchers") {
            setError("Admin không được phép tạo hoặc sửa trực tiếp Voucher Shop tại đây.");
            return;
        }

        // Frontend Validation
        const start = new Date(campaignForm.thoi_gian_bat_dau);
        const end = new Date(campaignForm.thoi_gian_ket_thuc);
        const deadline = new Date(campaignForm.han_dang_ky);

        if (start <= deadline) {
            setError("Ngày bắt đầu chiến dịch phải sau hạn đăng ký của Seller.");
            return;
        }
        if (end <= start) {
            setError("Ngày kết thúc phải sau ngày bắt đầu.");
            return;
        }

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

    async function handleLockVoucher(voucher) {
        const reason = window.prompt(`Lý do khóa voucher ${voucher.ma_voucher}:`);
        if (!reason) return;

        setError("");
        try {
            const response = await post(`/api/admin/shop-vouchers/${voucher.id}/lock`, { reason });
            setCampaigns(current => current.map(item => item.id === voucher.id ? response.data.data : item));
            alert("Đã khóa voucher shop thành công.");
        } catch (requestError) {
            setError(requestError.message || "Không thể khóa voucher.");
        }
    }

    async function handleUnlockVoucher(voucher) {
        if (!window.confirm(`Mở khóa cho voucher ${voucher.ma_voucher}?`)) return;

        setError("");
        try {
            const response = await post(`/api/admin/shop-vouchers/${voucher.id}/unlock`);
            setCampaigns(current => current.map(item => item.id === voucher.id ? response.data.data : item));
            alert("Đã mở khóa voucher shop.");
        } catch (requestError) {
            setError(requestError.message || "Không thể mở khóa voucher.");
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

    async function handleQuickRegistrationUpdate(registration, trang_thai, reason = null) {
        if (trang_thai === "tu_choi" && !reason) {
            setRejectionModal({ isOpen: true, registration, isBulk: false });
            return;
        }

        setUpdatingRegistrationId(registration.id);
        setError("");

        try {
            const response = await put(`/api/admin/campaign-registrations/${registration.id}`, {
                trang_thai,
                ly_do_tu_choi: reason || null,
            });

            const updatedRegistration = response.data.data || response.data || registration;
            setRegistrations((current) =>
                current.map((item) => (item.id === registration.id ? updatedRegistration : item))
            );
            if (reason) setRejectionModal({ isOpen: false, registration: null, isBulk: false });
        } catch (requestError) {
            setError(requestError.message || "Không thể cập nhật hồ sơ đăng ký.");
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

    async function handleBulkRegistrationStatus(trang_thai, reason = null) {
        if (selectedRegistrationIds.length === 0) {
            setError("Hãy chọn ít nhất một hồ sơ để cập nhật hàng loạt.");
            return;
        }

        if (trang_thai === "tu_choi" && !reason) {
            setRejectionModal({ isOpen: true, registration: null, isBulk: true });
            return;
        }

        setBulkUpdatingRegistrations(true);
        setError("");

        try {
            const response = await post(`/api/admin/campaign-registrations/bulk-update`, {
                ids: selectedRegistrationIds,
                trang_thai,
                ly_do_tu_choi: reason || null,
            });

            // Reload registrations to get fresh state
            const loadEndpoint = view === "shop-vouchers" ? "/api/admin/shop-vouchers" : "/api/admin/campaigns";
            // Wait, this is registrations, it should be /api/admin/campaign-registrations
            const regsResponse = await get("/api/admin/campaign-registrations");
            setRegistrations(regsResponse.data || []);

            setSelectedRegistrationIds([]);
            if (reason) setRejectionModal({ isOpen: false, registration: null, isBulk: false });
            alert(response.data.message || "Đã cập nhật hàng loạt.");
        } catch (requestError) {
            setError(requestError.message || "Không thể cập nhật hàng loạt hồ sơ campaign.");
        } finally {
            setBulkUpdatingRegistrations(false);
        }
    }

    return (
        <div className={adminStyles.pageStack}>
            <div className={adminStyles.heroHeader}>
                <div className="flex items-center justify-between">
                    <div>
                        <span className={adminStyles.eyebrow}>Trung tâm vận hành</span>
                        <h1 className={adminStyles.heroTitle}>Quản lý chiến dịch</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-[1px] bg-slate-200 mx-1"></div>
                        <div className="flex flex-col items-end">
                            <span className={adminStyles.heroBadge}>CHIẾN DỊCH</span>
                            <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">
                                {new Date().toLocaleDateString("vi-VN")}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            {showSummaryCards ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <div className={`${adminStyles.statCard} p-5`}><p className="text-sm text-slate-500">Tổng</p><h4 className="mt-2 text-3xl font-bold text-slate-800">{summary.totalCampaigns}</h4><p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">tổng chiến dịch</p></div>
                    <div className={`${adminStyles.statCard} p-5`}><p className="text-sm text-slate-500">Đang chạy</p><h4 className="mt-2 text-3xl font-bold text-green-700">{summary.activeCampaigns}</h4><p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">live</p></div>
                    <div className={`${adminStyles.statCard} p-5`}><p className="text-sm text-slate-500">Tuyển shop</p><h4 className="mt-2 text-3xl font-bold text-blue-700">{summary.openRegistrations}</h4><p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">open signup</p></div>
                    <div className={`${adminStyles.statCard} p-5`}><p className="text-sm text-slate-500">Chờ duyệt</p><h4 className="mt-2 text-3xl font-bold text-yellow-700">{summary.pendingRegistrations}</h4><p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">pending</p></div>
                    <div className={`${adminStyles.statCard} p-5`}><p className="text-sm text-slate-500">Cạn lượt</p><h4 className="mt-2 text-3xl font-bold text-red-700">{summary.soldOutCampaigns}</h4><p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">sold out</p></div>
                </div>
            ) : null}

            {showTaskLayout ? (
                <div className={`grid grid-cols-1 gap-6 ${view === "create" ? "xl:grid-cols-[1.1fr,0.9fr]" : "xl:grid-cols-[1.4fr,1fr]"}`}>
                    {showCampaignList || showRegistrations || showShopVouchers || view === "create" ? (
                        <div className="space-y-6">


                            {showCampaignList || showShopVouchers ? (
                                <section className={`${adminStyles.tableCard} p-5 md:p-6`}>
                                    <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                        <div>
                                            <h4 className={adminStyles.sectionTitle}>{showShopVouchers ? "Danh sách Voucher Shop" : "Danh sách chiến dịch"}</h4>
                                        </div>
                                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                            <input
                                                value={campaignFilters.keyword}
                                                onChange={(event) => setCampaignFilters((current) => ({ ...current, keyword: event.target.value }))}
                                                placeholder={view === "shop-vouchers" ? "Tìm theo tên shop..." : "Mã hoặc tên chiến dịch"}
                                                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none"
                                            />
                                            {view !== "shop-vouchers" && (
                                                <select
                                                    value={campaignFilters.campaignType}
                                                    onChange={(event) => setCampaignFilters((current) => ({ ...current, campaignType: event.target.value }))}
                                                    className="rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none"
                                                >
                                                    {campaignTypeOptions.map((option) => (
                                                        <option key={option.value} value={option.value}>{option.label}</option>
                                                    ))}
                                                </select>
                                            )}
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
                                            <thead className="bg-slate-50/50 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                                <tr>
                                                    <th className="px-4 py-3">Chiến dịch</th>
                                                    {view === "shop-vouchers" && <th className="px-4 py-3">Cửa hàng</th>}
                                                    {view !== "shop-vouchers" && <th className="px-4 py-3">Loại</th>}
                                                    <th className="px-4 py-3">Giá trị</th>
                                                    <th className="px-4 py-3 text-center">Sử dụng</th>
                                                    {view === "shop-vouchers" && <th className="px-4 py-3">Thời gian</th>}
                                                    <th className="px-4 py-3">Trạng thái</th>
                                                    <th className="px-4 py-3 text-right">Hành động</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {loadingCampaigns ? (
                                                    <tr><td className="px-4 py-8 text-slate-500 text-center" colSpan={view === "shop-vouchers" ? 7 : 6}>Đang tải...</td></tr>
                                                ) : campaigns.length === 0 ? (
                                                    <tr><td className="px-4 py-8 text-slate-500 text-center" colSpan={view === "shop-vouchers" ? 7 : 6}>Chưa có dữ liệu phù hợp.</td></tr>
                                                ) : (
                                                    campaigns.map((campaign) => (
                                                        <tr
                                                            key={campaign.id}
                                                            onClick={() => setSelectedCampaignId(campaign.id)}
                                                            className={`group cursor-pointer transition hover:bg-slate-50/50 ${selectedCampaignId === campaign.id ? "bg-blue-50/30" : ""}`}
                                                        >
                                                            <td className="px-4 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-semibold text-slate-800">{campaign.ten_voucher}</p>
                                                                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">{campaign.ma_voucher}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            {view === "shop-vouchers" && (
                                                                <td className="px-4 py-4">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-sm font-medium text-slate-700">{campaign.shop?.ten_cua_hang || "N/A"}</span>
                                                                        <span className="text-[10px] text-slate-400">Chủ: {campaign.shop?.owner?.ho_ten || "N/A"}</span>
                                                                    </div>
                                                                </td>
                                                            )}
                                                            {view !== "shop-vouchers" && (
                                                                <td className="px-4 py-4">
                                                                    <span className="text-xs font-medium text-slate-600">{getCampaignTypeLabel(campaign.loai)}</span>
                                                                </td>
                                                            )}
                                                            <td className="px-4 py-4">
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-bold text-slate-800">{formatCurrency(campaign.gia_tri_voucher)}</span>
                                                                    <span className="text-[10px] text-slate-400 italic">Đơn từ {formatCurrency(campaign.gia_tri_don_toi_thieu)}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4 text-center">
                                                                <div className="flex flex-col items-center">
                                                                    <span className="text-sm font-semibold text-slate-700">{campaign.so_luong_da_dung || 0}/{campaign.so_luong_voucher || 0}</span>
                                                                    <div className="mt-1.5 h-1 w-16 overflow-hidden rounded-full bg-slate-100">
                                                                        <div
                                                                            className="h-full bg-blue-500 transition-all"
                                                                            style={{ width: `${Math.min(100, ((campaign.so_luong_da_dung || 0) / (campaign.so_luong_voucher || 1)) * 100)}%` }}
                                                                        ></div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            {view === "shop-vouchers" && (
                                                                <td className="px-4 py-4">
                                                                    <div className="flex flex-col text-[11px] text-slate-500 whitespace-nowrap">
                                                                        <span>BĐ: {formatDateTime(campaign.thoi_gian_bat_dau)}</span>
                                                                        <span>KT: {formatDateTime(campaign.thoi_gian_ket_thuc)}</span>
                                                                    </div>
                                                                </td>
                                                            )}
                                                            <td className="px-4 py-4">
                                                                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${getCampaignStatusClass(campaign.trang_thai)}`}>
                                                                    <span className={`h-1.5 w-1.5 rounded-full bg-current`}></span>
                                                                    {getCampaignStatusLabel(campaign.trang_thai)}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-4 text-right">
                                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                                                                    {view !== "shop-vouchers" ? (
                                                                        <>
                                                                            <button
                                                                                onClick={(e) => { e.stopPropagation(); navigate(`/admin/campaigns/registrations?campaign_id=${campaign.id}`); }}
                                                                                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                                                                                title="Xem danh sách đăng ký"
                                                                            >
                                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                                                                            </button>
                                                                            <button
                                                                                onClick={(e) => { e.stopPropagation(); startEditCampaign(campaign); }}
                                                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                                                title="Sửa chiến dịch"
                                                                            >
                                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                                            </button>
                                                                            <button
                                                                                onClick={(e) => { e.stopPropagation(); handleDeleteCampaign(campaign); }}
                                                                                disabled={deletingCampaignId === campaign.id || !canDeleteCampaign(campaign)}
                                                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-30"
                                                                                title="Xóa chiến dịch"
                                                                            >
                                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                                            </button>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            {campaign.trang_thai === "bi_khoa" ? (
                                                                                <button
                                                                                    onClick={(e) => { e.stopPropagation(); handleUnlockVoucher(campaign); }}
                                                                                    className="flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition"
                                                                                >
                                                                                    Mở khóa
                                                                                </button>
                                                                            ) : (
                                                                                <button
                                                                                    onClick={(e) => { e.stopPropagation(); handleLockVoucher(campaign); }}
                                                                                    className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-700 hover:bg-red-100 transition"
                                                                                >
                                                                                    Khóa vi phạm
                                                                                </button>
                                                                            )}
                                                                        </>
                                                                    )}
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
                                    <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                        <div className="flex items-center gap-4">
                                            {urlCampaignId && (
                                                <button
                                                    onClick={() => navigate("/admin/campaigns/list")}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
                                                    title="Quay lại danh sách"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                                                </button>
                                            )}
                                            <div>
                                                <h4 className={adminStyles.sectionTitle}>
                                                    {urlCampaignId ? `Duyệt đăng ký: ${selectedCampaign?.ten_voucher || "Đang tải..."}` : "Duyệt tất cả đăng ký"}
                                                </h4>
                                                {urlCampaignId && (
                                                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
                                                        Chiến dịch ID: {urlCampaignId}
                                                    </p>
                                                )}
                                            </div>
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
                                    <div className="mb-4 flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleBulkRegistrationStatus("da_duyet")}
                                            disabled={bulkUpdatingRegistrations || selectedRegistrationIds.length === 0}
                                            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                            {bulkUpdatingRegistrations ? "Đang xử lý..." : `Duyệt (${selectedRegistrationIds.length})`}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleBulkRegistrationStatus("tu_choi")}
                                            disabled={bulkUpdatingRegistrations || selectedRegistrationIds.length === 0}
                                            className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                            Từ chối
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleBulkRegistrationStatus("cho_duyet")}
                                            disabled={bulkUpdatingRegistrations || selectedRegistrationIds.length === 0}
                                            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                                        >
                                            Trả về chờ duyệt
                                        </button>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-left text-sm">
                                            <thead className="bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                                <tr>
                                                    <th className="px-4 py-3 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={allVisibleRegistrationsSelected}
                                                            onChange={toggleAllRegistrationSelections}
                                                            className="h-4 w-4 rounded border-slate-300 text-[var(--admin-primary)]"
                                                        />
                                                    </th>
                                                    <th className="px-4 py-3">Cửa hàng</th>
                                                    <th className="px-4 py-3">Chủ shop</th>
                                                    <th className="px-4 py-3">Rating</th>
                                                    <th className="px-4 py-3">Ngày đăng ký</th>
                                                    <th className="px-4 py-3">Trạng thái</th>
                                                    <th className="px-4 py-3 text-right">Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {loadingRegistrations ? (
                                                    <tr><td colSpan="7" className="p-10 text-center text-slate-400">Đang tải hồ sơ đăng ký...</td></tr>
                                                ) : filteredRegistrations.length === 0 ? (
                                                    <tr><td colSpan="7" className="p-10 text-center text-slate-400">Không có đăng ký nào.</td></tr>
                                                ) : (
                                                    filteredRegistrations.map((registration) => (
                                                        <tr key={registration.id} className="group hover:bg-slate-50/50 transition-colors">
                                                            <td className="px-4 py-3 text-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedRegistrationIds.includes(registration.id)}
                                                                    onChange={() => toggleRegistrationSelection(registration.id)}
                                                                    className="h-4 w-4 rounded border-slate-300 text-[var(--admin-primary)]"
                                                                />
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex flex-col">
                                                                    <span className="font-semibold text-slate-800">{registration.shop?.ten_cua_hang || "Shop ẩn"}</span>
                                                                    {!urlCampaignId && (
                                                                        <span className="text-[10px] text-slate-400 uppercase tracking-tight">{registration.campaign?.ten_voucher}</span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 text-slate-600">{registration.shop?.owner?.ho_ten || "--"}</td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center gap-1">
                                                                    <span className="font-bold text-slate-700">{Number(registration.shop?.rating_trung_binh || 0).toFixed(1)}</span>
                                                                    <svg className="h-3 w-3 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 text-slate-500">{formatDateTime(registration.ngay_dang_ky || registration.created_at)}</td>
                                                            <td className="px-4 py-3">
                                                                <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getRegistrationStatusClass(registration.trang_thai)}`}>
                                                                    {getRegistrationStatusLabel(registration.trang_thai)}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-right">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <button
                                                                        onClick={() => handleQuickRegistrationUpdate(registration, "da_duyet")}
                                                                        className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                                                                        title="Duyệt nhanh"
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleQuickRegistrationUpdate(registration, "tu_choi")}
                                                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                        title="Từ chối"
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
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
                        </div>
                    ) : null}

                    {showCreateForm || showDetailPanel ? (
                        <aside className="space-y-6">
                            {showCreateForm ? (
                                <section className={`${adminStyles.panel} rounded-[32px] p-5 md:p-6`}>
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <h4 className={adminStyles.sectionTitle}>{editingCampaignId ? "Cập nhật chiến dịch" : "Tạo chiến dịch mới"}</h4>
                                        </div>
                                        {editingCampaignId ? (
                                            <button type="button" onClick={resetCampaignForm} className={`${adminStyles.secondaryButton} px-4 py-2`}>Tạo mới</button>
                                        ) : null}
                                    </div>

                                    <form onSubmit={handleSaveCampaign} className="mt-5 space-y-6">
                                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                            {/* Row 1: Code & Name */}
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-[13px] font-bold text-slate-700 ml-1">Mã chiến dịch</span>
                                                <div className="flex gap-2">
                                                    <input
                                                        value={campaignForm.ma_voucher}
                                                        disabled={Boolean(editingCampaignId)}
                                                        onChange={(event) => setCampaignForm((current) => ({ ...current, ma_voucher: event.target.value }))}
                                                        placeholder="Vd: SUMMER_2024"
                                                        className="flex-1 rounded-2xl border border-slate-200 bg-slate-50/30 px-4 py-3.5 text-sm outline-none transition focus:border-[var(--admin-primary)] focus:bg-white focus:ring-4 focus:ring-[#ee4d2d]/5 disabled:bg-slate-100/50"
                                                        required={!editingCampaignId}
                                                    />
                                                    {!editingCampaignId && (
                                                        <button
                                                            type="button"
                                                            onClick={handleAutoGenerateCode}
                                                            className="flex-none rounded-xl border-2 border-[var(--admin-primary)] bg-white px-4 text-[10px] font-black uppercase tracking-widest text-[var(--admin-primary)] transition hover:bg-[var(--admin-primary)] hover:text-white active:scale-95"
                                                        >
                                                            Tạo mã
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-[13px] font-bold text-slate-700 ml-1">Tên chiến dịch</span>
                                                <input
                                                    value={campaignForm.ten_voucher}
                                                    onChange={handleNameChange}
                                                    placeholder="Vd: Siêu hội Voucher tháng 5"
                                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/30 px-4 py-3.5 text-sm outline-none transition focus:border-[var(--admin-primary)] focus:bg-white focus:ring-4 focus:ring-[#ee4d2d]/5"
                                                    required
                                                />
                                            </div>

                                            {/* Row 2: Type & Status */}
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-[13px] font-bold text-slate-700 ml-1">Loại chiến dịch</span>
                                                <select
                                                    value={campaignForm.loai}
                                                    onChange={(event) => setCampaignForm((current) => ({ ...current, loai: event.target.value }))}
                                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/30 px-4 py-3.5 text-sm outline-none transition focus:border-[var(--admin-primary)] focus:bg-white focus:ring-4 focus:ring-[#ee4d2d]/5 cursor-pointer"
                                                >
                                                    {campaignTypeOptions.filter((option) => option.value).map((option) => (
                                                        <option key={option.value} value={option.value}>{option.label}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {editingCampaignId ? (
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="text-[13px] font-bold text-slate-700 ml-1">Trạng thái</span>
                                                    <select
                                                        value={campaignForm.trang_thai}
                                                        onChange={(event) => setCampaignForm((current) => ({ ...current, trang_thai: event.target.value }))}
                                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/30 px-4 py-3.5 text-sm outline-none transition focus:border-[var(--admin-primary)] focus:bg-white focus:ring-4 focus:ring-[#ee4d2d]/5 cursor-pointer"
                                                    >
                                                        {campaignStatusOptions.filter((option) => option.value).map((option) => (
                                                            <option key={option.value} value={option.value}>{option.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="text-[13px] font-bold text-slate-700 ml-1">Trạng thái</span>
                                                    <div className="flex flex-1 items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/40 px-5 py-3.5">
                                                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                                                        <span className="text-[13px] font-bold text-blue-700">Mặc định: Mở đăng ký</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Row 3: Dates */}
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-[13px] font-bold text-slate-700 ml-1">Hạn đăng ký Seller</span>
                                                <input
                                                    type="datetime-local"
                                                    value={campaignForm.han_dang_ky}
                                                    onChange={(event) => setCampaignForm((current) => ({ ...current, han_dang_ky: event.target.value }))}
                                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/30 px-4 py-3.5 text-sm outline-none transition focus:border-[var(--admin-primary)] focus:bg-white focus:ring-4 focus:ring-[#ee4d2d]/5"
                                                    required
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1.5 md:grid md:grid-cols-2 md:gap-4 md:col-span-1">
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="text-[13px] font-bold text-slate-700 ml-1">Ngày bắt đầu</span>
                                                    <input
                                                        type="datetime-local"
                                                        value={campaignForm.thoi_gian_bat_dau}
                                                        onChange={(event) => setCampaignForm((current) => ({ ...current, thoi_gian_bat_dau: event.target.value }))}
                                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/30 px-4 py-3.5 text-sm outline-none transition focus:border-[var(--admin-primary)] focus:bg-white focus:ring-4 focus:ring-[#ee4d2d]/5"
                                                        required
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="text-[13px] font-bold text-slate-700 ml-1">Ngày kết thúc</span>
                                                    <input
                                                        type="datetime-local"
                                                        value={campaignForm.thoi_gian_ket_thuc}
                                                        onChange={(event) => setCampaignForm((current) => ({ ...current, thoi_gian_ket_thuc: event.target.value }))}
                                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/30 px-4 py-3.5 text-sm outline-none transition focus:border-[var(--admin-primary)] focus:bg-white focus:ring-4 focus:ring-[#ee4d2d]/5"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            {/* Row 4: Values */}
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-[13px] font-bold text-slate-700 ml-1">Giá trị voucher ({campaignForm.loai === "phan_tram" ? "%" : "VNĐ"})</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={campaignForm.gia_tri_voucher}
                                                    onChange={(event) => setCampaignForm((current) => ({ ...current, gia_tri_voucher: event.target.value }))}
                                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/30 px-4 py-3.5 text-sm outline-none transition focus:border-[var(--admin-primary)] focus:bg-white focus:ring-4 focus:ring-[#ee4d2d]/5"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-[13px] font-bold text-slate-700 ml-1">Đơn tối thiểu (VNĐ)</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={campaignForm.gia_tri_don_toi_thieu}
                                                    onChange={(event) => setCampaignForm((current) => ({ ...current, gia_tri_don_toi_thieu: event.target.value }))}
                                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/30 px-4 py-3.5 text-sm outline-none transition focus:border-[var(--admin-primary)] focus:bg-white focus:ring-4 focus:ring-[#ee4d2d]/5"
                                                />
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-[13px] font-bold text-slate-700 ml-1">Giảm tối đa (VNĐ)</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={campaignForm.giam_toi_da}
                                                    onChange={(event) => setCampaignForm((current) => ({ ...current, giam_toi_da: event.target.value }))}
                                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/30 px-4 py-3.5 text-sm outline-none transition focus:border-[var(--admin-primary)] focus:bg-white focus:ring-4 focus:ring-[#ee4d2d]/5"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-[13px] font-bold text-slate-700 ml-1">Số lượng voucher</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={campaignForm.so_luong_voucher}
                                                    onChange={(event) => setCampaignForm((current) => ({ ...current, so_luong_voucher: event.target.value }))}
                                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/30 px-4 py-3.5 text-sm outline-none transition focus:border-[var(--admin-primary)] focus:bg-white focus:ring-4 focus:ring-[#ee4d2d]/5"
                                                />
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-[13px] font-bold text-slate-700 ml-1">Mức hỗ trợ sàn (VNĐ)</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={campaignForm.muc_ho_tro_san}
                                                    onChange={(event) => setCampaignForm((current) => ({ ...current, muc_ho_tro_san: event.target.value }))}
                                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/30 px-4 py-3.5 text-sm outline-none transition focus:border-[var(--admin-primary)] focus:bg-white focus:ring-4 focus:ring-[#ee4d2d]/5"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-[13px] font-bold text-slate-700 ml-1">Số lượng mỗi người</span>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={campaignForm.so_luong_moi_nguoi}
                                                    onChange={(event) => setCampaignForm((current) => ({ ...current, so_luong_moi_nguoi: event.target.value }))}
                                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/30 px-4 py-3.5 text-sm outline-none transition focus:border-[var(--admin-primary)] focus:bg-white focus:ring-4 focus:ring-[#ee4d2d]/5"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <span className="text-[13px] font-bold text-slate-700 ml-1">Mô tả chiến dịch (Hiển thị cho Seller)</span>
                                            <div className="rich-text-wrapper overflow-hidden rounded-2xl border border-slate-200 bg-white">
                                                <ReactQuill
                                                    theme="snow"
                                                    value={campaignForm.mo_ta_rich}
                                                    onChange={(value) => setCampaignForm(current => ({ ...current, mo_ta_rich: value }))}
                                                    className="min-h-[150px]"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-[13px] font-bold text-slate-700 ml-1">Ghi chú nội bộ</span>
                                            <textarea
                                                rows="2"
                                                value={campaignForm.ghi_chu}
                                                onChange={(event) => setCampaignForm((current) => ({ ...current, ghi_chu: event.target.value }))}
                                                placeholder="Ghi chú riêng cho Admin..."
                                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm outline-none transition focus:border-[var(--admin-primary)] focus:bg-white focus:ring-4 focus:ring-[#ee4d2d]/5"
                                            />
                                        </div>

                                        <button 
                                            type="submit" 
                                            disabled={savingCampaign} 
                                            className="w-full rounded-2xl bg-[var(--admin-primary)] py-4 text-sm font-bold text-white shadow-lg shadow-[#ee4d2d]/20 transition hover:bg-[#d73211] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {savingCampaign ? "Đang xử lý..." : editingCampaignId ? "Cập nhật chiến dịch" : "Xác nhận tạo chiến dịch"}
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
                                                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-slate-500">{view === "shop-vouchers" ? "Còn lại" : "Đăng ký shop"}</p><p className="mt-1 text-xl font-bold text-slate-800">{view === "shop-vouchers" ? (selectedCampaign.so_luong_voucher - (selectedCampaign.so_luong_da_dung || 0)) : (selectedCampaign.registrations_count || 0)}</p></div>
                                            </div>
                                            {view !== "shop-vouchers" && (
                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                                    <div className="rounded-2xl bg-emerald-50 p-4"><p className="text-slate-500">Đã duyệt</p><p className="mt-1 text-xl font-bold text-emerald-700">{selectedCampaignMix.approved}</p></div>
                                                    <div className="rounded-2xl bg-yellow-50 p-4"><p className="text-slate-500">Chờ duyệt</p><p className="mt-1 text-xl font-bold text-yellow-700">{selectedCampaignMix.pending}</p></div>
                                                    <div className="rounded-2xl bg-red-50 p-4"><p className="text-slate-500">Từ chối</p><p className="mt-1 text-xl font-bold text-red-700">{selectedCampaignMix.rejected}</p></div>
                                                </div>
                                            )}
                                            <div className={`${adminStyles.detailCard} p-4`}>
                                                <p className="flex justify-between items-center"><span className="font-medium text-slate-800">Trạng thái:</span> <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getCampaignStatusClass(selectedCampaign.trang_thai)}`}>{getCampaignStatusLabel(selectedCampaign.trang_thai)}</span></p>
                                                <p className="mt-2 flex justify-between items-center"><span className="font-medium text-slate-800">Health:</span> <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getCampaignHealth(selectedCampaign).className}`}>{getCampaignHealth(selectedCampaign).label}</span></p>
                                                <p className="mt-2 flex justify-between"><span className="font-medium text-slate-800">Giá trị voucher:</span> <span className="text-slate-900 font-bold">{formatCurrency(selectedCampaign.gia_tri_voucher)}</span></p>
                                                <p className="mt-2 flex justify-between"><span className="font-medium text-slate-800">Ngưỡng áp dụng:</span> <span className="text-slate-900 font-bold">{formatCurrency(selectedCampaign.gia_tri_don_toi_thieu)}</span></p>

                                                {selectedCampaign.mo_ta && selectedCampaign.mo_ta !== "Chưa có mô tả" && (
                                                    <div className="mt-4 pt-4 border-t border-slate-100">
                                                        <span className="font-medium text-slate-800 block mb-1 text-xs uppercase tracking-wider">Mô tả chi tiết</span>
                                                        <p className="text-slate-600 leading-relaxed">{selectedCampaign.mo_ta}</p>
                                                    </div>
                                                )}

                                                {selectedCampaign.ghi_chu && selectedCampaign.ghi_chu !== "Không có" && (
                                                    <div className="mt-3 pt-3 border-t border-slate-100 border-dashed">
                                                        <span className="font-medium text-slate-800 block mb-1 text-xs uppercase tracking-wider text-blue-600">Ghi chú nội bộ</span>
                                                        <p className="text-slate-500 italic">{selectedCampaign.ghi_chu}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </section>
                            ) : null}
                        </aside>
                    ) : null}
                </div>
            ) : null}

            <RejectionModal
                isOpen={rejectionModal.isOpen}
                onClose={() => setRejectionModal({ isOpen: false, registration: null, isBulk: false })}
                count={rejectionModal.isBulk ? selectedRegistrationIds.length : 1}
                onConfirm={(reason) => {
                    if (rejectionModal.isBulk) {
                        handleBulkRegistrationStatus("tu_choi", reason);
                    } else {
                        handleQuickRegistrationUpdate(rejectionModal.registration, "tu_choi", reason);
                    }
                }}
            />
        </div>
    );
}