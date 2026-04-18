import { useEffect, useMemo, useState } from "react";

function loadSavedViews(storageKey) {
    if (typeof window === "undefined") {
        return [];
    }

    try {
        const raw = window.localStorage.getItem(storageKey);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function useSavedFilterViews(storageKey, currentFilters, applyFilters) {
    const [views, setViews] = useState(() => loadSavedViews(storageKey));
    const [draftName, setDraftName] = useState("");

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        window.localStorage.setItem(storageKey, JSON.stringify(views));
    }, [storageKey, views]);

    const hasViews = useMemo(() => views.length > 0, [views]);

    function saveCurrentView() {
        const name = draftName.trim();

        if (!name) {
            return false;
        }

        const nextView = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            name,
            filters: currentFilters,
        };

        setViews((current) => [nextView, ...current].slice(0, 8));
        setDraftName("");
        return true;
    }

    function applyView(view) {
        applyFilters(view.filters);
    }

    function deleteView(viewId) {
        setViews((current) => current.filter((view) => view.id !== viewId));
    }

    return {
        views,
        hasViews,
        draftName,
        setDraftName,
        saveCurrentView,
        applyView,
        deleteView,
    };
}