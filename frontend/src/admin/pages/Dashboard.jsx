import React, { useEffect, useMemo, useState, useRef } from "react";
import { RefreshCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { get } from "../lib/api";
import { adminStyles } from "../lib/adminStyles";

function formatCompactNumber(value) {
    return Number(value || 0).toLocaleString("vi-VN");
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

function getOrderStatusClass(status) {
    switch (status) {
        case "cho_xac_nhan":
            return "bg-amber-100 text-amber-700";
        case "dang_giao":
            return "bg-sky-100 text-sky-700";
        case "da_giao":
            return "bg-emerald-100 text-emerald-700";
        case "da_huy":
            return "bg-rose-100 text-rose-700";
        default:
            return "bg-slate-100 text-slate-700";
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

function getComplaintStatusClass(status) {
    switch (status) {
        case "moi":
            return "bg-yellow-100 text-yellow-700";
        case "dang_xu_ly":
            return "bg-blue-100 text-blue-700";
        case "chap_nhan":
            return "bg-green-100 text-green-700";
        case "tu_choi":
            return "bg-red-100 text-red-700";
        case "hoan_tat":
        case "da_xu_ly":
            return "bg-emerald-100 text-emerald-700";
        default:
            return "bg-slate-100 text-slate-700";
    }
}

function getComplaintStatusLabel(status) {
    switch (status) {
        case "moi":
            return "Mới";
        case "dang_xu_ly":
            return "Đang xử lý";
        case "chap_nhan":
            return "Chấp nhận";
        case "tu_choi":
            return "Từ chối";
        case "hoan_tat":
        case "da_xu_ly":
            return "Hoàn tất";
        default:
            return status || "Chưa rõ";
    }
}

function getUserStatusClass(status) {
    switch (status) {
        case "hoat_dong":
            return "bg-emerald-100 text-emerald-700";
        case "tam_khoa":
        case "da_khoa":
            return "bg-rose-100 text-rose-700";
        case "cho_duyet":
            return "bg-amber-100 text-amber-700";
        default:
            return "bg-slate-100 text-slate-700";
    }
}

function getRoleLabel(role) {
    switch (role) {
        case "nguoi_mua":
        case "customer":
            return "Người mua";
        case "nguoi_ban":
        case "shop":
            return "Người bán";
        case "quan_tri":
        case "admin":
            return "Quản trị";
        case "giao_hang":
        case "shipper":
            return "Giao hàng";
        default:
            return role || "Chưa rõ";
    }
}

function formatDateTime(value) {
    if (!value) {
        return "--";
    }

    return new Date(value).toLocaleString("vi-VN");
}

function getHoursSince(value) {
    if (!value) {
        return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return Math.max(0, (Date.now() - date.getTime()) / 3600000);
}

function getComplaintSla(item) {
    if (["da_xu_ly", "hoan_tat"].includes(item?.trang_thai)) {
        return { label: "Đã chốt", className: "bg-emerald-100 text-emerald-700" };
    }

    const ageHours = getHoursSince(item?.created_at);

    if (ageHours !== null && ageHours >= 48) {
        return { label: "Breach > 48h", className: "bg-red-100 text-red-700" };
    }

    if (ageHours !== null && ageHours >= 24) {
        return { label: "Cảnh báo > 24h", className: "bg-yellow-100 text-yellow-700" };
    }

    return { label: "Trong SLA", className: "bg-green-100 text-green-700" };
}

function getConversationHeat(item) {
    const ageHours = getHoursSince(item?.thoi_gian_cuoi || item?.created_at);

    if (item?.chua_doc_admin && ageHours !== null && ageHours >= 6) {
        return { label: "Hot > 6h", className: "bg-red-100 text-red-700" };
    }

    if (item?.chua_doc_admin) {
        return { label: "Chưa đọc", className: "bg-yellow-100 text-yellow-700" };
    }

    return { label: "Ổn định", className: "bg-green-100 text-green-700" };
}

function getConversationLabel(conversation) {
    const names = (conversation.members || [])
        .map((member) => member.user?.ho_ten)
        .filter(Boolean)
        .slice(0, 3);

    if (names.length === 0) {
        return conversation.ma_hoi_thoai;
    }

    return `${conversation.ma_hoi_thoai} • ${names.join(", ")}`;
}

function getToneClasses(tone) {
    switch (tone) {
        case "amber":
            return "from-amber-50 to-white text-amber-700 ring-amber-100";
        case "orange":
            return "from-orange-50 to-white text-orange-700 ring-orange-100";
        case "red":
            return "from-rose-50 to-white text-rose-700 ring-rose-100";
        case "sky":
            return "from-sky-50 to-white text-sky-700 ring-sky-100";
        case "rose":
            return "from-red-50 to-white text-red-700 ring-red-100";
        case "violet":
            return "from-violet-50 to-white text-violet-700 ring-violet-100";
        case "emerald":
            return "from-emerald-50 to-white text-emerald-700 ring-emerald-100";
        default:
            return "from-slate-50 to-white text-slate-700 ring-slate-100";
    }
}

export default function Dashboard() {
    const mounted = useRef(true);
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        orderScope: "",
        complaintScope: "",
        conversationScope: "",
    });

    const fetchDashboard = async (isRefresh = false) => {
        if (!isRefresh) {
            setLoading(true);
        }
        setError(null);

        try {
            console.log("[Dashboard] Fetching data...");
            const response = await get("/api/admin/dashboard");
            console.log("[Dashboard] Response received:", response);

            if (mounted.current) {
                setDashboard(response.data || {});
            }
        } catch (err) {
            console.error("[Dashboard] Fetch error:", err);
            if (mounted.current) {
                setError("Không thể tải dữ liệu dashboard. Vui lòng thử lại.");
            }
        } finally {
            if (mounted.current) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        mounted.current = true;
        fetchDashboard();

        return () => {
            mounted.current = false;
        };
    }, []);

    const handleRefresh = () => {
        fetchDashboard(true);
    };

    const priorityOrders = dashboard?.priority_orders || [];
    const activeComplaints = dashboard?.active_complaints || [];
    const recentConversations = dashboard?.recent_conversations || [];
    const pendingShops = dashboard?.pending_shops || [];
    const recentUsers = dashboard?.recent_users || [];

    const filteredOrders = useMemo(() => {
        return priorityOrders.filter((order) => {
            if (!filters.orderScope) {
                return true;
            }

            if (filters.orderScope === "bat_thuong") {
                return Boolean(order.bat_thuong);
            }

            if (filters.orderScope === "can_thiep") {
                return order.trang_thai_xac_nhan === "can_admin_xac_nhan";
            }

            return true;
        });
    }, [filters.orderScope, priorityOrders]);

    const filteredComplaints = useMemo(() => {
        return activeComplaints.filter((item) => {
            if (!filters.complaintScope) {
                return true;
            }

            return item.trang_thai === filters.complaintScope;
        });
    }, [activeComplaints, filters.complaintScope]);

    const filteredConversations = useMemo(() => {
        return recentConversations.filter((item) => {
            if (!filters.conversationScope) {
                return true;
            }

            if (filters.conversationScope === "chua_doc") {
                return Boolean(item.chua_doc_admin);
            }

            if (filters.conversationScope === "da_doc") {
                return !item.chua_doc_admin;
            }

            return true;
        });
    }, [filters.conversationScope, recentConversations]);

    const ordersNeedAttention = useMemo(() => {
        return filteredOrders.filter(
            (order) => order.bat_thuong || order.trang_thai_xac_nhan === "can_admin_xac_nhan"
        );
    }, [filteredOrders]);

    const cards = [
        {
            label: "Tổng người dùng",
            value: dashboard?.users?.total || 0,
            note: "Người dùng toàn sàn",
            tone: "slate",
            badge: "core",
        },
        {
            label: "Người mua",
            value: dashboard?.users?.customers || 0,
            note: "Tài khoản mua hàng",
            tone: "amber",
            badge: "buyer",
        },
        {
            label: "Tổng cửa hàng",
            value: dashboard?.shops?.total || 0,
            note: "Shop đang tham gia sàn",
            tone: "orange",
            badge: "shop",
        },
        {
            label: "Shop chờ duyệt",
            value: dashboard?.shops?.pending || 0,
            note: "Cần kiểm tra hồ sơ",
            tone: "red",
            badge: "review",
        },
        {
            label: "Tổng đơn hàng",
            value: dashboard?.orders?.total || 0,
            note: "Đơn phát sinh toàn hệ thống",
            tone: "sky",
            badge: "orders",
        },
        {
            label: "Đơn bất thường",
            value: dashboard?.orders?.abnormal || 0,
            note: "Cần giám sát thêm",
            tone: "rose",
            badge: "risk",
        },
        {
            label: "Hội thoại chưa đọc",
            value: dashboard?.conversations?.unread_admin || 0,
            note: "Tin nhắn cần phản hồi",
            tone: "violet",
            badge: "cskh",
        },
        {
            label: "Thông báo chưa đọc",
            value: dashboard?.notifications?.unread || 0,
            note: "Thông báo chờ xử lý",
            tone: "emerald",
            badge: "alerts",
        },
    ];

    const opsSignals = dashboard?.ops_signals || {};

    const actionDeck = [
        {
            label: "Can thiệp đơn hàng",
            value: opsSignals.orders_need_attention || 0,
            note: "Đơn bị gắn cờ hoặc cần admin xác minh ngay trong phiên.",
            to: "/admin/orders?bat_thuong=true",
            cta: "Mở radar đơn",
            tone: "rose",
        },
        {
            label: "Vi phạm SLA khiếu nại",
            value: opsSignals.breached_complaints || 0,
            note: "Case đã quá 48h hoặc sắp vi phạm SLA cần chốt xử lý.",
            to: "/admin/complaints?complaintStatus=dang_xu_ly",
            cta: "Mở trung tâm hỗ trợ",
            tone: "orange",
        },
        {
            label: "Khiếu nại chưa gán",
            value: opsSignals.unassigned_complaints || 0,
            note: "Khiếu nại đang mở nhưng chưa được giao admin chịu trách nhiệm.",
            to: "/admin/complaints?complaintAssignee=unassigned",
            cta: "Gán người xử lý ngay",
            tone: "amber",
        },
        {
            label: "Chat chưa phản hồi",
            value: opsSignals.stale_unread_conversations || 0,
            note: "Hội thoại chưa đọc đã tồn trên 6 giờ, dễ ảnh hưởng trải nghiệm khách hàng.",
            to: "/admin/complaints?conversationUnread=true",
            cta: "Đi tới chat hỗ trợ",
            tone: "violet",
        },
        {
            label: "Duyệt nhà bán hàng",
            value: opsSignals.pending_shops || 0,
            note: "Shop mới chờ duyệt hồ sơ để bắt đầu hoạt động trên sàn.",
            to: "/admin/shops?trang_thai=cho_duyet",
            cta: "Phê duyệt shop",
            tone: "sky",
        },
        {
            label: "Thông báo hệ thống",
            value: opsSignals.unread_notifications || 0,
            note: "Cảnh báo, thông báo hàng loạt và tín hiệu hệ thống cần xử lý.",
            to: "/admin/notifications?readState=unread",
            cta: "Mở trung tâm tín hiệu",
            tone: "emerald",
        },
        {
            label: "Kiểm duyệt chiến dịch",
            value: opsSignals.pending_campaign_registrations || 0,
            note: "Shop đang chờ duyệt tham gia chiến dịch, ảnh hưởng đến độ phủ chương trình.",
            to: "/admin/campaigns?registrationStatus=cho_duyet&campaignStatus=dang_mo_dang_ky",
            cta: "Mở vận hành marketing",
            tone: "orange",
        },
    ];

    if (loading) {
        return (
            <div className="space-y-6">
                <div className={`${adminStyles.panel} rounded-[32px] p-6 md:p-7`}>
                    <div className="animate-pulse space-y-5">
                        <div className="h-4 w-40 rounded-full bg-slate-200" />
                        <div className="h-10 w-full max-w-3xl rounded-2xl bg-slate-200" />
                        <div className="grid gap-4 md:grid-cols-4">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className="h-14 rounded-[20px] bg-slate-100" />
                            ))}
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                            {Array.from({ length: 8 }).map((_, index) => (
                                <div key={index} className="h-32 rounded-[22px] bg-slate-100" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={adminStyles.pageStack}>
            <div className={adminStyles.heroHeader}>
                <div className="flex items-center justify-between">
                    <div>
                        <span className={adminStyles.eyebrow}>Trung tâm vận hành</span>
                        <h1 className={adminStyles.heroTitle}>Thông tin hệ thống</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleRefresh}
                            disabled={loading}
                            className={adminStyles.secondaryButton}
                        >
                            <RefreshCcw size={16} className={loading ? "animate-spin mr-2" : "mr-2"} />
                            Làm mới
                        </button>
                        <div className="h-10 w-[1px] bg-slate-200 mx-1"></div>
                        <div className="flex flex-col items-end">
                            <span className={adminStyles.heroBadge}>DASHBOARD</span>
                            <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">
                                {new Date().toLocaleDateString("vi-VN")}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <section className={`${adminStyles.panel} rounded-[28px] p-5 md:p-6`}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {cards.map((card) => (
                        <div
                            key={card.label}
                            className={`${adminStyles.kpiCard} rounded-[20px] p-4 ring-1 ${getToneClasses(card.tone)}`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                                        {card.label}
                                    </p>
                                    <h4 className="mt-2 text-[2rem] font-extrabold tracking-tight text-slate-900">
                                        {formatCompactNumber(card.value)}
                                    </h4>
                                </div>
                                <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-current shadow-sm">
                                    {card.badge}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
