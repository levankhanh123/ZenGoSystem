export const adminStyles = {
    shell: "min-h-screen bg-[#f6f7fb] text-slate-900",
    pageStack: "flex flex-col gap-6",
    pageHero: "relative overflow-hidden rounded-[32px] border border-[rgba(132,86,72,0.1)] bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.04)] md:p-7",
    heroHeader: "flex flex-col gap-2 border-b border-slate-100 bg-white px-8 py-5 transition-all duration-300",
    heroTitle: "text-xl font-bold tracking-tight text-slate-900 md:text-2xl",
    heroBadge: "inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 shadow-sm",
    eyebrow: "text-[10px] font-bold uppercase tracking-[0.15em] text-[#ee4d2d]",
    sectionTitle: "text-lg font-bold tracking-tight text-slate-900",
    sectionCopy: "text-sm leading-relaxed text-slate-500",
    panel: "rounded-[24px] border border-[rgba(132,86,72,0.14)] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_rgba(16,24,40,0.04)]",
    tableCard: "rounded-[18px] border border-[rgba(132,86,72,0.1)] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_rgba(16,24,40,0.04)]",
    detailCard: "rounded-[16px] border border-[rgba(132,86,72,0.12)] bg-white",
    statCard: "rounded-[16px] border border-[rgba(132,86,72,0.1)] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_6px_18px_rgba(16,24,40,0.04)]",
    kpiCard: "border border-[rgba(132,86,72,0.14)] bg-gradient-to-b from-white/95 to-[rgba(255,247,243,0.9)] shadow-[0_18px_40px_rgba(82,46,29,0.07)]",
    chip: "inline-flex items-center justify-center rounded-full border border-[rgba(132,86,72,0.12)] bg-white/85 px-3 py-1.5 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[#8a5547]",
    emptyState: "rounded-[24px] border border-dashed border-[rgba(132,86,72,0.24)] bg-white/60 text-[#7e695f]",
    modalSurface: "max-h-[95vh] overflow-y-auto rounded-[32px] border border-[rgba(132,86,72,0.12)] bg-gradient-to-b from-white/[0.985] to-[rgba(255,249,246,0.96)] shadow-[0_38px_90px_rgba(35,20,14,0.22)] backdrop-blur-[14px]",
    sidebarBrand: "rounded-[18px] border border-[rgba(132,86,72,0.1)] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_rgba(16,24,40,0.04)]",
    sidebarGroup: "rounded-[18px] border border-[rgba(132,86,72,0.08)] bg-white p-3 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_6px_18px_rgba(16,24,40,0.04)]",
    actionButton: "rounded-[16px] px-4 py-3 text-sm font-bold transition hover:shadow-[0_10px_24px_rgba(82,46,29,0.08)] disabled:cursor-not-allowed disabled:opacity-60",
    primaryButton: "rounded-[16px] bg-gradient-to-r from-[#f25f39] to-[#ee4d2d] px-5 py-3 text-sm font-bold text-white shadow-[0_16px_35px_rgba(238,77,45,0.2)] transition hover:shadow-[0_10px_24px_rgba(82,46,29,0.08)] disabled:cursor-not-allowed disabled:opacity-60",
    secondaryButton: "rounded-[16px] border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 hover:shadow-[0_10px_24px_rgba(82,46,29,0.08)] disabled:cursor-not-allowed disabled:opacity-60",
    darkButton: "rounded-[16px] bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 hover:shadow-[0_10px_24px_rgba(82,46,29,0.08)] disabled:cursor-not-allowed disabled:opacity-60",
    sidebarScroll: "xl:h-screen xl:overflow-y-auto xl:overscroll-contain",
    mainScroll: "xl:h-screen xl:overflow-y-auto xl:overscroll-contain",
    input: "w-full rounded-2xl border border-slate-300 bg-white px-5 py-3.5 text-sm outline-none ring-[var(--admin-primary)] transition focus:border-[var(--admin-primary)] focus:ring-4 focus:ring-[#ee4d2d]/10 disabled:bg-slate-50 disabled:text-slate-400",
    select: "w-full appearance-none rounded-2xl border border-slate-300 bg-white px-5 py-3.5 text-sm outline-none ring-[var(--admin-primary)] transition focus:border-[var(--admin-primary)] focus:ring-4 focus:ring-[#ee4d2d]/10",
    stickyBar: "sticky top-0 z-20 mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-white/95 px-8 py-4 shadow-sm backdrop-blur-md",
    panelHeader: "flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-8 py-5",
};

export const adminChatStyles = {
    shell:
        "flex min-h-[calc(100vh-120px)] flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.06)]",

    header:
        "flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4",

    thread:
        "flex-1 overflow-y-auto bg-[#f3f5f7] px-4 py-4",

    composer:
        "border-t border-slate-200 bg-white px-4 py-3",

    composerInput:
        "min-h-[96px] w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100",

    conversationCard:
        "group w-full rounded-[16px] border p-3 text-left transition duration-200",

    conversationCardIdle:
        "border-transparent bg-white hover:bg-slate-50",

    conversationCardActive:
        "border-sky-200 bg-sky-50 shadow-sm",

    avatar:
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-700",

    avatarAdmin:
        "bg-sky-500 text-white",

    infoCard:
        "rounded-[16px] border border-slate-200 bg-white p-4",

    relatedCase:
        "mx-4 mt-3 rounded-[16px] border border-amber-200 bg-amber-50 px-4 py-3",

    dayDividerWrap:
        "flex items-center justify-center py-3",

    dayDivider:
        "rounded-full bg-white px-3 py-1 text-[11px] font-medium text-slate-500 shadow-sm border border-slate-200",

    bubbleRow:
        "mb-3 flex items-end gap-2.5",

    bubbleRowAdmin:
        "justify-end",

    bubbleRowCustomer:
        "justify-start",

    messageStack:
        "max-w-[72%] space-y-1",

    messageStackAdmin:
        "items-end",

    messageLabel:
        "flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400",

    roleTag:
        "rounded-full px-2 py-0.5 text-[10px] font-semibold",

    roleTagAdmin:
        "bg-sky-100 text-sky-700",

    roleTagCustomer:
        "bg-slate-200 text-slate-600",

    readState:
        "rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700",

    bubble:
        "rounded-[18px] px-4 py-2.5 text-sm leading-6 shadow-sm",

    bubbleAdmin:
        "rounded-br-md bg-sky-500 text-white",

    bubbleCustomer:
        "rounded-bl-md bg-white text-slate-700 border border-slate-200",
};