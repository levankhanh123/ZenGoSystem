import React from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
    adminNavigationGroups,
    findActiveModule,
    findActiveNavigationItem,
} from "../lib/adminNavigation";
import { adminStyles } from "../lib/adminStyles";

export default function AdminLayout() {
    const location = useLocation();
    const currentModule = findActiveModule(location.pathname);
    const currentSection = findActiveNavigationItem(location.pathname);
    const isModuleLandingPage =
        Boolean(currentModule.children?.length) && location.pathname === currentModule.to;

    const navClass = ({ isActive }) =>
        `group block rounded-[14px] border px-4 py-3 transition ${
            isActive
                ? "border-[rgba(238,77,45,0.22)] bg-[rgba(255,247,244,0.98)] text-[var(--admin-primary-strong)]"
                : "border-[rgba(132,86,72,0.08)] bg-white text-slate-700 hover:border-[rgba(132,86,72,0.16)] hover:bg-[rgba(255,249,247,0.92)]"
        }`;

    return (
        <div className={adminStyles.shell}>
            <div className="relative z-10 flex min-h-screen flex-col xl:h-screen xl:flex-row xl:overflow-hidden">
                <aside className={`xl:w-[300px] xl:flex-none ${adminStyles.sidebarScroll}`}>
                    <div className="flex h-full flex-col gap-4 border-b border-white/35 px-4 py-4 md:px-6 xl:min-h-full xl:border-b-0 xl:border-r xl:border-r-white/45 xl:px-4 xl:py-5">
                        <div className={adminStyles.sidebarBrand}>
                            <div className="flex items-center justify-between gap-3">
                                <span className="rounded-full border border-[rgba(238,77,45,0.14)] bg-[rgba(238,77,45,0.06)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--admin-primary)]">
                                    Zengo Ops
                                </span>
                            </div>
                            <h1 className="mt-4 text-[1.7rem] font-extrabold tracking-tight text-slate-900">
                                Zengo Admin
                            </h1>
                        </div>

                        <nav className="space-y-4">
                            {adminNavigationGroups.map((group) => (
                                <div key={group.title} className={adminStyles.sidebarGroup}>
                                    <div className="mb-3 flex items-center justify-between px-2">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                                            {group.title}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        {group.modules.map((item) => {
                                            const isExpanded = location.pathname.startsWith(item.basePath || item.to);

                                            return (
                                            <div key={item.key} className="space-y-2">
                                            <NavLink to={item.to} className={navClass}>
                                                {({ isActive }) => (
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`flex h-9 w-9 flex-none items-center justify-center rounded-[12px] text-[11px] font-bold tracking-[0.14em] ${
                                                                isActive
                                                                    ? "bg-[var(--admin-primary)] text-white"
                                                                    : "bg-[rgba(238,77,45,0.06)] text-[var(--admin-primary)]"
                                                            }`}
                                                        >
                                                            {item.tag}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center justify-between gap-3">
                                                                <p className="text-[0.95rem] font-semibold leading-5 text-slate-800">
                                                                    {item.label}
                                                                </p>
                                                                <span className={`text-xs ${isActive ? "text-[var(--admin-primary)]" : "text-slate-300"}`}>
                                                                    {isActive ? "●" : "○"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </NavLink>

                                            {item.children?.length && isExpanded ? (
                                                <div className="ml-4 space-y-1 border-l border-[rgba(132,86,72,0.08)] pl-4">
                                                    {item.children.map((child) => (
                                                        <NavLink
                                                            key={child.key}
                                                            to={child.to}
                                                            className={({ isActive }) =>
                                                                `block rounded-[12px] px-3 py-2 text-sm transition ${
                                                                    isActive
                                                                        ? "bg-[rgba(238,77,45,0.08)] font-semibold text-[var(--admin-primary-strong)]"
                                                                        : "text-slate-500 hover:bg-white hover:text-slate-800"
                                                                }`
                                                            }
                                                        >
                                                            {child.label}
                                                        </NavLink>
                                                    ))}
                                                </div>
                                            ) : null}
                                            </div>
                                        );})}
                                    </div>
                                </div>
                            ))}
                        </nav>
                    </div>
                </aside>

                <div className={`min-w-0 flex-1 px-4 pb-6 md:px-6 xl:px-8 xl:pb-8 ${adminStyles.mainScroll}`}>
                    {isModuleLandingPage ? null : (
                        <header className={`${adminStyles.panel} sticky top-3 z-20 mt-4 rounded-[18px] px-5 py-4 md:px-6 md:py-4 xl:mt-5`}>
                            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--admin-primary)]">
                                        Trung tâm vận hành
                                    </p>
                                    <h2 className="mt-1 text-[1.7rem] font-extrabold tracking-tight text-slate-900 md:text-[1.85rem]">
                                        {currentSection.headerLabel || currentSection.label}
                                    </h2>
                                </div>

                                <div className="flex flex-wrap gap-3 text-sm">
                                    <div className="rounded-full border border-[rgba(132,86,72,0.12)] bg-white/80 px-4 py-2 font-medium text-slate-700">
                                        {currentModule.label}
                                    </div>
                                    <div className="rounded-full border border-[rgba(132,86,72,0.12)] bg-white/80 px-4 py-2 font-medium text-slate-700">
                                        {new Date().toLocaleDateString("vi-VN")}
                                    </div>
                                </div>
                            </div>
                        </header>
                    )}

                    <main className={`relative z-10 mx-auto max-w-[1640px] ${isModuleLandingPage ? "mt-0" : "mt-4"}`}>
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
}