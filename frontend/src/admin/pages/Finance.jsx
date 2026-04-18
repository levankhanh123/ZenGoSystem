import React, { useEffect, useMemo, useState } from "react";
import SavedFilterViews from "../components/SavedFilterViews";
import { get, put } from "../lib/api";
import { adminStyles } from "../lib/adminStyles";
import { useSavedFilterViews } from "../lib/useSavedFilterViews";
import { useUrlFilterState } from "../lib/useUrlFilterState";

const financeViewMap = {
    overview: "tong_quan",
    payments: "giao_dich",
    "shop-settlements": "doi_soat_shop",
    "shipper-settlements": "doi_soat_shipper",
    refunds: "hoan_tien",
    logs: "nhat_ky",
};

function formatCurrency(value) {
    return `${Number(value || 0).toLocaleString("vi-VN")} đ`;
}

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

function formatDateInput(value) {
    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toISOString().slice(0, 10);
}

function formatDateTimeInput(value) {
    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const localTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localTime.toISOString().slice(0, 16);
}

function getTransactionStatusClass(status) {
    switch (status) {
        case "thanh_cong":
            return "bg-green-100 text-green-700";
        case "cho_thu_tien":
            return "bg-yellow-100 text-yellow-700";
        case "that_bai":
            return "bg-red-100 text-red-700";
        default:
            return "bg-slate-100 text-slate-700";
    }
}

function getTransactionStatusLabel(status) {
    switch (status) {
        case "thanh_cong":
            return "Thành công";
        case "cho_thu_tien":
            return "Chờ thu tiền";
        case "that_bai":
            return "Thất bại";
        default:
            return "Không xác định";
    }
}

function getMethodLabel(method) {
    switch (method) {
        case "cod":
            return "COD";
        case "chuyen_khoan":
            return "Chuyển khoản";
        case "vi_dien_tu":
            return "Ví điện tử";
        default:
            return method || "--";
    }
}

function getSettlementStatusClass(status) {
    switch (status) {
        case "da_chuyen_khoan":
            return "bg-green-100 text-green-700";
        case "cho_chuyen_khoan":
            return "bg-yellow-100 text-yellow-700";
        case "tam_giu":
            return "bg-red-100 text-red-700";
        default:
            return "bg-slate-100 text-slate-700";
    }
}

function getSettlementStatusLabel(status) {
    switch (status) {
        case "da_chuyen_khoan":
            return "Đã chuyển khoản";
        case "cho_chuyen_khoan":
            return "Chờ chuyển khoản";
        case "tam_giu":
            return "Tạm giữ";
        default:
            return "Không xác định";
    }
}

function getDebtStatusClass(status) {
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

function getDebtStatusLabel(status) {
    switch (status) {
        case "binh_thuong":
            return "Bình thường";
        case "canh_bao":
            return "Cảnh báo";
        case "rui_ro":
            return "Rủi ro";
        default:
            return "Không xác định";
    }
}

function getFinanceLogTypeLabel(type) {
    switch (type) {
        case "doi_soat_shop":
            return "Đối soát shop";
        case "doi_soat_shipper":
            return "Đối soát shipper";
        case "giao_dich_nguoi_mua":
            return "Giao dịch người mua";
        default:
            return type || "--";
    }
}

function getFinanceLogTypeClass(type) {
    switch (type) {
        case "doi_soat_shop":
            return "bg-blue-100 text-blue-700";
        case "doi_soat_shipper":
            return "bg-amber-100 text-amber-700";
        case "giao_dich_nguoi_mua":
            return "bg-green-100 text-green-700";
        default:
            return "bg-slate-100 text-slate-700";
    }
}

function getRefundStatusClass(status) {
    switch (status) {
        case "hoan_tat":
            return "bg-green-100 text-green-700";
        case "da_duyet":
            return "bg-blue-100 text-blue-700";
        case "tu_choi":
            return "bg-red-100 text-red-700";
        case "cho_xu_ly":
            return "bg-yellow-100 text-yellow-700";
        default:
            return "bg-slate-100 text-slate-700";
    }
}

function getRefundStatusLabel(status) {
    switch (status) {
        case "hoan_tat":
            return "Hoàn tất";
        case "da_duyet":
            return "Đã duyệt";
        case "tu_choi":
            return "Từ chối";
        case "cho_xu_ly":
            return "Chờ xử lý";
        default:
            return status || "Không xác định";
    }
}

function getPaymentSummary(item) {
    return {
        orderCode: item.order?.ma_don_hang || "--",
        buyerName: item.order?.buyer?.ho_ten || item.order?.ten_nguoi_nhan || "--",
        shopName: item.order?.shop?.ten_cua_hang || "--",
    };
}

function getShopSettlementSummary(item) {
    return {
        shopName: item.shop?.ten_cua_hang || "--",
        ownerName: item.shop?.owner?.ho_ten || "--",
    };
}

function getShipperSettlementSummary(item) {
    const profile = item.shipper?.shipper_profile || item.shipper?.shipperProfile;

    return {
        shipperName: item.shipper?.ho_ten || "--",
        shipperCode: profile?.ma_shipper || "--",
        phone: item.shipper?.so_dien_thoai || "--",
    };
}

function getRefundSummary(item) {
    return {
        orderCode: item.order?.ma_don_hang || "--",
        buyerName: item.order?.buyer?.ho_ten || "--",
        shopName: item.order?.shop?.ten_cua_hang || "--",
        paymentCode: item.payment?.ma_giao_dich || "--",
    };
}

export default function Finance({ view = null }) {
    const [overview, setOverview] = useState(null);
    const [payments, setPayments] = useState([]);
    const [shopSettlements, setShopSettlements] = useState([]);
    const [shipperSettlements, setShipperSettlements] = useState([]);
    const [refunds, setRefunds] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(financeViewMap[view] || "tong_quan");
    const [submitting, setSubmitting] = useState(false);
    const [bulkSubmitting, setBulkSubmitting] = useState(false);
    const [actionError, setActionError] = useState(null);
    const [filters, setFilters] = useUrlFilterState({
        keyword: "",
        paymentStatus: "",
        paymentMethod: "",
        shopStatus: "",
        shipperDebtStatus: "",
        refundStatus: "",
    });
    const [selectedRows, setSelectedRows] = useState({
        payment: [],
        shop: [],
        shipper: [],
        refund: [],
    });
    const [bulkAction, setBulkAction] = useState({
        status: "",
        note: "",
        date: "",
    });
    const [selectedAction, setSelectedAction] = useState({
        kind: "",
        id: null,
        status: "",
        note: "",
        date: "",
        codSubmitted: "",
        codMissing: "",
        debt: "",
    });
    const savedViews = useSavedFilterViews("admin-finance-views", filters, setFilters);

    async function loadFinanceData(nextFilters = filters) {
        const [
            overviewResponse,
            paymentsResponse,
            shopSettlementsResponse,
            shipperSettlementsResponse,
            refundsResponse,
            logsResponse,
        ] = await Promise.all([
            get("/api/admin/finance/overview"),
            get("/api/admin/finance/payments", {
                keyword: nextFilters.keyword,
                trang_thai: nextFilters.paymentStatus,
                cong_thanh_toan: nextFilters.paymentMethod,
            }),
            get("/api/admin/finance/shop-settlements", {
                keyword: nextFilters.keyword,
                trang_thai: nextFilters.shopStatus,
            }),
            get("/api/admin/finance/shipper-settlements", {
                keyword: nextFilters.keyword,
                trang_thai_cong_no: nextFilters.shipperDebtStatus,
            }),
            get("/api/admin/finance/refunds", {
                keyword: nextFilters.keyword,
                trang_thai: nextFilters.refundStatus,
            }),
            get("/api/admin/finance/logs", {
                keyword: nextFilters.keyword,
            }),
        ]);

        setOverview(overviewResponse.data ?? null);
        setPayments(paymentsResponse.data ?? []);
        setShopSettlements(shopSettlementsResponse.data ?? []);
        setShipperSettlements(shipperSettlementsResponse.data ?? []);
        setRefunds(refundsResponse.data ?? []);
        setLogs(logsResponse.data ?? []);
        setSelectedRows((current) => ({
            payment: current.payment.filter((id) => (paymentsResponse.data ?? []).some((item) => item.id === id)),
            shop: current.shop.filter((id) => (shopSettlementsResponse.data ?? []).some((item) => item.id === id)),
            shipper: current.shipper.filter((id) => (shipperSettlementsResponse.data ?? []).some((item) => item.id === id)),
            refund: current.refund.filter((id) => (refundsResponse.data ?? []).some((item) => item.id === id)),
        }));
    }

    useEffect(() => {
        let active = true;

        async function fetchData() {
            setLoading(true);
            setError(null);

            try {
                await loadFinanceData(filters);
            } catch (fetchError) {
                if (active) {
                    setError(fetchError.message || "Không thể tải dữ liệu tài chính.");
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        fetchData();

        return () => {
            active = false;
        };
    }, [filters.keyword, filters.paymentMethod, filters.paymentStatus, filters.refundStatus, filters.shipperDebtStatus, filters.shopStatus]);

    useEffect(() => {
        if (!view) {
            return;
        }

        setActiveTab(financeViewMap[view] || "tong_quan");
    }, [view]);

    const selectedRecord = useMemo(() => {
        if (!selectedAction.id || !selectedAction.kind) {
            return null;
        }

        if (selectedAction.kind === "payment") {
            return payments.find((item) => item.id === selectedAction.id) || null;
        }

        if (selectedAction.kind === "shop") {
            return shopSettlements.find((item) => item.id === selectedAction.id) || null;
        }

        if (selectedAction.kind === "shipper") {
            return shipperSettlements.find((item) => item.id === selectedAction.id) || null;
        }

        if (selectedAction.kind === "refund") {
            return refunds.find((item) => item.id === selectedAction.id) || null;
        }

        return null;
    }, [payments, refunds, selectedAction.id, selectedAction.kind, shipperSettlements, shopSettlements]);

    function openAction(kind, item) {
        if (kind === "payment") {
            setSelectedAction({
                kind,
                id: item.id,
                status: item.trang_thai || "cho_xu_ly",
                note: item.ghi_chu || "",
                date: formatDateTimeInput(item.thoi_gian_thanh_toan),
                codSubmitted: "",
                codMissing: "",
                debt: "",
            });
            setActionError(null);
            return;
        }

        if (kind === "shop") {
            setSelectedAction({
                kind,
                id: item.id,
                status: item.trang_thai || "cho_chuyen_khoan",
                note: item.ghi_chu || "",
                date: formatDateInput(item.ngay_doi_soat),
                codSubmitted: "",
                codMissing: "",
                debt: "",
            });
            setActionError(null);
            return;
        }

        if (kind === "shipper") {
            setSelectedAction({
                kind,
                id: item.id,
                status: item.trang_thai_cong_no || "binh_thuong",
                note: item.ghi_chu || "",
                date: formatDateInput(item.ngay_cap_nhat),
                codSubmitted: item.cod_da_nop ?? "",
                codMissing: item.cod_con_thieu ?? "",
                debt: item.cong_no ?? "",
            });
            setActionError(null);
            return;
        }

        setSelectedAction({
            kind,
            id: item.id,
            status: item.trang_thai || "cho_xu_ly",
            note: item.ghi_chu || "",
            date: "",
            codSubmitted: "",
            codMissing: "",
            debt: "",
        });
        setActionError(null);
    }

    function closeAction() {
        setSelectedAction({
            kind: "",
            id: null,
            status: "",
            note: "",
            date: "",
            codSubmitted: "",
            codMissing: "",
            debt: "",
        });
        setActionError(null);
    }

    async function handleSubmitAction(event) {
        event.preventDefault();

        if (!selectedAction.id || !selectedAction.kind) {
            return;
        }

        setSubmitting(true);
        setActionError(null);

        try {
            if (selectedAction.kind === "payment") {
                await put(`/api/admin/finance/payments/${selectedAction.id}`, {
                    trang_thai: selectedAction.status,
                    ghi_chu: selectedAction.note || null,
                    thoi_gian_thanh_toan: selectedAction.date || null,
                });
            }

            if (selectedAction.kind === "shop") {
                await put(`/api/admin/finance/shop-settlements/${selectedAction.id}`, {
                    trang_thai: selectedAction.status,
                    ghi_chu: selectedAction.note || null,
                    ngay_doi_soat: selectedAction.date || null,
                });
            }

            if (selectedAction.kind === "shipper") {
                await put(`/api/admin/finance/shipper-settlements/${selectedAction.id}`, {
                    trang_thai_cong_no: selectedAction.status,
                    ghi_chu: selectedAction.note || null,
                    ngay_cap_nhat: selectedAction.date || null,
                    cod_da_nop: selectedAction.codSubmitted === "" ? null : Number(selectedAction.codSubmitted),
                    cod_con_thieu: selectedAction.codMissing === "" ? null : Number(selectedAction.codMissing),
                    cong_no: selectedAction.debt === "" ? null : Number(selectedAction.debt),
                });
            }

            if (selectedAction.kind === "refund") {
                await put(`/api/admin/finance/refunds/${selectedAction.id}`, {
                    trang_thai: selectedAction.status,
                    ghi_chu: selectedAction.note || null,
                });
            }

            await loadFinanceData(filters);
            closeAction();
        } catch (requestError) {
            setActionError(requestError.message || "Không thể cập nhật bản ghi tài chính.");
        } finally {
            setSubmitting(false);
        }
    }

    const financeOverview = overview ?? {
        tong_thanh_toan_online: 0,
        tong_cod_chua_doi_soat: 0,
        tong_tien_cho_tra_shop: 0,
        tong_phi_san: 0,
        tong_phi_ship: 0,
        tong_hoan_tien: 0,
        tong_ky_quy_shipper: 0,
        tong_cong_no_shipper: 0,
    };

    const tabs = [
        { key: "tong_quan", label: "Tổng quan tài chính" },
        { key: "doi_soat_shop", label: "Đối soát shop" },
        { key: "doi_soat_shipper", label: "Đối soát shipper" },
        { key: "giao_dich", label: "Giao dịch thanh toán" },
        { key: "hoan_tien", label: "Hoàn tiền" },
        { key: "nhat_ky", label: "Nhật ký tài chính" },
    ];

    const currentBulkKind =
        activeTab === "giao_dich"
            ? "payment"
            : activeTab === "doi_soat_shop"
              ? "shop"
              : activeTab === "doi_soat_shipper"
                ? "shipper"
                : activeTab === "hoan_tien"
                  ? "refund"
                  : "";

    const selectedCount = currentBulkKind ? selectedRows[currentBulkKind].length : 0;
        const currentBulkItems =
                currentBulkKind === "payment"
                        ? payments
                        : currentBulkKind === "shop"
                            ? shopSettlements
                            : currentBulkKind === "shipper"
                                ? shipperSettlements
                                : currentBulkKind === "refund"
                                    ? refunds
                                    : [];
        const bulkStatusOptions =
                currentBulkKind === "payment"
                        ? [
                                    { value: "cho_xu_ly", label: "Chờ xử lý" },
                                    { value: "cho_thu_tien", label: "Chờ thu tiền" },
                                    { value: "thanh_cong", label: "Thành công" },
                                    { value: "that_bai", label: "Thất bại" },
                            ]
                        : currentBulkKind === "shop"
                            ? [
                                        { value: "cho_chuyen_khoan", label: "Chờ chuyển khoản" },
                                        { value: "da_chuyen_khoan", label: "Đã chuyển khoản" },
                                        { value: "tam_giu", label: "Tạm giữ" },
                                ]
                            : currentBulkKind === "shipper"
                                ? [
                                            { value: "binh_thuong", label: "Bình thường" },
                                            { value: "canh_bao", label: "Cảnh báo" },
                                            { value: "rui_ro", label: "Rủi ro" },
                                    ]
                                : currentBulkKind === "refund"
                                    ? [
                                                { value: "cho_xu_ly", label: "Chờ xử lý" },
                                                { value: "da_duyet", label: "Đã duyệt" },
                                                { value: "tu_choi", label: "Từ chối" },
                                                { value: "hoan_tat", label: "Hoàn tất" },
                                        ]
                                    : [];
        const bulkDateInputType = currentBulkKind === "payment" ? "datetime-local" : "date";

    function toggleRow(kind, id) {
        setSelectedRows((current) => ({
            ...current,
            [kind]: current[kind].includes(id)
                ? current[kind].filter((item) => item !== id)
                : [...current[kind], id],
        }));
    }

    function toggleAllRows(kind, items) {
        setSelectedRows((current) => ({
            ...current,
            [kind]: current[kind].length === items.length ? [] : items.map((item) => item.id),
        }));
    }

    async function handleBulkSubmit() {
        if (!currentBulkKind || selectedCount === 0 || !bulkAction.status) {
            setActionError("Cần chọn ít nhất một bản ghi và trạng thái batch để xử lý.");
            return;
        }

        setBulkSubmitting(true);
        setActionError(null);

        try {
            if (currentBulkKind === "payment") {
                await Promise.all(
                    selectedRows.payment.map((id) =>
                        put(`/api/admin/finance/payments/${id}`, {
                            trang_thai: bulkAction.status,
                            ghi_chu: bulkAction.note || null,
                            thoi_gian_thanh_toan: bulkAction.date || null,
                        })
                    )
                );
            }

            if (currentBulkKind === "shop") {
                await Promise.all(
                    selectedRows.shop.map((id) =>
                        put(`/api/admin/finance/shop-settlements/${id}`, {
                            trang_thai: bulkAction.status,
                            ghi_chu: bulkAction.note || null,
                            ngay_doi_soat: bulkAction.date || null,
                        })
                    )
                );
            }

            if (currentBulkKind === "shipper") {
                await Promise.all(
                    selectedRows.shipper.map((id) =>
                        put(`/api/admin/finance/shipper-settlements/${id}`, {
                            trang_thai_cong_no: bulkAction.status,
                            ghi_chu: bulkAction.note || null,
                            ngay_cap_nhat: bulkAction.date || null,
                        })
                    )
                );
            }

            if (currentBulkKind === "refund") {
                await Promise.all(
                    selectedRows.refund.map((id) =>
                        put(`/api/admin/finance/refunds/${id}`, {
                            trang_thai: bulkAction.status,
                            ghi_chu: bulkAction.note || null,
                        })
                    )
                );
            }

            await loadFinanceData(filters);
            setSelectedRows((current) => ({ ...current, [currentBulkKind]: [] }));
            setBulkAction({ status: "", note: "", date: "" });
        } catch (requestError) {
            setActionError(requestError.message || "Không thể xử lý batch tài chính.");
        } finally {
            setBulkSubmitting(false);
        }
    }

        const activePanelTitle =
                selectedAction.kind === "payment"
                        ? "Điều phối giao dịch"
                        : selectedAction.kind === "shop"
                            ? "Điều phối đối soát shop"
                            : selectedAction.kind === "shipper"
                                ? "Điều phối công nợ shipper"
                                : selectedAction.kind === "refund"
                                    ? "Điều phối hoàn tiền"
                                    : "";
        const showOverviewHeader = activeTab === "tong_quan";

    return (
        <div className={adminStyles.pageStack}>
            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
            )}

            {showOverviewHeader ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className={`${adminStyles.statCard} p-5`}><p className="text-sm text-slate-500">Tổng thanh toán online</p><h4 className="mt-2 text-3xl font-bold text-slate-800">{formatCurrency(financeOverview.tong_thanh_toan_online)}</h4><p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">online cash-in</p></div>
                <div className={`${adminStyles.statCard} p-5`}><p className="text-sm text-slate-500">COD chưa đối soát</p><h4 className="mt-2 text-3xl font-bold text-yellow-700">{formatCurrency(financeOverview.tong_cod_chua_doi_soat)}</h4><p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">cod pending</p></div>
                <div className={`${adminStyles.statCard} p-5`}><p className="text-sm text-slate-500">Tiền chờ trả shop</p><h4 className="mt-2 text-3xl font-bold text-blue-700">{formatCurrency(financeOverview.tong_tien_cho_tra_shop)}</h4><p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">shop payable</p></div>
                <div className={`${adminStyles.statCard} p-5`}><p className="text-sm text-slate-500">Phí sàn thu được</p><h4 className="mt-2 text-3xl font-bold text-green-700">{formatCurrency(financeOverview.tong_phi_san)}</h4><p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">platform fee</p></div>
            </div>
            ) : null}

            {!view ? (
                <div className={`${adminStyles.panel} rounded-[30px] p-5 md:p-6`}>
                    <div className="flex flex-wrap gap-3">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setActiveTab(tab.key)}
                                className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                                    activeTab === tab.key
                                        ? "bg-[linear-gradient(135deg,#f25f39,#ee4d2d)] text-white shadow-[0_16px_35px_rgba(238,77,45,0.18)]"
                                        : "bg-white text-slate-700 hover:bg-slate-100"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            ) : null}

            {(activeTab === "doi_soat_shop" || activeTab === "doi_soat_shipper" || activeTab === "giao_dich" || activeTab === "hoan_tien") && (
                <div className={`${adminStyles.panel} rounded-[30px] p-5 md:p-6`}>
                    <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--admin-primary)]">Finance filters</p>
                            <h4 className="mt-2 text-lg font-bold text-slate-900">Bộ lọc tài chính</h4>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <input type="text" placeholder="Mã, đơn hàng, shop, shipper, khách hàng" value={filters.keyword} onChange={(e) => setFilters({ ...filters, keyword: e.target.value })} className="rounded-2xl border border-slate-300 px-4 py-3 outline-none" />

                        {activeTab === "giao_dich" && (
                            <>
                                <select value={filters.paymentMethod} onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })} className="rounded-2xl border border-slate-300 px-4 py-3 outline-none"><option value="">Tất cả phương thức</option><option value="cod">COD</option><option value="chuyen_khoan">Chuyển khoản</option><option value="vi_dien_tu">Ví điện tử</option></select>
                                <select value={filters.paymentStatus} onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })} className="rounded-2xl border border-slate-300 px-4 py-3 outline-none"><option value="">Tất cả trạng thái</option><option value="thanh_cong">Thành công</option><option value="cho_thu_tien">Chờ thu tiền</option><option value="that_bai">Thất bại</option></select>
                            </>
                        )}

                        {activeTab === "doi_soat_shop" && (
                            <select value={filters.shopStatus} onChange={(e) => setFilters({ ...filters, shopStatus: e.target.value })} className="rounded-2xl border border-slate-300 px-4 py-3 outline-none"><option value="">Tất cả trạng thái</option><option value="da_chuyen_khoan">Đã chuyển khoản</option><option value="cho_chuyen_khoan">Chờ chuyển khoản</option><option value="tam_giu">Tạm giữ</option></select>
                        )}

                        {activeTab === "doi_soat_shipper" && (
                            <select value={filters.shipperDebtStatus} onChange={(e) => setFilters({ ...filters, shipperDebtStatus: e.target.value })} className="rounded-2xl border border-slate-300 px-4 py-3 outline-none"><option value="">Tất cả công nợ</option><option value="binh_thuong">Bình thường</option><option value="canh_bao">Cảnh báo</option><option value="rui_ro">Rủi ro</option></select>
                        )}

                        {activeTab === "hoan_tien" && (
                            <select value={filters.refundStatus} onChange={(e) => setFilters({ ...filters, refundStatus: e.target.value })} className="rounded-2xl border border-slate-300 px-4 py-3 outline-none"><option value="">Tất cả trạng thái hoàn tiền</option><option value="cho_xu_ly">Chờ xử lý</option><option value="da_duyet">Đã duyệt</option><option value="tu_choi">Từ chối</option><option value="hoan_tat">Hoàn tất</option></select>
                        )}

                        <button type="button" onClick={() => setFilters({ keyword: "", paymentStatus: "", paymentMethod: "", shopStatus: "", shipperDebtStatus: "", refundStatus: "" })} className={adminStyles.primaryButton}>Đặt lại bộ lọc</button>
                    </div>

                    <div className="mt-5 space-y-4">
                        <SavedFilterViews
                            views={savedViews.views}
                            draftName={savedViews.draftName}
                            setDraftName={savedViews.setDraftName}
                            onSave={savedViews.saveCurrentView}
                            onApply={savedViews.applyView}
                            onDelete={savedViews.deleteView}
                        />

                        {currentBulkKind && (
                            <div className="rounded-[26px] border border-[rgba(132,86,72,0.12)] bg-[linear-gradient(180deg,#fff7f3,#ffffff)] p-4">
                                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--admin-primary)]">Batch operations</p>
                                        <p className="mt-1 text-sm text-slate-600">Đã chọn {selectedCount} bản ghi. Batch update dùng lại đúng API nghiệp vụ hiện tại để tránh lệch logic thông báo và nhật ký tài chính.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => toggleAllRows(currentBulkKind, currentBulkItems)}
                                        className={`${adminStyles.secondaryButton} px-4 py-2`}
                                    >
                                        {selectedCount === currentBulkItems.length && currentBulkItems.length > 0 ? "Bỏ chọn tất cả" : "Chọn tất cả danh sách"}
                                    </button>
                                </div>

                                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[1.1fr,1.1fr,1fr,auto]">
                                    <select value={bulkAction.status} onChange={(event) => setBulkAction((current) => ({ ...current, status: event.target.value }))} className="rounded-2xl border border-slate-300 px-4 py-3 outline-none">
                                        <option value="">Chọn trạng thái batch</option>
                                        {bulkStatusOptions.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                    <input type={bulkDateInputType} value={bulkAction.date} onChange={(event) => setBulkAction((current) => ({ ...current, date: event.target.value }))} className="rounded-2xl border border-slate-300 px-4 py-3 outline-none" />
                                    <input type="text" value={bulkAction.note} onChange={(event) => setBulkAction((current) => ({ ...current, note: event.target.value }))} className="rounded-2xl border border-slate-300 px-4 py-3 outline-none" placeholder="Ghi chú batch cho ca xử lý" />
                                    <button type="button" disabled={bulkSubmitting || selectedCount === 0 || !bulkAction.status} onClick={handleBulkSubmit} className={adminStyles.primaryButton}>
                                        {bulkSubmitting ? "Đang xử lý..." : "Cập nhật theo lô"}
                                    </button>
                                </div>

                                {actionError && <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</div>}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === "tong_quan" && (
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <div className={`${adminStyles.tableCard} p-5 md:p-6`}>
                        <h4 className={adminStyles.sectionTitle}>Tổng quan dòng tiền</h4>
                        <div className="mt-5 space-y-4 text-sm text-slate-700">
                            <div className="flex items-center justify-between border-b pb-3"><span>Thanh toán online đã ghi nhận</span><span className="font-semibold text-slate-900">{formatCurrency(financeOverview.tong_thanh_toan_online)}</span></div>
                            <div className="flex items-center justify-between border-b pb-3"><span>COD đang chờ đối soát</span><span className="font-semibold text-yellow-700">{formatCurrency(financeOverview.tong_cod_chua_doi_soat)}</span></div>
                            <div className="flex items-center justify-between border-b pb-3"><span>Tiền chờ thanh toán cho shop</span><span className="font-semibold text-blue-700">{formatCurrency(financeOverview.tong_tien_cho_tra_shop)}</span></div>
                            <div className="flex items-center justify-between border-b pb-3"><span>Phí sàn đã thu</span><span className="font-semibold text-green-700">{formatCurrency(financeOverview.tong_phi_san)}</span></div>
                            <div className="flex items-center justify-between border-b pb-3"><span>Tổng hoàn tiền</span><span className="font-semibold text-red-700">{formatCurrency(financeOverview.tong_hoan_tien)}</span></div>
                            <div className="flex items-center justify-between"><span>Tổng ký quỹ shipper</span><span className="font-semibold text-slate-900">{formatCurrency(financeOverview.tong_ky_quy_shipper)}</span></div>
                        </div>
                    </div>

                    <div className={`${adminStyles.tableCard} p-5 md:p-6`}>
                        <div className="mb-4 flex items-center justify-between"><h4 className={adminStyles.sectionTitle}>Nhật ký tài chính gần nhất</h4><span className={adminStyles.chip}>{logs.length} log</span></div>
                        <div className="space-y-4">
                            {logs.map((log) => (
                                <div key={log.id} className="rounded-[24px] border border-[rgba(132,86,72,0.1)] p-4">
                                    <div className="mb-2 flex items-center justify-between"><span className={`rounded-full px-3 py-1 text-xs font-medium ${getFinanceLogTypeClass(log.loai)}`}>{getFinanceLogTypeLabel(log.loai)}</span><span className="text-xs text-slate-400">{log.created_at}</span></div>
                                    <p className="font-medium text-slate-800">{log.doi_tuong}</p>
                                    <p className="mt-1 text-sm text-slate-600">{log.noi_dung}</p>
                                    <p className="mt-2 text-sm font-semibold text-slate-900">{formatCurrency(log.so_tien)}</p>
                                </div>
                            ))}
                            {!loading && logs.length === 0 && <div className={`${adminStyles.emptyState} p-4 text-sm`}>Không có nhật ký tài chính.</div>}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "doi_soat_shop" && (
                <div className="grid gap-6 xl:grid-cols-[1.45fr_0.9fr]">
                    <div className={`${adminStyles.tableCard} p-5 md:p-6`}>
                        <div className="mb-4 flex items-center justify-between"><h4 className={adminStyles.sectionTitle}>Danh sách đối soát shop</h4><span className={adminStyles.chip}>Tổng: {shopSettlements.length}</span></div>
                        <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead><tr><th className="px-4 py-3"><input type="checkbox" checked={shopSettlements.length > 0 && selectedRows.shop.length === shopSettlements.length} onChange={() => toggleAllRows("shop", shopSettlements)} /></th><th className="px-4 py-3">Phiên đối soát</th><th className="px-4 py-3">Cửa hàng</th><th className="px-4 py-3">Chủ shop</th><th className="px-4 py-3">Kỳ</th><th className="px-4 py-3">Thực nhận</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">Điều phối</th></tr></thead><tbody>{shopSettlements.map((item) => { const summary = getShopSettlementSummary(item); return (<tr key={item.id} className="border-t align-top"><td className="px-4 py-3"><input type="checkbox" checked={selectedRows.shop.includes(item.id)} onChange={() => toggleRow("shop", item.id)} /></td><td className="px-4 py-3"><p className="font-medium text-slate-800">{item.ma_doi_soat}</p><p className="mt-1 text-xs text-slate-500">Doanh thu {formatCurrency(item.doanh_thu_gop)}</p></td><td className="px-4 py-3"><p className="font-medium text-slate-800">{summary.shopName}</p><p className="mt-1 text-xs text-slate-500">Voucher {formatCurrency(item.voucher_ho_tro)}</p></td><td className="px-4 py-3">{summary.ownerName}</td><td className="px-4 py-3"><p>{item.ky_doi_soat || "--"}</p><p className="mt-1 text-xs text-slate-500">Ngày chốt {formatDateTime(item.ngay_doi_soat)}</p></td><td className="px-4 py-3"><p className="font-semibold text-blue-700">{formatCurrency(item.thuc_nhan)}</p><p className="mt-1 text-xs text-slate-500">Phí sàn {formatCurrency(item.phi_san)}</p></td><td className="px-4 py-3"><span className={`rounded-full px-3 py-1 text-xs font-medium ${getSettlementStatusClass(item.trang_thai)}`}>{getSettlementStatusLabel(item.trang_thai)}</span></td><td className="px-4 py-3"><button type="button" onClick={() => openAction("shop", item)} className={`${adminStyles.secondaryButton} px-4 py-2`}>Xử lý</button></td></tr>); })}{shopSettlements.length === 0 && <tr><td colSpan="8" className="px-4 py-8 text-center text-slate-500">Không có dữ liệu đối soát shop</td></tr>}</tbody></table></div>
                    </div>

                    <div className={`${adminStyles.detailCard} p-5 md:p-6`}>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ee4d2d]">Settlement action</p>
                        {selectedAction.kind === "shop" && selectedRecord ? (
                            <form onSubmit={handleSubmitAction} className="mt-4 space-y-4">
                                <div>
                                    <h4 className={adminStyles.sectionTitle}>{activePanelTitle}</h4>
                                    <p className="mt-2 text-sm text-slate-500">{selectedRecord.ma_doi_soat} • {getShopSettlementSummary(selectedRecord).shopName}</p>
                                </div>
                                <div className="grid gap-3 rounded-[24px] border border-[rgba(132,86,72,0.12)] p-4 text-sm text-slate-600">
                                    <div className="flex items-center justify-between"><span>Thực nhận</span><span className="font-semibold text-slate-900">{formatCurrency(selectedRecord.thuc_nhan)}</span></div>
                                    <div className="flex items-center justify-between"><span>Phí vận chuyển</span><span className="font-semibold text-slate-900">{formatCurrency(selectedRecord.phi_van_chuyen)}</span></div>
                                    <div className="flex items-center justify-between"><span>Hoàn tiền</span><span className="font-semibold text-slate-900">{formatCurrency(selectedRecord.hoan_tien)}</span></div>
                                </div>
                                <select value={selectedAction.status} onChange={(event) => setSelectedAction((current) => ({ ...current, status: event.target.value }))} className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none">
                                    <option value="cho_chuyen_khoan">Chờ chuyển khoản</option>
                                    <option value="da_chuyen_khoan">Đã chuyển khoản</option>
                                    <option value="tam_giu">Tạm giữ</option>
                                </select>
                                <input type="date" value={selectedAction.date} onChange={(event) => setSelectedAction((current) => ({ ...current, date: event.target.value }))} className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none" />
                                <textarea value={selectedAction.note} onChange={(event) => setSelectedAction((current) => ({ ...current, note: event.target.value }))} className="h-28 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none" placeholder="Ghi chú nội bộ hoặc lý do tạm giữ" />
                                {actionError && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</div>}
                                <div className="flex gap-3"><button type="submit" disabled={submitting} className={`flex-1 ${adminStyles.primaryButton}`}>{submitting ? "Đang cập nhật..." : "Lưu đối soát"}</button><button type="button" onClick={closeAction} className={`${adminStyles.secondaryButton} px-5 py-3`}>Đóng</button></div>
                            </form>
                        ) : (
                            <div className={`${adminStyles.emptyState} mt-4 p-6 text-sm`}>Chọn một phiên đối soát shop để cập nhật trạng thái chuyển khoản và ghi chú nghiệp vụ.</div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === "doi_soat_shipper" && (
                <div className="grid gap-6 xl:grid-cols-[1.45fr_0.9fr]">
                    <div className={`${adminStyles.tableCard} p-5 md:p-6`}>
                        <div className="mb-4 flex items-center justify-between"><h4 className={adminStyles.sectionTitle}>Danh sách đối soát shipper</h4><span className={adminStyles.chip}>Tổng: {shipperSettlements.length}</span></div>
                        <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead><tr><th className="px-4 py-3"><input type="checkbox" checked={shipperSettlements.length > 0 && selectedRows.shipper.length === shipperSettlements.length} onChange={() => toggleAllRows("shipper", shipperSettlements)} /></th><th className="px-4 py-3">Phiên đối soát</th><th className="px-4 py-3">Shipper</th><th className="px-4 py-3">COD thiếu</th><th className="px-4 py-3">Phí giao hàng</th><th className="px-4 py-3">Công nợ</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">Điều phối</th></tr></thead><tbody>{shipperSettlements.map((item) => { const summary = getShipperSettlementSummary(item); return (<tr key={item.id} className="border-t align-top"><td className="px-4 py-3"><input type="checkbox" checked={selectedRows.shipper.includes(item.id)} onChange={() => toggleRow("shipper", item.id)} /></td><td className="px-4 py-3"><p className="font-medium text-slate-800">{item.ma_doi_soat_shipper}</p><p className="mt-1 text-xs text-slate-500">Cập nhật {formatDateTime(item.ngay_cap_nhat)}</p></td><td className="px-4 py-3"><p className="font-medium text-slate-800">{summary.shipperName}</p><p className="mt-1 text-xs text-slate-500">{summary.shipperCode} • {summary.phone}</p></td><td className="px-4 py-3"><p className="font-semibold text-red-700">{formatCurrency(item.cod_con_thieu)}</p><p className="mt-1 text-xs text-slate-500">Đã nộp {formatCurrency(item.cod_da_nop)}</p></td><td className="px-4 py-3">{formatCurrency(item.phi_giao_hang_duoc_huong)}</td><td className="px-4 py-3"><p className="font-semibold text-orange-700">{formatCurrency(item.cong_no)}</p><p className="mt-1 text-xs text-slate-500">Ký quỹ {formatCurrency(item.ky_quy_hien_tai)}</p></td><td className="px-4 py-3"><span className={`rounded-full px-3 py-1 text-xs font-medium ${getDebtStatusClass(item.trang_thai_cong_no)}`}>{getDebtStatusLabel(item.trang_thai_cong_no)}</span></td><td className="px-4 py-3"><button type="button" onClick={() => openAction("shipper", item)} className={`${adminStyles.secondaryButton} px-4 py-2`}>Can thiệp</button></td></tr>); })}{shipperSettlements.length === 0 && <tr><td colSpan="8" className="px-4 py-8 text-center text-slate-500">Không có dữ liệu đối soát shipper</td></tr>}</tbody></table></div>
                    </div>

                    <div className={`${adminStyles.detailCard} p-5 md:p-6`}>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ee4d2d]">Debt action</p>
                        {selectedAction.kind === "shipper" && selectedRecord ? (
                            <form onSubmit={handleSubmitAction} className="mt-4 space-y-4">
                                <div>
                                    <h4 className={adminStyles.sectionTitle}>{activePanelTitle}</h4>
                                    <p className="mt-2 text-sm text-slate-500">{selectedRecord.ma_doi_soat_shipper} • {getShipperSettlementSummary(selectedRecord).shipperName}</p>
                                </div>
                                <select value={selectedAction.status} onChange={(event) => setSelectedAction((current) => ({ ...current, status: event.target.value }))} className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none">
                                    <option value="binh_thuong">Bình thường</option>
                                    <option value="canh_bao">Cảnh báo</option>
                                    <option value="rui_ro">Rủi ro</option>
                                </select>
                                <div className="grid gap-3 md:grid-cols-2">
                                    <input type="number" min="0" step="0.01" value={selectedAction.codSubmitted} onChange={(event) => setSelectedAction((current) => ({ ...current, codSubmitted: event.target.value }))} className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none" placeholder="COD đã nộp" />
                                    <input type="number" min="0" step="0.01" value={selectedAction.codMissing} onChange={(event) => setSelectedAction((current) => ({ ...current, codMissing: event.target.value }))} className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none" placeholder="COD còn thiếu" />
                                </div>
                                <input type="number" min="0" step="0.01" value={selectedAction.debt} onChange={(event) => setSelectedAction((current) => ({ ...current, debt: event.target.value }))} className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none" placeholder="Công nợ hiện tại" />
                                <input type="date" value={selectedAction.date} onChange={(event) => setSelectedAction((current) => ({ ...current, date: event.target.value }))} className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none" />
                                <textarea value={selectedAction.note} onChange={(event) => setSelectedAction((current) => ({ ...current, note: event.target.value }))} className="h-28 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none" placeholder="Ghi chú thu hồi COD hoặc phương án xử lý" />
                                {actionError && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</div>}
                                <div className="flex gap-3"><button type="submit" disabled={submitting} className={`flex-1 ${adminStyles.primaryButton}`}>{submitting ? "Đang cập nhật..." : "Lưu công nợ"}</button><button type="button" onClick={closeAction} className={`${adminStyles.secondaryButton} px-5 py-3`}>Đóng</button></div>
                            </form>
                        ) : (
                            <div className={`${adminStyles.emptyState} mt-4 p-6 text-sm`}>Chọn một shipper để cập nhật COD đã nộp, COD còn thiếu và mức độ rủi ro công nợ.</div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === "giao_dich" && (
                <div className="grid gap-6 xl:grid-cols-[1.45fr_0.9fr]">
                    <div className={`${adminStyles.tableCard} p-5 md:p-6`}>
                        <div className="mb-4 flex items-center justify-between"><h4 className={adminStyles.sectionTitle}>Danh sách giao dịch thanh toán</h4><span className={adminStyles.chip}>Tổng: {payments.length}</span></div>
                        <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead><tr><th className="px-4 py-3"><input type="checkbox" checked={payments.length > 0 && selectedRows.payment.length === payments.length} onChange={() => toggleAllRows("payment", payments)} /></th><th className="px-4 py-3">Giao dịch</th><th className="px-4 py-3">Đơn hàng</th><th className="px-4 py-3">Khách hàng</th><th className="px-4 py-3">Shop</th><th className="px-4 py-3">Số tiền</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">Điều phối</th></tr></thead><tbody>{payments.map((item) => { const summary = getPaymentSummary(item); return (<tr key={item.id} className="border-t align-top"><td className="px-4 py-3"><input type="checkbox" checked={selectedRows.payment.includes(item.id)} onChange={() => toggleRow("payment", item.id)} /></td><td className="px-4 py-3"><p className="font-medium text-slate-800">{item.ma_giao_dich || `GD-${item.id}`}</p><p className="mt-1 text-xs text-slate-500">{getMethodLabel(item.cong_thanh_toan)}</p></td><td className="px-4 py-3"><p className="font-medium text-slate-800">{summary.orderCode}</p><p className="mt-1 text-xs text-slate-500">{formatDateTime(item.thoi_gian_thanh_toan || item.created_at)}</p></td><td className="px-4 py-3">{summary.buyerName}</td><td className="px-4 py-3">{summary.shopName}</td><td className="px-4 py-3"><p className="font-semibold text-slate-900">{formatCurrency(item.so_tien)}</p><p className="mt-1 text-xs text-slate-500">{item.ghi_chu || "Chưa có ghi chú"}</p></td><td className="px-4 py-3"><span className={`rounded-full px-3 py-1 text-xs font-medium ${getTransactionStatusClass(item.trang_thai)}`}>{getTransactionStatusLabel(item.trang_thai)}</span></td><td className="px-4 py-3"><button type="button" onClick={() => openAction("payment", item)} className={`${adminStyles.secondaryButton} px-4 py-2`}>Cập nhật</button></td></tr>); })}{payments.length === 0 && <tr><td colSpan="8" className="px-4 py-8 text-center text-slate-500">Không có dữ liệu giao dịch</td></tr>}</tbody></table></div>
                    </div>

                    <div className={`${adminStyles.detailCard} p-5 md:p-6`}>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ee4d2d]">Payment action</p>
                        {selectedAction.kind === "payment" && selectedRecord ? (
                            <form onSubmit={handleSubmitAction} className="mt-4 space-y-4">
                                <div>
                                    <h4 className={adminStyles.sectionTitle}>{activePanelTitle}</h4>
                                    <p className="mt-2 text-sm text-slate-500">{selectedRecord.ma_giao_dich || `GD-${selectedRecord.id}`} • {getPaymentSummary(selectedRecord).buyerName}</p>
                                </div>
                                <div className="grid gap-3 rounded-[24px] border border-[rgba(132,86,72,0.12)] p-4 text-sm text-slate-600">
                                    <div className="flex items-center justify-between"><span>Đơn hàng</span><span className="font-semibold text-slate-900">{getPaymentSummary(selectedRecord).orderCode}</span></div>
                                    <div className="flex items-center justify-between"><span>Shop</span><span className="font-semibold text-slate-900">{getPaymentSummary(selectedRecord).shopName}</span></div>
                                    <div className="flex items-center justify-between"><span>Số tiền</span><span className="font-semibold text-slate-900">{formatCurrency(selectedRecord.so_tien)}</span></div>
                                </div>
                                <select value={selectedAction.status} onChange={(event) => setSelectedAction((current) => ({ ...current, status: event.target.value }))} className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none">
                                    <option value="cho_xu_ly">Chờ xử lý</option>
                                    <option value="cho_thu_tien">Chờ thu tiền</option>
                                    <option value="thanh_cong">Thành công</option>
                                    <option value="that_bai">Thất bại</option>
                                </select>
                                <input type="datetime-local" value={selectedAction.date} onChange={(event) => setSelectedAction((current) => ({ ...current, date: event.target.value }))} className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none" />
                                <textarea value={selectedAction.note} onChange={(event) => setSelectedAction((current) => ({ ...current, note: event.target.value }))} className="h-28 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none" placeholder="Ghi chú đối soát thanh toán" />
                                {actionError && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</div>}
                                <div className="flex gap-3"><button type="submit" disabled={submitting} className={`flex-1 ${adminStyles.primaryButton}`}>{submitting ? "Đang cập nhật..." : "Lưu giao dịch"}</button><button type="button" onClick={closeAction} className={`${adminStyles.secondaryButton} px-5 py-3`}>Đóng</button></div>
                            </form>
                        ) : (
                            <div className={`${adminStyles.emptyState} mt-4 p-6 text-sm`}>Chọn một giao dịch để cập nhật trạng thái thu tiền, ghi chú đối soát hoặc thời gian xác nhận thanh toán.</div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === "hoan_tien" && (
                <div className="grid gap-6 xl:grid-cols-[1.45fr_0.9fr]">
                    <div className={`${adminStyles.tableCard} p-5 md:p-6`}>
                        <div className="mb-4 flex items-center justify-between"><h4 className={adminStyles.sectionTitle}>Danh sách hoàn tiền</h4><span className={adminStyles.chip}>Tổng: {refunds.length}</span></div>
                        <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead><tr><th className="px-4 py-3"><input type="checkbox" checked={refunds.length > 0 && selectedRows.refund.length === refunds.length} onChange={() => toggleAllRows("refund", refunds)} /></th><th className="px-4 py-3">Yêu cầu</th><th className="px-4 py-3">Đơn hàng</th><th className="px-4 py-3">Người mua</th><th className="px-4 py-3">Shop</th><th className="px-4 py-3">Số tiền</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">Điều phối</th></tr></thead><tbody>{refunds.map((item) => { const summary = getRefundSummary(item); return (<tr key={item.id} className="border-t align-top"><td className="px-4 py-3"><input type="checkbox" checked={selectedRows.refund.includes(item.id)} onChange={() => toggleRow("refund", item.id)} /></td><td className="px-4 py-3"><p className="font-medium text-slate-800">Refund #{item.id}</p><p className="mt-1 text-xs text-slate-500">{summary.paymentCode}</p></td><td className="px-4 py-3"><p className="font-medium text-slate-800">{summary.orderCode}</p><p className="mt-1 text-xs text-slate-500">{item.ly_do || "Chưa ghi rõ lý do"}</p></td><td className="px-4 py-3">{summary.buyerName}</td><td className="px-4 py-3">{summary.shopName}</td><td className="px-4 py-3"><p className="font-semibold text-red-700">{formatCurrency(item.so_tien)}</p><p className="mt-1 text-xs text-slate-500">{item.ghi_chu || "Chưa có ghi chú"}</p></td><td className="px-4 py-3"><span className={`rounded-full px-3 py-1 text-xs font-medium ${getRefundStatusClass(item.trang_thai)}`}>{getRefundStatusLabel(item.trang_thai)}</span></td><td className="px-4 py-3"><button type="button" onClick={() => openAction("refund", item)} className={`${adminStyles.secondaryButton} px-4 py-2`}>Cập nhật</button></td></tr>); })}{refunds.length === 0 && <tr><td colSpan="8" className="px-4 py-8 text-center text-slate-500">Không có dữ liệu hoàn tiền</td></tr>}</tbody></table></div>
                    </div>

                    <div className={`${adminStyles.detailCard} p-5 md:p-6`}>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ee4d2d]">Refund action</p>
                        {selectedAction.kind === "refund" && selectedRecord ? (
                            <form onSubmit={handleSubmitAction} className="mt-4 space-y-4">
                                <div>
                                    <h4 className={adminStyles.sectionTitle}>{activePanelTitle}</h4>
                                    <p className="mt-2 text-sm text-slate-500">Refund #{selectedRecord.id} • {getRefundSummary(selectedRecord).buyerName}</p>
                                </div>
                                <div className="grid gap-3 rounded-[24px] border border-[rgba(132,86,72,0.12)] p-4 text-sm text-slate-600">
                                    <div className="flex items-center justify-between"><span>Đơn hàng</span><span className="font-semibold text-slate-900">{getRefundSummary(selectedRecord).orderCode}</span></div>
                                    <div className="flex items-center justify-between"><span>Giao dịch</span><span className="font-semibold text-slate-900">{getRefundSummary(selectedRecord).paymentCode}</span></div>
                                    <div className="flex items-center justify-between"><span>Số tiền</span><span className="font-semibold text-slate-900">{formatCurrency(selectedRecord.so_tien)}</span></div>
                                </div>
                                <select value={selectedAction.status} onChange={(event) => setSelectedAction((current) => ({ ...current, status: event.target.value }))} className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none">
                                    <option value="cho_xu_ly">Chờ xử lý</option>
                                    <option value="da_duyet">Đã duyệt</option>
                                    <option value="tu_choi">Từ chối</option>
                                    <option value="hoan_tat">Hoàn tất</option>
                                </select>
                                <textarea value={selectedAction.note} onChange={(event) => setSelectedAction((current) => ({ ...current, note: event.target.value }))} className="h-28 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none" placeholder="Kết luận xử lý hoàn tiền" />
                                {actionError && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</div>}
                                <div className="flex gap-3"><button type="submit" disabled={submitting} className={`flex-1 ${adminStyles.primaryButton}`}>{submitting ? "Đang cập nhật..." : "Lưu hoàn tiền"}</button><button type="button" onClick={closeAction} className={`${adminStyles.secondaryButton} px-5 py-3`}>Đóng</button></div>
                            </form>
                        ) : (
                            <div className={`${adminStyles.emptyState} mt-4 p-6 text-sm`}>Chọn một yêu cầu hoàn tiền để cập nhật tiến độ xử lý và ghi chú phản hồi cho buyer.</div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === "nhat_ky" && (
                <div className={`${adminStyles.tableCard} p-5 md:p-6`}>
                    <div className="mb-4 flex items-center justify-between"><h4 className={adminStyles.sectionTitle}>Nhật ký tài chính</h4><span className={adminStyles.chip}>Tổng: {logs.length}</span></div>
                    <div className="space-y-4">{logs.map((log) => (<div key={log.id} className="rounded-[24px] border border-[rgba(132,86,72,0.1)] p-4"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><span className={`rounded-full px-3 py-1 text-xs font-medium ${getFinanceLogTypeClass(log.loai)}`}>{getFinanceLogTypeLabel(log.loai)}</span><span className="text-sm font-medium text-slate-800">{log.doi_tuong}</span></div><span className="text-xs text-slate-400">{log.created_at}</span></div><p className="text-sm text-slate-600">{log.noi_dung}</p><p className="mt-2 text-sm font-semibold text-slate-900">{formatCurrency(log.so_tien)}</p></div>))}{!loading && logs.length === 0 && <div className={`${adminStyles.emptyState} p-4 text-sm`}>Không có nhật ký tài chính.</div>}</div>
                </div>
            )}

            <div className={`${adminStyles.panel} rounded-[28px] p-5 text-sm text-slate-700`}>
                <p className="mb-2 font-semibold text-slate-900">Ghi chú nghiệp vụ admin sàn</p>
                <p className="leading-7">Tiền từ đơn hàng được sàn giữ tạm thời và chỉ đối soát cho shop sau khi hoàn tất vận hành. Đơn COD cần shipper nộp lại đúng kỳ. Admin phải nhìn đồng thời giao dịch buyer, tiền chờ trả shop, công nợ shipper và ký quỹ để kiểm soát dòng tiền toàn sàn.</p>
            </div>
        </div>
    );
}