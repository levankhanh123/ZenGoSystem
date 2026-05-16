import React from "react";
import { adminStyles } from "../lib/adminStyles";

export default function SavedFilterViews({
    title = "Preset views",
    description = "Lưu bộ lọc đang dùng để mở lại nhanh trong các ca trực sau.",
    draftName,
    setDraftName,
    onSave,
    views,
    onApply,
    onDelete,
}) {
    return (
        <div className="rounded-[24px] border border-[rgba(132,86,72,0.12)] bg-white/75 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ee4d2d]">
                        {title}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">{description}</p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                        value={draftName}
                        onChange={(event) => setDraftName(event.target.value)}
                        placeholder="Ví dụ: Queue sáng, Shop chờ duyệt"
                        className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
                    />
                    <button
                        type="button"
                        onClick={onSave}
                        className={adminStyles.darkButton}
                    >
                        Lưu preset
                    </button>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                {views.length === 0 ? (
                    <span className="text-sm text-slate-500">Chưa có preset nào được lưu.</span>
                ) : (
                    views.map((view) => (
                        <div key={view.id} className="flex items-center gap-2 rounded-full border border-[rgba(132,86,72,0.12)] bg-white px-3 py-2">
                            <button
                                type="button"
                                onClick={() => onApply(view)}
                                className="text-sm font-medium text-slate-700 hover:text-[#ee4d2d]"
                            >
                                {view.name}
                            </button>
                            <button
                                type="button"
                                onClick={() => onDelete(view.id)}
                                className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 hover:text-red-600"
                            >
                                Xóa
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}