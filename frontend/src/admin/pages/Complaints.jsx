import React, { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { RefreshCcw } from "lucide-react";
import SavedFilterViews from "../components/SavedFilterViews";
import { get, post, put } from "../lib/api";
import { adminChatStyles, adminStyles } from "../lib/adminStyles";
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

function formatConversationDay(value) {
    if (!value) {
        return "--";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "--";
    }

    return date.toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

function getConversationDayKey(value) {
    if (!value) {
        return "unknown";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "unknown";
    }

    return date.toISOString().slice(0, 10);
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

function getComplaintSla(complaint) {
    if (["da_xu_ly", "hoan_tat"].includes(complaint?.trang_thai)) {
        return { label: "Đã chốt", className: "bg-emerald-100 text-emerald-700" };
    }

    const ageHours = getHoursSince(complaint?.created_at);

    if (ageHours === null) {
        return { label: "Chưa có SLA", className: "bg-slate-100 text-slate-700" };
    }

    if (ageHours >= 48) {
        return { label: "Breach > 48h", className: "bg-red-100 text-red-700" };
    }

    if (ageHours >= 24) {
        return { label: "Cảnh báo > 24h", className: "bg-yellow-100 text-yellow-700" };
    }

    return { label: "Trong SLA", className: "bg-green-100 text-green-700" };
}

function getConversationFreshness(conversation) {
    const ageHours = getHoursSince(conversation?.thoi_gian_cuoi || conversation?.created_at);

    if (ageHours === null) {
        return { label: "Chưa có tín hiệu", className: "bg-slate-100 text-slate-700" };
    }

    if (conversation?.chua_doc_admin && ageHours >= 6) {
        return { label: "Hot > 6h", className: "bg-red-100 text-red-700" };
    }

    if (conversation?.chua_doc_admin && ageHours >= 2) {
        return { label: "Chờ phản hồi", className: "bg-yellow-100 text-yellow-700" };
    }

    return { label: "Ổn định", className: "bg-green-100 text-green-700" };
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
        case "da_xu_ly":
        case "hoan_tat":
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
        case "da_xu_ly":
        case "hoan_tat":
            return "Hoàn tất";
        default:
            return status || "Chưa rõ";
    }
}

function getPriorityClass(priority) {
    switch (priority) {
        case "cao":
            return "bg-red-100 text-red-700";
        case "trung_binh":
            return "bg-yellow-100 text-yellow-700";
        case "thap":
            return "bg-green-100 text-green-700";
        default:
            return "bg-slate-100 text-slate-700";
    }
}

function getPriorityLabel(priority) {
    switch (priority) {
        case "cao":
            return "Ưu tiên cao";
        case "trung_binh":
            return "Ưu tiên trung bình";
        case "thap":
            return "Ưu tiên thấp";
        default:
            return priority || "Chưa gắn";
    }
}

function getConversationStatusClass(status) {
    switch (status) {
        case "moi":
            return "bg-yellow-100 text-yellow-700";
        case "dang_xu_ly":
            return "bg-blue-100 text-blue-700";
        case "da_phan_hoi":
            return "bg-emerald-100 text-emerald-700";
        default:
            return "bg-slate-100 text-slate-700";
    }
}

function getConversationStatusLabel(status) {
    switch (status) {
        case "moi":
            return "Mới";
        case "dang_xu_ly":
            return "Đang xử lý";
        case "da_phan_hoi":
            return "Đã phản hồi";
        default:
            return status || "Chưa rõ";
    }
}

function getConversationTypeLabel(type) {
    switch (type) {
        case "khieu_nai":
            return "Khiếu nại";
        case "ho_tro":
            return "Hỗ trợ";
        default:
            return type || "Khác";
    }
}

function isEnterpriseRole(role) {
    return ["admin", "quan_tri"].includes(role);
}

function getConversationUsers(conversation) {
    const uniqueUsers = new Map();

    (conversation?.members || []).forEach((member) => {
        const user = member?.user;

        if (!user) {
            return;
        }

        const key = user.id || user.ho_ten || user.name;

        if (!key || uniqueUsers.has(key)) {
            return;
        }

        uniqueUsers.set(key, user);
    });

    (conversation?.messages || []).forEach((message) => {
        const user = message?.sender;

        if (!user) {
            return;
        }

        const key = user.id || user.ho_ten || user.name;

        if (!key || uniqueUsers.has(key)) {
            return;
        }

        uniqueUsers.set(key, user);
    });

    return Array.from(uniqueUsers.values());
}

function getConversationCounterparties(conversation) {
    return getConversationUsers(conversation).filter((user) => !isEnterpriseRole(user?.vai_tro));
}

function getUserIdentityKey(user) {
    if (!user) {
        return "";
    }

    if (user.id !== undefined && user.id !== null) {
        return String(user.id);
    }

    return [user.vai_tro || "user", user.ho_ten || user.name || "unknown"].join(":");
}

function getConversationTypingKey(conversationId) {
    return String(conversationId || "");
}

function getUserDisplayName(user) {
    return user?.ho_ten || user?.name || "Người dùng";
}

function getMessageRecipientKey(message) {
    if (message?.recipient) {
        return getUserIdentityKey(message.recipient);
    }

    if (message?.nguoi_nhan_id !== undefined && message?.nguoi_nhan_id !== null) {
        return String(message.nguoi_nhan_id);
    }

    return "";
}

function getThreadMessages(conversation, targetUser = null) {
    const messages = conversation?.messages || [];

    if (!targetUser) {
        return messages;
    }

    const targetKey = getUserIdentityKey(targetUser);
    const hasMultipleCounterparties = getConversationCounterparties(conversation).length > 1;

    return messages.filter((message) => {
        if (!isEnterpriseActor(message)) {
            return getUserIdentityKey(message.sender) === targetKey;
        }

        const recipientKey = getMessageRecipientKey(message);

        if (recipientKey) {
            return recipientKey === targetKey;
        }

        return !hasMultipleCounterparties;
    });
}

function getConversationTitle(conversation) {
    const counterparties = getConversationCounterparties(conversation);

    if (!counterparties.length) {
        return conversation.ma_hoi_thoai || `Hội thoại #${conversation.id}`;
    }

    const names = counterparties
        .map((user) => user.ho_ten || user.name)
        .filter(Boolean);

    if (!names.length) {
        return conversation.ma_hoi_thoai || `Hội thoại #${conversation.id}`;
    }

    return names.length === 1 ? names[0] : `${names[0]} +${names.length - 1}`;
}

function getConversationParticipantSummary(conversation) {
    const counterparties = getConversationCounterparties(conversation);

    if (!counterparties.length) {
        return "Chưa xác định người đối thoại";
    }

    const names = counterparties
        .map((user) => user.ho_ten || user.name)
        .filter(Boolean);

    if (!names.length) {
        return "Chưa xác định người đối thoại";
    }

    return names.length === 1
        ? `Đang trao đổi với ${names[0]}`
        : `Đang trao đổi với ${names.join(", ")}`;
}

function getConversationContextLabel(conversation) {
    if (conversation.complaint?.ma_khieu_nai) {
        return `Case ${conversation.complaint.ma_khieu_nai}`;
    }

    if (conversation.order?.ma_don_hang) {
        return `Đơn ${conversation.order.ma_don_hang}`;
    }

    return "Không gắn case";
}

function isEnterpriseActor(message) {
    return isEnterpriseRole(message?.sender?.vai_tro);
}

function getActorRoleLabel(actor) {
    switch (actor?.vai_tro) {
        case "admin":
        case "quan_tri":
            return "Hỗ trợ";
        case "shop":
        case "seller":
            return "Shop";
        case "shipper":
            return "Shipper";
        default:
            return "Khách hàng";
    }
}

function getActorInitials(name) {
    const words = String(name || "User")
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2);

    if (!words.length) {
        return "US";
    }

    return words.map((word) => word.charAt(0).toUpperCase()).join("");
}

export default function Complaints({ view = "overview" }) {
    const [complaints, setComplaints] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [savingComplaint, setSavingComplaint] = useState(false);
    const [savingConversation, setSavingConversation] = useState(false);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [selectedComplaintId, setSelectedComplaintId] = useState(null);
    const [selectedConversationId, setSelectedConversationId] = useState(null);
    const [selectedConversationTargetKey, setSelectedConversationTargetKey] = useState(null);
    const [complaintFilters, setComplaintFilters] = useUrlFilterState({
        complaintKeyword: "",
        complaintStatus: "",
        complaintPriority: "",
        complaintAssignee: "",
    });
    const [conversationFilters, setConversationFilters] = useUrlFilterState({
        conversationKeyword: "",
        conversationStatus: "",
        conversationType: "",
        conversationUnread: "",
    });
    const [complaintForm, setComplaintForm] = useState({
        trang_thai: "",
        uu_tien: "",
        phan_quyet_admin: "",
        ly_do_tu_choi: "",
        assigned_admin_id: "",
    });
    const [conversationForm, setConversationForm] = useState({
        trang_thai: "",
    });
    const [messageForm, setMessageForm] = useState({
        nguoi_gui_id: "",
        noi_dung: "",
    });
    const [typingIndicator, setTypingIndicator] = useState("");
    const [error, setError] = useState(null);
    const composerTypingTimeoutRef = useRef(null);
    const typingIndicatorTimeoutRef = useRef(null);
    const typingPreviewTimeoutsRef = useRef({});
    const [typingPreviewByConversation, setTypingPreviewByConversation] = useState({});
    const savedViews = useSavedFilterViews(
        "admin-complaints-views",
        { ...complaintFilters, ...conversationFilters },
        (nextFilters) => {
            setComplaintFilters((current) => ({
                ...current,
                complaintKeyword: nextFilters.complaintKeyword ?? "",
                complaintStatus: nextFilters.complaintStatus ?? "",
                complaintPriority: nextFilters.complaintPriority ?? "",
                complaintAssignee: nextFilters.complaintAssignee ?? "",
            }));
            setConversationFilters((current) => ({
                ...current,
                conversationKeyword: nextFilters.conversationKeyword ?? "",
                conversationStatus: nextFilters.conversationStatus ?? "",
                conversationType: nextFilters.conversationType ?? "",
                conversationUnread: nextFilters.conversationUnread ?? "",
            }));
        }
    );

    useEffect(() => {
        let mounted = true;

        async function loadData() {
            setLoading(true);
            setError(null);

            try {
                const [complaintsResponse, conversationsResponse, adminsResponse] = await Promise.all([
                    get("/api/admin/complaints", {
                        keyword: complaintFilters.complaintKeyword,
                        trang_thai: complaintFilters.complaintStatus,
                        uu_tien: complaintFilters.complaintPriority,
                        assigned_admin_id: complaintFilters.complaintAssignee,
                    }),
                    get("/api/admin/conversations", {
                        keyword: conversationFilters.conversationKeyword,
                        trang_thai: conversationFilters.conversationStatus,
                        loai_hoi_thoai: conversationFilters.conversationType,
                        ...(conversationFilters.conversationUnread === ""
                            ? {}
                            : { chua_doc_admin: conversationFilters.conversationUnread === "true" }),
                    }),
                    get("/api/admin/users", { vai_tro: "admin" }),
                ]);

                if (!mounted) {
                    return;
                }

                const complaintItems = complaintsResponse.data || [];
                const conversationItems = conversationsResponse.data || [];
                const adminItems = (adminsResponse.data || []).filter((item) =>
                    ["quan_tri", "admin"].includes(item.vai_tro)
                );

                setComplaints(complaintItems);
                setConversations(conversationItems);
                setAdmins(adminItems);
                setSelectedComplaintId((current) => {
                    if (current && complaintItems.some((item) => item.id === current)) {
                        return current;
                    }

                    return complaintItems[0]?.id || null;
                });
                setSelectedConversationId((current) => {
                    if (current && conversationItems.some((item) => item.id === current)) {
                        return current;
                    }

                    return conversationItems[0]?.id || null;
                });
                setMessageForm((current) => ({
                    ...current,
                    nguoi_gui_id: current.nguoi_gui_id || String(adminItems[0]?.id || ""),
                }));
            } catch (requestError) {
                if (mounted) {
                    setError(requestError.message || "Không thể tải dữ liệu CSKH.");
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        loadData();

        return () => {
            mounted = false;
        };
    }, [complaintFilters.complaintAssignee, complaintFilters.complaintKeyword, complaintFilters.complaintPriority, complaintFilters.complaintStatus, conversationFilters.conversationKeyword, conversationFilters.conversationStatus, conversationFilters.conversationType, conversationFilters.conversationUnread]);

    const selectedComplaint = useMemo(
        () => complaints.find((item) => item.id === selectedComplaintId) || null,
        [complaints, selectedComplaintId]
    );

    const selectedConversation = useMemo(
        () => conversations.find((item) => item.id === selectedConversationId) || null,
        [conversations, selectedConversationId]
    );

    useEffect(() => {
        let cancelled = false;

        async function hydrateSelectedConversation() {
            if (!selectedConversationId || !selectedConversation) {
                return;
            }

            if (Array.isArray(selectedConversation.messages)) {
                return;
            }

            try {
                const response = await get(`/api/admin/conversations/${selectedConversationId}`);
                const detail = response.data;

                if (!detail || cancelled) {
                    return;
                }

                setConversations((current) =>
                    current.map((item) =>
                        item.id === selectedConversationId ? { ...item, ...detail } : item
                    )
                );
            } catch {
                if (!cancelled) {
                    setError("Không thể tải chi tiết hội thoại.");
                }
            }
        }

        hydrateSelectedConversation();

        return () => {
            cancelled = true;
        };
    }, [selectedConversation, selectedConversationId]);

    const selectedConversationCounterparties = useMemo(
        () => getConversationCounterparties(selectedConversation),
        [selectedConversation]
    );

    const selectedConversationTarget = useMemo(() => {
        if (!selectedConversationCounterparties.length) {
            return null;
        }

        return (
            selectedConversationCounterparties.find(
                (user) => getUserIdentityKey(user) === selectedConversationTargetKey
            ) || selectedConversationCounterparties[0]
        );
    }, [selectedConversationCounterparties, selectedConversationTargetKey]);

    useEffect(() => {
        if (!selectedComplaint) {
            setComplaintForm({
                trang_thai: "",
                uu_tien: "",
                phan_quyet_admin: "",
                ly_do_tu_choi: "",
                assigned_admin_id: "",
            });
            return;
        }

        setComplaintForm({
            trang_thai: selectedComplaint.trang_thai || "moi",
            uu_tien: selectedComplaint.uu_tien || "trung_binh",
            phan_quyet_admin: selectedComplaint.phan_quyet_admin || "",
            ly_do_tu_choi: selectedComplaint.ly_do_tu_choi || "",
            assigned_admin_id: selectedComplaint.assigned_admin_id
                ? String(selectedComplaint.assigned_admin_id)
                : "",
        });
    }, [selectedComplaint]);

    useEffect(() => {
        if (!selectedConversation) {
            setConversationForm({ trang_thai: "" });
            return;
        }

        setConversationForm({ trang_thai: selectedConversation.trang_thai || "moi" });
    }, [selectedConversation]);

    useEffect(() => {
        if (!selectedConversationCounterparties.length) {
            setSelectedConversationTargetKey(null);
            return;
        }

        setSelectedConversationTargetKey((current) => {
            if (
                current &&
                selectedConversationCounterparties.some(
                    (user) => getUserIdentityKey(user) === current
                )
            ) {
                return current;
            }

            return getUserIdentityKey(selectedConversationCounterparties[0]);
        });
    }, [selectedConversationCounterparties]);

    const summary = useMemo(
        () => ({
            totalComplaints: complaints.length,
            openComplaints: complaints.filter((item) => ["moi", "dang_xu_ly"].includes(item.trang_thai)).length,
            highPriority: complaints.filter((item) => item.uu_tien === "cao").length,
            unreadConversations: conversations.filter((item) => item.chua_doc_admin).length,
            unassignedComplaints: complaints.filter((item) => !item.assigned_admin_id).length,
            breachedComplaints: complaints.filter((item) => getHoursSince(item.created_at) >= 48 && !["da_xu_ly", "hoan_tat"].includes(item.trang_thai)).length,
            staleConversations: conversations.filter((item) => item.chua_doc_admin && getHoursSince(item.thoi_gian_cuoi || item.created_at) >= 6).length,
        }),
        [complaints, conversations]
    );

    const replyTemplates = [
        "Admin đã tiếp nhận case, đang kiểm tra timeline đơn hàng và sẽ phản hồi sớm nhất.",
        "Bên mình đã ghi nhận thông tin và đang đối soát với shop/shipper liên quan.",
        "Case đang được ưu tiên xử lý. Khi có kết luận, hệ thống sẽ cập nhật lại ngay trong hội thoại này.",
    ];

    const relatedConversations = useMemo(() => {
        if (!selectedComplaintId) {
            return conversations;
        }

        return conversations.filter((item) => item.khieu_nai_id === selectedComplaintId);
    }, [conversations, selectedComplaintId]);

    const conversationParticipants = useMemo(() => {
        if (!selectedConversationTarget) {
            return "Chưa xác định người đối thoại";
        }

        return `Đang trao đổi với ${getUserDisplayName(selectedConversationTarget)}`;
    }, [selectedConversationTarget]);

    const emitConversationTyping = useEffectEvent((isTyping) => {
        if (!selectedConversationId || selectedConversation?.loai_hoi_thoai !== "ho_tro" || !messageForm.nguoi_gui_id) {
            return;
        }

        const adminSender = admins.find((item) => String(item.id) === String(messageForm.nguoi_gui_id));
        const socket = getSocketClient();
        const payload = {
            room: `conversation.${selectedConversationId}`,
            conversationId: selectedConversationId,
            senderId: Number(messageForm.nguoi_gui_id),
            senderName: adminSender?.ho_ten || "Admin",
            senderRole: adminSender?.vai_tro || "admin",
            isTyping,
        };

        const emitTyping = () => {
            socket.emit("conversation.typing", payload);
        };

        socket.connect();

        if (socket.connected) {
            emitTyping();
            return;
        }

        const handleConnect = () => {
            socket.off("connect", handleConnect);
            emitTyping();
        };

        socket.on("connect", handleConnect);
    });

    const visibleConversationThreads = useMemo(() => {
        const sourceItems = selectedComplaintId ? relatedConversations : conversations;

        return sourceItems.flatMap((conversation) => {
            const counterparties = getConversationCounterparties(conversation);

            if (!counterparties.length) {
                const threadMessages = getThreadMessages(conversation);

                return [
                    {
                        key: `${conversation.id}:conversation`,
                        conversation,
                        targetUser: null,
                        threadMessages,
                        lastMessage: threadMessages.at(-1) || null,
                    },
                ];
            }

            return counterparties.map((user) => {
                const threadMessages = getThreadMessages(conversation, user);

                return {
                    key: `${conversation.id}:${getUserIdentityKey(user)}`,
                    conversation,
                    targetUser: user,
                    threadMessages,
                    lastMessage: threadMessages.at(-1) || null,
                };
            });
        });
    }, [conversations, relatedConversations, selectedComplaintId]);

    const filteredTranscriptMessages = useMemo(() => {
        return getThreadMessages(selectedConversation, selectedConversationTarget);
    }, [selectedConversation, selectedConversationTarget]);

    const transcriptEntries = useMemo(() => {
        const entries = [];
        let currentDay = null;

        filteredTranscriptMessages.forEach((message) => {
            const dayKey = getConversationDayKey(message.created_at);

            if (dayKey !== currentDay) {
                currentDay = dayKey;
                entries.push({
                    type: "divider",
                    key: `divider-${dayKey}`,
                    label: formatConversationDay(message.created_at),
                });
            }

            entries.push({
                type: "message",
                key: `message-${message.id}`,
                message,
            });
        });

        return entries;
    }, [filteredTranscriptMessages]);
    const visibleConversations = selectedComplaintId ? relatedConversations : conversations;
    const selectedConversationComplaint = useMemo(() => {
        if (!selectedConversation) {
            return null;
        }

        if (selectedConversation.complaint) {
            return selectedConversation.complaint;
        }

        if (selectedConversation.khieu_nai_id) {
            return complaints.find((item) => item.id === selectedConversation.khieu_nai_id) || null;
        }

        return null;
    }, [complaints, selectedConversation]);

    const conversationInfoCards = selectedConversation
        ? [
              {
                  label: "Participants",
                  value: conversationParticipants,
                  note: "Các thành viên đang có trong hội thoại.",
              },
              {
                  label: "Unread state",
                  value: selectedConversation.chua_doc_admin ? "Admin chưa đọc" : "Đã được xử lý",
                  note: "Tình trạng đọc hiện tại của phía vận hành.",
              },
              {
                  label: "Queue link",
                  value: getConversationContextLabel(selectedConversation),
                  note: "Liên kết đến case hoặc đơn liên quan.",
              },
          ]
        : [];

    const showComplaintQueue = view === "complaints";
    const showConversationQueue = view === "conversations";
    const showComplaintWorkspace = view === "complaints";
    const showConversationWorkspace = view === "conversations";
    const isConversationFocusedView = view === "conversations";
    const showSummaryCards = view === "overview";
    const showTaskPanels =
        showComplaintQueue ||
        showConversationQueue ||
        showComplaintWorkspace ||
        showConversationWorkspace;

    const handleOpenComplaint = async (complaint) => {
        setSelectedComplaintId(complaint.id);
        setDetailLoading(true);
        setError(null);

        try {
            const response = await get(`/api/admin/complaints/${complaint.id}`);
            const detail = response.data || complaint;

            setComplaints((current) =>
                current.map((item) => (item.id === complaint.id ? { ...item, ...detail } : item))
            );

            if (detail.conversation?.id) {
                setSelectedConversationId(detail.conversation.id);
            }
        } catch {
            setError("Không thể tải chi tiết khiếu nại.");
        } finally {
            setDetailLoading(false);
        }
    };

    const handleOpenConversation = async (conversation, targetUser = null) => {
        setSelectedConversationId(conversation.id);
        setSelectedConversationTargetKey(targetUser ? getUserIdentityKey(targetUser) : null);
        setDetailLoading(true);
        setError(null);

        try {
            const response = await get(`/api/admin/conversations/${conversation.id}`);
            const detail = response.data || conversation;

            setConversations((current) =>
                current.map((item) => (item.id === conversation.id ? { ...item, ...detail } : item))
            );

            if (detail.khieu_nai_id) {
                setSelectedComplaintId(detail.khieu_nai_id);
            }
        } catch {
            setError("Không thể tải chi tiết hội thoại.");
        } finally {
            setDetailLoading(false);
        }
    };

    const handleSaveComplaint = async () => {
        if (!selectedComplaint) {
            return;
        }

        setSavingComplaint(true);
        setError(null);

        try {
            const response = await put(`/api/admin/complaints/${selectedComplaint.id}`, {
                trang_thai: complaintForm.trang_thai,
                uu_tien: complaintForm.uu_tien,
                phan_quyet_admin: complaintForm.phan_quyet_admin || null,
                ly_do_tu_choi: complaintForm.ly_do_tu_choi || null,
                assigned_admin_id: complaintForm.assigned_admin_id
                    ? Number(complaintForm.assigned_admin_id)
                    : null,
            });
            const updated = response.data || selectedComplaint;

            setComplaints((current) =>
                current.map((item) => (item.id === selectedComplaint.id ? updated : item))
            );
        } catch (requestError) {
            setError(requestError.message || "Không thể cập nhật khiếu nại.");
        } finally {
            setSavingComplaint(false);
        }
    };

    const handleQuickComplaintAction = async (updates) => {
        if (!selectedComplaint) {
            return;
        }

        setComplaintForm((current) => ({ ...current, ...updates }));
        setSavingComplaint(true);
        setError(null);

        try {
            const response = await put(`/api/admin/complaints/${selectedComplaint.id}`, {
                trang_thai: updates.trang_thai ?? complaintForm.trang_thai,
                uu_tien: updates.uu_tien ?? complaintForm.uu_tien,
                phan_quyet_admin: updates.phan_quyet_admin ?? (complaintForm.phan_quyet_admin || null),
                ly_do_tu_choi: updates.ly_do_tu_choi ?? (complaintForm.ly_do_tu_choi || null),
                assigned_admin_id: updates.assigned_admin_id ?? (complaintForm.assigned_admin_id ? Number(complaintForm.assigned_admin_id) : null),
            });

            const updated = response.data || selectedComplaint;
            setComplaints((current) => current.map((item) => (item.id === selectedComplaint.id ? updated : item)));
        } catch (requestError) {
            setError(requestError.message || "Không thể cập nhật nhanh khiếu nại.");
        } finally {
            setSavingComplaint(false);
        }
    };

    const handleUpdateConversationStatus = async () => {
        if (!selectedConversation) {
            return;
        }

        setSavingConversation(true);
        setError(null);

        try {
            const response = await put(`/api/admin/conversations/${selectedConversation.id}/status`, {
                trang_thai: conversationForm.trang_thai,
            });
            const updated = response.data || selectedConversation;

            setConversations((current) =>
                current.map((item) => (item.id === selectedConversation.id ? { ...item, ...updated } : item))
            );
        } catch (requestError) {
            setError(requestError.message || "Không thể cập nhật hội thoại.");
        } finally {
            setSavingConversation(false);
        }
    };

    const handleMarkConversationRead = async (conversationId) => {
        try {
            await put(`/api/admin/conversations/${conversationId}/read`, {});
            setConversations((current) =>
                current.map((item) => (item.id === conversationId ? { ...item, chua_doc_admin: 0 } : item))
            );
        } catch {
            setError("Không thể đánh dấu đã đọc hội thoại.");
        }
    };

    const handleSendMessage = async (event) => {
        event.preventDefault();

        if (!selectedConversation) {
            return;
        }

        if (!messageForm.nguoi_gui_id || !messageForm.noi_dung.trim()) {
            setError("Cần chọn admin gửi và nhập nội dung phản hồi.");
            return;
        }

        setSendingMessage(true);
        setError(null);
        emitConversationTyping(false);

        if (composerTypingTimeoutRef.current) {
            clearTimeout(composerTypingTimeoutRef.current);
            composerTypingTimeoutRef.current = null;
        }

        try {
            await post(`/api/admin/conversations/${selectedConversation.id}/messages`, {
                nguoi_gui_id: Number(messageForm.nguoi_gui_id),
                nguoi_nhan_id: selectedConversationTarget?.id ?? null,
                noi_dung: messageForm.noi_dung.trim(),
                loai_tin_nhan: "van_ban",
            });

            const refreshed = await get(`/api/admin/conversations/${selectedConversation.id}`);
            const updated = refreshed.data || selectedConversation;

            setConversations((current) =>
                current.map((item) => (item.id === selectedConversation.id ? updated : item))
            );
            setMessageForm((current) => ({ ...current, noi_dung: "" }));
        } catch (requestError) {
            setError(requestError.message || "Không thể gửi phản hồi.");
        } finally {
            setSendingMessage(false);
        }
    };

    const handleConversationTyping = useEffectEvent((payload) => {
        const conversationId = Number(payload?.conversationId || 0);

        if (!conversationId || conversationId !== selectedConversationId) {
            return;
        }

        if (Number(payload?.senderId || 0) === Number(messageForm.nguoi_gui_id || 0)) {
            return;
        }

        if (!payload?.isTyping) {
            setTypingIndicator("");
            setTypingPreviewByConversation((current) => {
                const next = { ...current };
                delete next[getConversationTypingKey(conversationId)];
                return next;
            });

            if (typingIndicatorTimeoutRef.current) {
                clearTimeout(typingIndicatorTimeoutRef.current);
                typingIndicatorTimeoutRef.current = null;
            }

            if (typingPreviewTimeoutsRef.current[conversationId]) {
                clearTimeout(typingPreviewTimeoutsRef.current[conversationId]);
                delete typingPreviewTimeoutsRef.current[conversationId];
            }

            return;
        }

        const typingText = `${payload.senderName || "Người dùng"} đang nhập tin nhắn`;

        setTypingIndicator(typingText);
        setTypingPreviewByConversation((current) => ({
            ...current,
            [getConversationTypingKey(conversationId)]: typingText,
        }));

        if (typingIndicatorTimeoutRef.current) {
            clearTimeout(typingIndicatorTimeoutRef.current);
        }

        if (typingPreviewTimeoutsRef.current[conversationId]) {
            clearTimeout(typingPreviewTimeoutsRef.current[conversationId]);
        }

        typingIndicatorTimeoutRef.current = setTimeout(() => {
            setTypingIndicator("");
            typingIndicatorTimeoutRef.current = null;
        }, 1600);

        typingPreviewTimeoutsRef.current[conversationId] = setTimeout(() => {
            setTypingPreviewByConversation((current) => {
                const next = { ...current };
                delete next[getConversationTypingKey(conversationId)];
                return next;
            });
            delete typingPreviewTimeoutsRef.current[conversationId];
        }, 1600);
    });

    const handleRealtimeConversationUpdate = useEffectEvent(async (payload) => {
        const conversationId = Number(payload?.conversationId || 0);

        if (!conversationId) {
            return;
        }

        try {
            const response = await get(`/api/admin/conversations/${conversationId}`);
            const updatedConversation = response.data;

            if (!updatedConversation) {
                return;
            }

            setConversations((current) => {
                const exists = current.some((item) => item.id === conversationId);
                const next = exists
                    ? current.map((item) => (item.id === conversationId ? updatedConversation : item))
                    : [updatedConversation, ...current];

                return [...next].sort((left, right) => {
                    const leftTime = new Date(left.thoi_gian_cuoi || left.created_at || 0).getTime();
                    const rightTime = new Date(right.thoi_gian_cuoi || right.created_at || 0).getTime();

                    return rightTime - leftTime;
                });
            });
        } catch {
            // Ignore transient socket refresh failures and rely on the existing HTTP flow.
        }
    });

    useEffect(() => {
        const socket = getSocketClient();
        const rooms = ["admin.conversations"];

        if (selectedConversationId) {
            rooms.push(`conversation.${selectedConversationId}`);
        }

        const joinRooms = () => {
            rooms.forEach((room) => socket.emit("join_room", room));
        };

        socket.connect();

        if (socket.connected) {
            joinRooms();
        }

        socket.on("connect", joinRooms);
        socket.on("conversation.updated", handleRealtimeConversationUpdate);
        socket.on("conversation.typing", handleConversationTyping);

        return () => {
            socket.off("connect", joinRooms);
            rooms.forEach((room) => socket.emit("leave_room", room));
            socket.off("conversation.updated", handleRealtimeConversationUpdate);
            socket.off("conversation.typing", handleConversationTyping);
        };
    }, [handleConversationTyping, handleRealtimeConversationUpdate, selectedConversationId]);

    useEffect(() => {
        return () => {
            if (composerTypingTimeoutRef.current) {
                clearTimeout(composerTypingTimeoutRef.current);
            }

            if (typingIndicatorTimeoutRef.current) {
                clearTimeout(typingIndicatorTimeoutRef.current);
            }

            Object.values(typingPreviewTimeoutsRef.current).forEach((timeoutId) => {
                clearTimeout(timeoutId);
            });
            typingPreviewTimeoutsRef.current = {};
        };
    }, []);

    if (isConversationFocusedView) {
    return (
        <div className={adminStyles.pageStack}>
            <div className={adminStyles.heroHeader}>
                <div className="flex items-center justify-between">
                    <div>
                        <span className={adminStyles.eyebrow}>Trung tâm vận hành</span>
                        <h1 className={adminStyles.heroTitle}>Hội thoại chi tiết</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className={adminStyles.secondaryButton}
                        >
                            Quay lại
                        </button>
                        <div className="h-10 w-[1px] bg-slate-200 mx-1"></div>
                        <div className="flex flex-col items-end">
                            <span className={adminStyles.heroBadge}>CHAT</span>
                            <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">
                                {new Date().toLocaleDateString("vi-VN")}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            ) : null}

            <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                <aside className="lg:sticky lg:top-[96px] lg:max-h-[calc(100vh-112px)] lg:w-[360px] lg:flex-none lg:overflow-hidden xl:w-[390px]">
                    <section className={`${adminStyles.tableCard} overflow-hidden border border-slate-200/70 bg-white/95 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]`}>
                        <div className="space-y-4">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--admin-primary)]">
                                        Chat inbox
                                    </p>
                                    <h3 className="mt-2 text-lg font-bold text-slate-900">
                                        Danh sách hội thoại
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Theo dõi hội thoại khách hàng và phản hồi nhanh.
                                    </p>
                                </div>
                                <span className={adminStyles.chip}>{visibleConversationThreads.length} chat</span>
                            </div>

                            <div className="grid grid-cols-1 gap-3 rounded-[22px] border border-slate-200/70 bg-gradient-to-br from-slate-50 to-orange-50/40 p-3.5">
                                <input
                                    value={conversationFilters.conversationKeyword}
                                    onChange={(event) =>
                                        setConversationFilters((current) => ({
                                            ...current,
                                            conversationKeyword: event.target.value,
                                        }))
                                    }
                                    placeholder="Tìm mã chat, mã đơn, thành viên"
                                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                                />

                                <select
                                    value={conversationFilters.conversationType}
                                    onChange={(event) =>
                                        setConversationFilters((current) => ({
                                            ...current,
                                            conversationType: event.target.value,
                                        }))
                                    }
                                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                                >
                                    <option value="">Tất cả loại chat</option>
                                    <option value="khieu_nai">Khiếu nại</option>
                                    <option value="ho_tro">Hỗ trợ</option>
                                </select>

                                <select
                                    value={conversationFilters.conversationStatus}
                                    onChange={(event) =>
                                        setConversationFilters((current) => ({
                                            ...current,
                                            conversationStatus: event.target.value,
                                        }))
                                    }
                                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                                >
                                    <option value="">Tất cả trạng thái</option>
                                    <option value="moi">Mới</option>
                                    <option value="dang_xu_ly">Đang xử lý</option>
                                    <option value="da_phan_hoi">Đã phản hồi</option>
                                </select>

                                <select
                                    value={conversationFilters.conversationUnread}
                                    onChange={(event) =>
                                        setConversationFilters((current) => ({
                                            ...current,
                                            conversationUnread: event.target.value,
                                        }))
                                    }
                                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                                >
                                    <option value="">Tất cả</option>
                                    <option value="true">Chưa đọc admin</option>
                                    <option value="false">Đã đọc</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-4 space-y-3 overflow-y-auto pr-1 lg:max-h-[calc(100vh-385px)]">
                            {visibleConversationThreads.length === 0 ? (
                                <div className={`${adminStyles.emptyState} p-6 text-sm`}>
                                    Không có hội thoại phù hợp.
                                </div>
                            ) : (
                                visibleConversationThreads.map(({ key, conversation, targetUser, lastMessage }) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => handleOpenConversation(conversation, targetUser)}
                                        className={`${adminChatStyles.conversationCard} ${
                                            selectedConversationId === conversation.id &&
                                            (targetUser
                                                ? selectedConversationTargetKey === getUserIdentityKey(targetUser)
                                                : !selectedConversationTargetKey)
                                                ? adminChatStyles.conversationCardActive
                                                : adminChatStyles.conversationCardIdle
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div
                                                className={`${adminChatStyles.avatar} ${
                                                    conversation.chua_doc_admin ? adminChatStyles.avatarAdmin : ""
                                                }`}
                                            >
                                                {getActorInitials(
                                                    targetUser
                                                        ? getUserDisplayName(targetUser)
                                                        : getConversationTitle(conversation)
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="truncate font-semibold text-slate-900">
                                                            {targetUser
                                                                ? getUserDisplayName(targetUser)
                                                                : getConversationTitle(conversation)}
                                                        </p>
                                                        <p className={`mt-1 line-clamp-2 text-sm leading-6 ${typingPreviewByConversation[getConversationTypingKey(conversation.id)] ? "font-semibold text-sky-600" : "text-slate-500"}`}>
                                                            {typingPreviewByConversation[getConversationTypingKey(conversation.id)] || lastMessage?.noi_dung || "Chưa có tin nhắn gần nhất"}
                                                        </p>
                                                    </div>

                                                    <div className="text-right text-[11px] font-medium text-slate-400">
                                                        {formatDateTime(
                                                            lastMessage?.created_at || conversation.thoi_gian_cuoi || conversation.created_at
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                                                        {getConversationTypeLabel(conversation.loai_hoi_thoai)}
                                                    </span>

                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-medium ${getConversationStatusClass(
                                                            conversation.trang_thai
                                                        )}`}
                                                    >
                                                        {getConversationStatusLabel(conversation.trang_thai)}
                                                    </span>

                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-medium ${getConversationFreshness(
                                                            conversation
                                                        ).className}`}
                                                    >
                                                        {getConversationFreshness(conversation).label}
                                                    </span>

                                                    {conversation.chua_doc_admin ? (
                                                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                                                            Chưa đọc
                                                        </span>
                                                    ) : null}
                                                </div>

                                                <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500">
                                                    <span>
                                                        {conversation.complaint?.ma_khieu_nai ||
                                                            conversation.order?.ma_don_hang ||
                                                            "Không gắn case"}
                                                    </span>
                                                    <span className="font-semibold text-slate-400">
                                                        #{conversation.ma_hoi_thoai || conversation.id}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </section>
                </aside>

                <section className="flex min-h-[calc(100vh-112px)] flex-col overflow-hidden rounded-[30px] border border-slate-200/70 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)] lg:min-w-0 lg:flex-1">
                    {!selectedConversation ? (
                        <div className="flex min-h-[calc(100vh-112px)] items-center justify-center bg-slate-50/70 p-6 text-sm text-slate-500">
                            Chọn một hội thoại ở bên trái để mở khung chat.
                        </div>
                    ) : (
                        <>
                            <div className={adminChatStyles.header}>
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-base font-semibold text-slate-900">
                                            {selectedConversationTarget
                                                ? getUserDisplayName(selectedConversationTarget)
                                                : getConversationTitle(selectedConversation)}
                                        </p>
                                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                                            #{selectedConversation.ma_hoi_thoai || selectedConversation.id}
                                        </span>
                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                                            {getConversationContextLabel(selectedConversation)}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {conversationParticipants}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <select
                                        value={conversationForm.trang_thai}
                                        onChange={(event) =>
                                            setConversationForm({ trang_thai: event.target.value })
                                        }
                                        className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                                    >
                                        <option value="moi">Mới</option>
                                        <option value="dang_xu_ly">Đang xử lý</option>
                                        <option value="da_phan_hoi">Đã phản hồi</option>
                                    </select>

                                    <button
                                        type="button"
                                        onClick={handleUpdateConversationStatus}
                                        disabled={savingConversation}
                                        className="rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {savingConversation ? "Đang cập nhật..." : "Lưu trạng thái"}
                                    </button>

                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-medium ${getConversationFreshness(
                                            selectedConversation
                                        ).className}`}
                                    >
                                        {getConversationFreshness(selectedConversation).label}
                                    </span>

                                    {selectedConversation?.chua_doc_admin ? (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleMarkConversationRead(selectedConversation.id)
                                            }
                                            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                                        >
                                            Đánh dấu đã đọc
                                        </button>
                                    ) : null}
                                </div>
                            </div>

                            {selectedConversationComplaint ? (
                                <div className={adminChatStyles.relatedCase}>
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
                                                Khiếu nại liên quan
                                            </p>
                                            <p className="mt-2 text-sm font-semibold text-slate-900">
                                                {selectedConversationComplaint.ma_khieu_nai ||
                                                    "Không có mã khiếu nại"}
                                            </p>
                                            <p className="mt-1 text-sm text-slate-600">
                                                {selectedConversationComplaint.noi_dung ||
                                                    selectedConversationComplaint.mo_ta ||
                                                    "Chưa có mô tả case."}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${getComplaintStatusClass(
                                                    selectedConversationComplaint.trang_thai
                                                )}`}
                                            >
                                                {getComplaintStatusLabel(
                                                    selectedConversationComplaint.trang_thai
                                                )}
                                            </span>

                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${getPriorityClass(
                                                    selectedConversationComplaint.uu_tien
                                                )}`}
                                            >
                                                {getPriorityLabel(
                                                    selectedConversationComplaint.uu_tien
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : null}

                            <div className={`${adminChatStyles.thread} max-h-none flex-1`}>
                                {transcriptEntries.length === 0 ? (
                                    <p className="text-sm text-slate-500">
                                        Chưa có tin nhắn trong hội thoại.
                                    </p>
                                ) : (
                                    transcriptEntries.map((entry) => {
                                        if (entry.type === "divider") {
                                            return (
                                                <div
                                                    key={entry.key}
                                                    className={adminChatStyles.dayDividerWrap}
                                                >
                                                    <span className={adminChatStyles.dayDivider}>
                                                        {entry.label}
                                                    </span>
                                                </div>
                                            );
                                        }

                                        const { message } = entry;
                                        const enterpriseActor = isEnterpriseActor(message);

                                        return (
                                            <div
                                                key={entry.key}
                                                className={`${adminChatStyles.bubbleRow} ${
                                                    enterpriseActor
                                                        ? adminChatStyles.bubbleRowAdmin
                                                        : adminChatStyles.bubbleRowCustomer
                                                }`}
                                            >
                                                {!enterpriseActor ? (
                                                    <div
                                                        className={`${adminChatStyles.avatar} bg-slate-200 text-slate-700`}
                                                    >
                                                        {getActorInitials(
                                                            message.sender?.ho_ten || "Người dùng"
                                                        )}
                                                    </div>
                                                ) : null}

                                                <div
                                                    className={`${adminChatStyles.messageStack} ${
                                                        enterpriseActor
                                                            ? adminChatStyles.messageStackAdmin
                                                            : ""
                                                    }`}
                                                >
                                                    <div
                                                        className={`${adminChatStyles.messageLabel} ${
                                                            enterpriseActor
                                                                ? "justify-end"
                                                                : "justify-start"
                                                        }`}
                                                    >
                                                        <span className="font-semibold text-slate-700">
                                                            {message.sender?.ho_ten || "Người dùng"}
                                                        </span>

                                                        <span
                                                            className={`${adminChatStyles.roleTag} ${
                                                                enterpriseActor
                                                                    ? adminChatStyles.roleTagAdmin
                                                                    : adminChatStyles.roleTagCustomer
                                                            }`}
                                                        >
                                                            {getActorRoleLabel(message.sender)}
                                                        </span>

                                                        <span>{formatDateTime(message.created_at)}</span>

                                                        {enterpriseActor ? (
                                                            <span className={adminChatStyles.readState}>
                                                                {message.da_xem ? "Đã xem" : "Đã gửi"}
                                                            </span>
                                                        ) : null}
                                                    </div>

                                                    <div
                                                        className={`${adminChatStyles.bubble} ${
                                                            enterpriseActor
                                                                ? adminChatStyles.bubbleAdmin
                                                                : adminChatStyles.bubbleCustomer
                                                        }`}
                                                    >
                                                        <p className="text-sm leading-6">
                                                            {message.noi_dung}
                                                        </p>
                                                    </div>
                                                </div>

                                                {enterpriseActor ? (
                                                    <div
                                                        className={`${adminChatStyles.avatar} ${adminChatStyles.avatarAdmin}`}
                                                    >
                                                        {getActorInitials(
                                                            message.sender?.ho_ten || "Admin"
                                                        )}
                                                    </div>
                                                ) : null}
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            <form onSubmit={handleSendMessage} className={adminChatStyles.composer}>
                                {typingIndicator ? (
                                    <div className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-sky-700">
                                        <span>{typingIndicator}</span>
                                        <span className="inline-flex items-center gap-1" aria-hidden="true">
                                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-sky-500 [animation-delay:-0.25s]"></span>
                                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-sky-500 [animation-delay:-0.1s]"></span>
                                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-sky-500"></span>
                                        </span>
                                    </div>
                                ) : null}

                                <textarea
                                    value={messageForm.noi_dung}
                                    onChange={(event) => {
                                        const nextValue = event.target.value;

                                        setMessageForm((current) => ({
                                            ...current,
                                            noi_dung: nextValue,
                                        }));

                                        if (selectedConversation?.loai_hoi_thoai !== "ho_tro") {
                                            return;
                                        }

                                        emitConversationTyping(Boolean(nextValue.trim()));

                                        if (composerTypingTimeoutRef.current) {
                                            clearTimeout(composerTypingTimeoutRef.current);
                                        }

                                        if (!nextValue.trim()) {
                                            composerTypingTimeoutRef.current = null;
                                            return;
                                        }

                                        composerTypingTimeoutRef.current = setTimeout(() => {
                                            emitConversationTyping(false);
                                            composerTypingTimeoutRef.current = null;
                                        }, 1200);
                                    }}
                                    rows={4}
                                    placeholder="Nhập phản hồi gửi khách hàng..."
                                    className={adminChatStyles.composerInput}
                                    onBlur={() => emitConversationTyping(false)}
                                />

                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-xs text-slate-500">
                                        Phản hồi ngắn gọn, rõ bước xử lý tiếp theo và thời gian dự kiến.
                                    </p>

                                    <button
                                        type="submit"
                                        disabled={sendingMessage}
                                        className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(249,115,22,0.28)] transition hover:translate-y-[-1px] hover:shadow-[0_16px_34px_rgba(249,115,22,0.32)] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {sendingMessage ? "Đang gửi..." : "Gửi phản hồi"}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </section>
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
                        <h1 className={adminStyles.heroTitle}>Khiếu nại & Chat</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleRefreshAll}
                            disabled={loading || chatLoading}
                            className={adminStyles.secondaryButton}
                        >
                            <RefreshCcw size={16} className={(loading || chatLoading) ? "animate-spin mr-2" : "mr-2"} />
                            Làm mới
                        </button>
                        <div className="h-10 w-[1px] bg-slate-200 mx-1"></div>
                        <div className="flex flex-col items-end">
                            <span className={adminStyles.heroBadge}>SUPPORT</span>
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className={`${adminStyles.statCard} p-5`}>
                    <p className="text-sm text-slate-500">Tổng khiếu nại</p>
                    <h4 className="mt-2 text-3xl font-bold text-slate-800">{summary.totalComplaints}</h4>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">complaints</p>
                </div>
                <div className={`${adminStyles.statCard} p-5`}>
                    <p className="text-sm text-slate-500">Đang mở</p>
                    <h4 className="mt-2 text-3xl font-bold text-yellow-700">{summary.openComplaints}</h4>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">open queue</p>
                </div>
                <div className={`${adminStyles.statCard} p-5`}>
                    <p className="text-sm text-slate-500">Ưu tiên cao</p>
                    <h4 className="mt-2 text-3xl font-bold text-red-700">{summary.highPriority}</h4>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">high priority</p>
                </div>
                <div className={`${adminStyles.statCard} p-5`}>
                    <p className="text-sm text-slate-500">Hội thoại chưa đọc</p>
                    <h4 className="mt-2 text-3xl font-bold text-[var(--admin-primary)]">{summary.unreadConversations}</h4>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">unread chats</p>
                </div>
                <div className={`${adminStyles.statCard} p-5`}>
                    <p className="text-sm text-slate-500">Case chưa gán owner</p>
                    <h4 className="mt-2 text-3xl font-bold text-slate-800">{summary.unassignedComplaints}</h4>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">unassigned</p>
                </div>
                <div className={`${adminStyles.statCard} p-5`}>
                    <p className="text-sm text-slate-500">Case breach SLA</p>
                    <h4 className="mt-2 text-3xl font-bold text-red-700">{summary.breachedComplaints}</h4>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">breach</p>
                </div>
                <div className={`${adminStyles.statCard} p-5`}>
                    <p className="text-sm text-slate-500">Chat nóng tồn đọng</p>
                    <h4 className="mt-2 text-3xl font-bold text-red-700">{summary.staleConversations}</h4>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">hot chats</p>
                </div>
            </div>
            ) : null}

            {showTaskPanels ? (
            <div className={`grid grid-cols-1 gap-6 ${isConversationFocusedView ? "lg:grid-cols-[340px,minmax(0,1fr)] lg:items-start" : "xl:grid-cols-[1.05fr,0.95fr]"}`}>
                <div className="space-y-6">
                    {showComplaintQueue ? (
                    <section className={`${adminStyles.tableCard} p-5 md:p-6`}>
                        <div className="mb-4 flex flex-col gap-4">
                            <div>
                                <h4 className={adminStyles.sectionTitle}>Queue khiếu nại</h4>
                                <p className="mt-1 text-sm text-slate-500">Theo dõi case mới, mức ưu tiên và người đang xử lý.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                                <input
                                    value={complaintFilters.complaintKeyword}
                                    onChange={(event) =>
                                        setComplaintFilters((current) => ({ ...current, complaintKeyword: event.target.value }))
                                    }
                                    placeholder="Tìm mã KN, mã đơn, buyer"
                                    className="rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none"
                                />
                                <select
                                    value={complaintFilters.complaintStatus}
                                    onChange={(event) =>
                                        setComplaintFilters((current) => ({ ...current, complaintStatus: event.target.value }))
                                    }
                                    className="rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none"
                                >
                                    <option value="">Tất cả trạng thái</option>
                                    <option value="moi">Mới</option>
                                    <option value="dang_xu_ly">Đang xử lý</option>
                                    <option value="chap_nhan">Chấp nhận</option>
                                    <option value="tu_choi">Từ chối</option>
                                    <option value="da_xu_ly">Hoàn tất</option>
                                </select>
                                <select
                                    value={complaintFilters.complaintPriority}
                                    onChange={(event) =>
                                        setComplaintFilters((current) => ({ ...current, complaintPriority: event.target.value }))
                                    }
                                    className="rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none"
                                >
                                    <option value="">Tất cả ưu tiên</option>
                                    <option value="cao">Cao</option>
                                    <option value="trung_binh">Trung bình</option>
                                    <option value="thap">Thấp</option>
                                </select>
                                <select
                                    value={complaintFilters.complaintAssignee}
                                    onChange={(event) =>
                                        setComplaintFilters((current) => ({ ...current, complaintAssignee: event.target.value }))
                                    }
                                    className="rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none"
                                >
                                    <option value="">Tất cả assignee</option>
                                    <option value="unassigned">Chưa gán</option>
                                    {admins.map((admin) => (
                                        <option key={admin.id} value={admin.id}>
                                            {admin.ho_ten || admin.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mb-4">
                            <SavedFilterViews
                                title="Preset"
                                draftName={savedViews.draftName}
                                setDraftName={savedViews.setDraftName}
                                onSave={savedViews.saveCurrentView}
                                views={savedViews.views}
                                onApply={savedViews.applyView}
                                onDelete={savedViews.deleteView}
                            />
                        </div>

                        <div className="space-y-3">
                            {loading ? (
                                <div className={`${adminStyles.emptyState} p-6 text-sm`}>Đang tải khiếu nại...</div>
                            ) : complaints.length === 0 ? (
                                <div className={`${adminStyles.emptyState} p-6 text-sm`}>Không có khiếu nại phù hợp.</div>
                            ) : (
                                complaints.map((complaint) => (
                                    <button
                                        key={complaint.id}
                                        type="button"
                                        onClick={() => handleOpenComplaint(complaint)}
                                        className={`block w-full rounded-[20px] border p-4 text-left transition ${
                                            selectedComplaintId === complaint.id
                                                ? "border-[rgba(238,77,45,0.24)] bg-[rgba(255,245,240,0.94)] shadow-[0_10px_24px_rgba(238,77,45,0.08)]"
                                                : "border-[rgba(132,86,72,0.1)] bg-white/78 hover:bg-white"
                                        }`}
                                    >
                                        <div className="flex flex-col gap-3">
                                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="font-semibold text-slate-900">{complaint.ma_khieu_nai}</p>
                                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                                            {complaint.order?.ma_don_hang || "Không gắn đơn"}
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 text-sm text-slate-500">
                                                        {complaint.complainant?.ho_ten || "Người dùng"} • {formatDateTime(complaint.created_at)}
                                                    </p>
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${getComplaintStatusClass(complaint.trang_thai)}`}>
                                                        {getComplaintStatusLabel(complaint.trang_thai)}
                                                    </span>
                                                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${getPriorityClass(complaint.uu_tien)}`}>
                                                        {getPriorityLabel(complaint.uu_tien)}
                                                    </span>
                                                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${getComplaintSla(complaint).className}`}>
                                                        {getComplaintSla(complaint).label}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="text-sm leading-6 text-slate-600">
                                                {complaint.noi_dung || complaint.mo_ta || "Chưa có mô tả chi tiết."}
                                            </p>

                                            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                                                <span>Owner: {complaint.assigned_admin?.ho_ten || "Chưa gán"}</span>
                                                <span>{complaint.conversation?.ma_hoi_thoai || "Chưa có hội thoại"}</span>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </section>
                    ) : null}

                    {showConversationQueue ? (
                    <section className={`${adminStyles.tableCard} p-5 md:p-6 ${isConversationFocusedView ? "lg:sticky lg:top-[106px] lg:max-h-[calc(100vh-128px)] lg:overflow-hidden" : ""}`}>
                        <div className="mb-4 flex flex-col gap-3">
                            <div>
                                <h4 className={adminStyles.sectionTitle}>Queue hội thoại CSKH</h4>
                            </div>
                            <div className={`grid grid-cols-1 gap-3 ${isConversationFocusedView ? "md:grid-cols-1" : "md:grid-cols-2 xl:grid-cols-4"}`}>
                                <input
                                    value={conversationFilters.conversationKeyword}
                                    onChange={(event) =>
                                        setConversationFilters((current) => ({ ...current, conversationKeyword: event.target.value }))
                                    }
                                    placeholder="Tìm mã chat, mã đơn, thành viên"
                                    className="rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none"
                                />
                                <select
                                    value={conversationFilters.conversationType}
                                    onChange={(event) =>
                                        setConversationFilters((current) => ({ ...current, conversationType: event.target.value }))
                                    }
                                    className="rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none"
                                >
                                    <option value="">Tất cả loại chat</option>
                                    <option value="khieu_nai">Khiếu nại</option>
                                    <option value="ho_tro">Hỗ trợ</option>
                                </select>
                                <select
                                    value={conversationFilters.conversationStatus}
                                    onChange={(event) =>
                                        setConversationFilters((current) => ({ ...current, conversationStatus: event.target.value }))
                                    }
                                    className="rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none"
                                >
                                    <option value="">Tất cả trạng thái</option>
                                    <option value="moi">Mới</option>
                                    <option value="dang_xu_ly">Đang xử lý</option>
                                    <option value="da_phan_hoi">Đã phản hồi</option>
                                </select>
                                <select
                                    value={conversationFilters.conversationUnread}
                                    onChange={(event) =>
                                        setConversationFilters((current) => ({ ...current, conversationUnread: event.target.value }))
                                    }
                                    className="rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none"
                                >
                                    <option value="">Tất cả</option>
                                    <option value="true">Chưa đọc admin</option>
                                    <option value="false">Đã đọc</option>
                                </select>
                            </div>
                        </div>

                        <div className={`space-y-3 ${isConversationFocusedView ? "overflow-y-auto pr-1 lg:max-h-[calc(100vh-330px)]" : ""}`}>
                            {(selectedComplaintId ? relatedConversations : conversations).length === 0 ? (
                                <div className={`${adminStyles.emptyState} p-6 text-sm`}>Không có hội thoại phù hợp.</div>
                            ) : (
                                (selectedComplaintId ? relatedConversations : conversations).map((conversation) => (
                                    <button
                                        key={conversation.id}
                                        type="button"
                                        onClick={() => handleOpenConversation(conversation)}
                                        className={`block w-full rounded-[18px] border p-4 text-left transition ${
                                            selectedConversationId === conversation.id
                                                ? "border-[rgba(238,77,45,0.24)] bg-[rgba(255,245,240,0.94)] shadow-[0_10px_24px_rgba(238,77,45,0.08)]"
                                                : "border-[rgba(132,86,72,0.1)] bg-white/78 hover:bg-white"
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`${adminChatStyles.avatar} ${conversation.chua_doc_admin ? adminChatStyles.avatarAdmin : ""}`}>
                                                {getActorInitials(getConversationTitle(conversation))}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="truncate font-semibold text-slate-900">{getConversationTitle(conversation)}</p>
                                                        <p className={`mt-1 line-clamp-2 text-sm leading-6 ${typingPreviewByConversation[getConversationTypingKey(conversation.id)] ? "font-semibold text-sky-600" : "text-slate-500"}`}>{typingPreviewByConversation[getConversationTypingKey(conversation.id)] || conversation.tin_nhan_cuoi || "Chưa có tin nhắn gần nhất"}</p>
                                                    </div>
                                                    <div className="text-right text-[11px] text-slate-400">
                                                        {formatDateTime(conversation.thoi_gian_cuoi || conversation.created_at)}
                                                    </div>
                                                </div>
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                                                        {getConversationTypeLabel(conversation.loai_hoi_thoai)}
                                                    </span>
                                                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${getConversationStatusClass(conversation.trang_thai)}`}>
                                                        {getConversationStatusLabel(conversation.trang_thai)}
                                                    </span>
                                                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${getConversationFreshness(conversation).className}`}>
                                                        {getConversationFreshness(conversation).label}
                                                    </span>
                                                    {conversation.chua_doc_admin ? (
                                                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">Chưa đọc</span>
                                                    ) : null}
                                                </div>
                                                <p className="mt-2 text-xs text-slate-500">
                                                    {conversation.complaint?.ma_khieu_nai || conversation.order?.ma_don_hang || "Không gắn case"}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </section>
                    ) : null}
                </div>

                <div className="space-y-6">
                    {showComplaintWorkspace ? (
                    <section className={`${adminStyles.panel} rounded-[32px] p-5 md:p-6`}>
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div>
                                <h4 className={adminStyles.sectionTitle}>Xử lý khiếu nại</h4>
                                <p className="mt-1 text-sm text-slate-500">Tóm tắt case ở trên, quyết định xử lý ở dưới.</p>
                            </div>
                            {detailLoading ? <span className={adminStyles.chip}>Đang tải</span> : null}
                        </div>

                        {!selectedComplaint ? (
                            <div className={`${adminStyles.emptyState} p-6 text-sm`}>Chọn một khiếu nại để xem chi tiết.</div>
                        ) : (
                            <div className="space-y-4">
                                <div className={`${adminStyles.detailCard} p-5`}>
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h5 className="text-lg font-bold text-slate-900">{selectedComplaint.ma_khieu_nai}</h5>
                                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                                    {selectedComplaint.order?.ma_don_hang || "Không gắn đơn"}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-sm text-slate-500">
                                                {selectedComplaint.complainant?.ho_ten || "Người gửi không xác định"} • {formatDateTime(selectedComplaint.created_at)}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${getComplaintStatusClass(selectedComplaint.trang_thai)}`}>
                                                {getComplaintStatusLabel(selectedComplaint.trang_thai)}
                                            </span>
                                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${getPriorityClass(selectedComplaint.uu_tien)}`}>
                                                {getPriorityLabel(selectedComplaint.uu_tien)}
                                            </span>
                                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${getComplaintSla(selectedComplaint).className}`}>
                                                {getComplaintSla(selectedComplaint).label}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                        <div className="rounded-[18px] border border-[rgba(132,86,72,0.1)] bg-white/80 p-4">
                                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Người gửi</p>
                                            <p className="mt-2 text-sm font-semibold text-slate-900">{selectedComplaint.complainant?.ho_ten || "Không xác định"}</p>
                                        </div>
                                        <div className="rounded-[18px] border border-[rgba(132,86,72,0.1)] bg-white/80 p-4">
                                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Owner</p>
                                            <p className="mt-2 text-sm font-semibold text-slate-900">{selectedComplaint.assigned_admin?.ho_ten || "Chưa gán"}</p>
                                        </div>
                                        <div className="rounded-[18px] border border-[rgba(132,86,72,0.1)] bg-white/80 p-4">
                                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Tạo lúc</p>
                                            <p className="mt-2 text-sm font-semibold text-slate-900">{formatDateTime(selectedComplaint.created_at)}</p>
                                        </div>
                                        <div className="rounded-[18px] border border-[rgba(132,86,72,0.1)] bg-white/80 p-4">
                                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Hội thoại</p>
                                            <p className="mt-2 text-sm font-semibold text-slate-900">{selectedComplaint.conversation?.ma_hoi_thoai || "Chưa có"}</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 rounded-[18px] border border-[rgba(132,86,72,0.08)] bg-[rgba(255,249,246,0.8)] p-4 text-sm leading-7 text-slate-600">
                                        {selectedComplaint.noi_dung || selectedComplaint.mo_ta || "Chưa có nội dung."}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                    <button
                                        type="button"
                                        onClick={() => handleQuickComplaintAction({ trang_thai: "dang_xu_ly" })}
                                        disabled={savingComplaint}
                                        className={adminStyles.secondaryButton}
                                    >
                                        Nhận xử lý
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleQuickComplaintAction({ trang_thai: "chap_nhan", uu_tien: complaintForm.uu_tien })}
                                        disabled={savingComplaint}
                                        className="rounded-[16px] bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        Chấp nhận case
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleQuickComplaintAction({ trang_thai: "da_xu_ly" })}
                                        disabled={savingComplaint}
                                        className={adminStyles.darkButton}
                                    >
                                        Chốt hoàn tất
                                    </button>
                                </div>

                                <div className={`${adminStyles.detailCard} p-5`}>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <label className="space-y-2 text-sm text-slate-600">
                                            <span>Trạng thái</span>
                                            <select
                                                value={complaintForm.trang_thai}
                                                onChange={(event) => setComplaintForm((current) => ({ ...current, trang_thai: event.target.value }))}
                                                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none"
                                            >
                                                <option value="moi">Mới</option>
                                                <option value="dang_xu_ly">Đang xử lý</option>
                                                <option value="chap_nhan">Chấp nhận</option>
                                                <option value="tu_choi">Từ chối</option>
                                                <option value="da_xu_ly">Hoàn tất</option>
                                            </select>
                                        </label>

                                        <label className="space-y-2 text-sm text-slate-600">
                                            <span>Ưu tiên</span>
                                            <select
                                                value={complaintForm.uu_tien}
                                                onChange={(event) => setComplaintForm((current) => ({ ...current, uu_tien: event.target.value }))}
                                                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none"
                                            >
                                                <option value="cao">Cao</option>
                                                <option value="trung_binh">Trung bình</option>
                                                <option value="thap">Thấp</option>
                                            </select>
                                        </label>

                                        <label className="space-y-2 text-sm text-slate-600">
                                            <span>Phân công</span>
                                            <select
                                                value={complaintForm.assigned_admin_id}
                                                onChange={(event) => setComplaintForm((current) => ({ ...current, assigned_admin_id: event.target.value }))}
                                                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none"
                                            >
                                                <option value="">Chưa phân công admin</option>
                                                {admins.map((admin) => (
                                                    <option key={admin.id} value={admin.id}>
                                                        {admin.ho_ten || admin.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                    </div>

                                    <div className="mt-4 space-y-4">
                                        <label className="block space-y-2 text-sm text-slate-600">
                                            <span>Kết luận xử lý</span>
                                            <textarea
                                                value={complaintForm.phan_quyet_admin}
                                                onChange={(event) => setComplaintForm((current) => ({ ...current, phan_quyet_admin: event.target.value }))}
                                                rows={5}
                                                placeholder="Kết luận điều tra, phương án xử lý, cam kết phản hồi"
                                                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none"
                                            />
                                        </label>

                                        <label className="block space-y-2 text-sm text-slate-600">
                                            <span>Lý do từ chối</span>
                                            <textarea
                                                value={complaintForm.ly_do_tu_choi}
                                                onChange={(event) => setComplaintForm((current) => ({ ...current, ly_do_tu_choi: event.target.value }))}
                                                rows={3}
                                                placeholder="Chỉ nhập khi từ chối hoặc cần ghi rõ chứng cứ không hợp lệ"
                                                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none"
                                            />
                                        </label>

                                        <div className="flex justify-end">
                                            <button
                                                type="button"
                                                onClick={handleSaveComplaint}
                                                disabled={savingComplaint}
                                                className={`${adminStyles.primaryButton} min-w-[220px] justify-center`}
                                            >
                                                {savingComplaint ? "Đang lưu xử lý..." : "Lưu quyết định case"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
                    ) : null}

                    {showConversationWorkspace ? (
                    <section className={`${adminStyles.panel} rounded-[32px] p-5 md:p-6 ${isConversationFocusedView ? "lg:min-h-[calc(100vh-128px)]" : ""}`}>
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div>
                                <h4 className={adminStyles.sectionTitle}>Conversation command center</h4>
                            </div>
                            {selectedConversation?.chua_doc_admin ? (
                                <button
                                    type="button"
                                    onClick={() => handleMarkConversationRead(selectedConversation.id)}
                                    className={`${adminStyles.secondaryButton} px-4 py-2`}
                                >
                                    Đánh dấu đã đọc
                                </button>
                            ) : null}
                        </div>

                        {!selectedConversation ? (
                            <div className={`${adminStyles.emptyState} p-6 text-sm`}>Chọn một hội thoại để xử lý.</div>
                        ) : (
                            <div className={`${isConversationFocusedView ? "grid flex-1 gap-4 lg:grid-cols-[320px,minmax(0,1fr)]" : "space-y-4"}`}>
                                <div className="space-y-4">
                                    <div className={`${adminStyles.detailCard} p-4`}>
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ee4d2d]">Live context</p>
                                                <p className="mt-2 text-lg font-bold text-slate-900">{getConversationTitle(selectedConversation)}</p>
                                                <p className="mt-1 text-sm text-slate-500">{getConversationContextLabel(selectedConversation)} • {formatDateTime(selectedConversation.thoi_gian_cuoi || selectedConversation.created_at)}</p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                                                    {getConversationTypeLabel(selectedConversation.loai_hoi_thoai)}
                                                </span>
                                                <span className={`rounded-full px-3 py-1 text-xs font-medium ${getConversationStatusClass(selectedConversation.trang_thai)}`}>
                                                    {getConversationStatusLabel(selectedConversation.trang_thai)}
                                                </span>
                                                <span className={`rounded-full px-3 py-1 text-xs font-medium ${getConversationFreshness(selectedConversation).className}`}>
                                                    {getConversationFreshness(selectedConversation).label}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-4 space-y-3">
                                            {conversationInfoCards.map((card) => (
                                                <div key={card.label} className="rounded-[16px] border border-[rgba(132,86,72,0.1)] bg-white p-4">
                                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{card.label}</p>
                                                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">{card.value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className={`${adminStyles.detailCard} p-4`}>
                                        <div className="flex flex-col gap-3">
                                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ee4d2d]">Quick replies</p>
                                                <select
                                                    value={conversationForm.trang_thai}
                                                    onChange={(event) => setConversationForm({ trang_thai: event.target.value })}
                                                    className="rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none"
                                                >
                                                    <option value="moi">Mới</option>
                                                    <option value="dang_xu_ly">Đang xử lý</option>
                                                    <option value="da_phan_hoi">Đã phản hồi</option>
                                                </select>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {replyTemplates.map((template) => (
                                                    <button
                                                        key={template}
                                                        type="button"
                                                        onClick={() => setMessageForm((current) => ({ ...current, noi_dung: template }))}
                                                        className="rounded-full border border-[rgba(132,86,72,0.12)] bg-white px-4 py-2.5 text-left text-sm text-slate-700 transition hover:border-[rgba(238,77,45,0.22)] hover:bg-[rgba(255,248,244,0.96)]"
                                                    >
                                                        {template}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className={`${adminChatStyles.shell} ${isConversationFocusedView ? "flex-1" : ""}`}>
                                    <div className={adminChatStyles.header}>
                                        <div className="min-w-0">
                                            <p className="text-base font-semibold text-slate-900">{getConversationTitle(selectedConversation)}</p>
                                            <p className="mt-1 text-sm text-slate-500">{conversationParticipants}</p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                                                {getConversationContextLabel(selectedConversation)}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={handleUpdateConversationStatus}
                                                disabled={savingConversation}
                                                className={`${adminStyles.darkButton} px-4 py-2`}
                                            >
                                                {savingConversation ? "Đang cập nhật..." : "Lưu trạng thái"}
                                            </button>
                                        </div>
                                    </div>

                                    <div className={adminChatStyles.thread}>
                                        {transcriptEntries.length === 0 ? (
                                            <p className="text-sm text-slate-500">Chưa có tin nhắn trong hội thoại.</p>
                                        ) : (
                                            transcriptEntries.map((entry) => {
                                                if (entry.type === "divider") {
                                                    return (
                                                        <div key={entry.key} className={adminChatStyles.dayDividerWrap}>
                                                            <span className={adminChatStyles.dayDivider}>{entry.label}</span>
                                                        </div>
                                                    );
                                                }

                                                const { message } = entry;
                                                const enterpriseActor = isEnterpriseActor(message);

                                                return (
                                                    <div key={entry.key} className={`${adminChatStyles.bubbleRow} ${enterpriseActor ? adminChatStyles.bubbleRowAdmin : adminChatStyles.bubbleRowCustomer}`}>
                                                        <div className={`${adminChatStyles.avatar} ${enterpriseActor ? adminChatStyles.avatarAdmin : ""}`}>
                                                            {getActorInitials(message.sender?.ho_ten || "Người dùng")}
                                                        </div>
                                                        <div className={`${adminChatStyles.messageStack} ${enterpriseActor ? adminChatStyles.messageStackAdmin : ""}`}>
                                                            <div className={adminChatStyles.messageLabel}>
                                                                <span className="font-semibold text-slate-800">{message.sender?.ho_ten || "Người dùng"}</span>
                                                                <span className={`${adminChatStyles.roleTag} ${enterpriseActor ? adminChatStyles.roleTagAdmin : adminChatStyles.roleTagCustomer}`}>
                                                                    {enterpriseActor ? "Hỗ trợ" : "Khách hàng"}
                                                                </span>
                                                                <span>{formatDateTime(message.created_at)}</span>
                                                                {enterpriseActor ? (
                                                                    <span className={adminChatStyles.readState}>
                                                                        {message.da_xem ? "Đã xem" : "Đã gửi"}
                                                                    </span>
                                                                ) : null}
                                                            </div>
                                                            <div className={`${adminChatStyles.bubble} ${enterpriseActor ? adminChatStyles.bubbleAdmin : adminChatStyles.bubbleCustomer}`}>
                                                                <p className="text-sm leading-6">{message.noi_dung}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>

                                    <form onSubmit={handleSendMessage} className={adminChatStyles.composer}>
                                        <textarea
                                            value={messageForm.noi_dung}
                                            onChange={(event) =>
                                                setMessageForm((current) => ({ ...current, noi_dung: event.target.value }))
                                            }
                                            rows={5}
                                            placeholder="Nhập phản hồi gửi khách hàng"
                                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none"
                                        />

                                        <div className="flex items-center justify-between gap-3">
                                            <button
                                                type="submit"
                                                disabled={sendingMessage}
                                                className={adminStyles.darkButton}
                                            >
                                                {sendingMessage ? "Đang gửi..." : "Gửi phản hồi"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </section>
                    ) : null}
                </div>
            </div>
            ) : null}
        </div>
    );
}