import React, { useState } from "react";
import { X } from "lucide-react";

const RejectionModal = ({ isOpen, onClose, onConfirm, title = "Từ chối đăng ký", count = 1 }) => {
    const [reason, setReason] = useState("");

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!reason.trim()) {
            alert("Vui lòng nhập lý do từ chối.");
            return;
        }
        onConfirm(reason);
        setReason("");
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md overflow-hidden rounded-[24px] bg-white shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                    <button 
                        onClick={onClose}
                        className="rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {count > 1 && (
                        <div className="mb-4 rounded-xl bg-amber-50 px-4 py-2 text-xs font-medium text-amber-700 border border-amber-100">
                            Bạn đang từ chối {count} hồ sơ đã chọn. Lý do này sẽ được gửi đến tất cả các shop.
                        </div>
                    )}
                    
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Lý do từ chối <span className="text-red-500">*</span></label>
                        <textarea
                            autoFocus
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Nhập lý do chi tiết để shop có thể điều chỉnh..."
                            className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10 transition-all"
                            required
                        />
                        <p className="text-[11px] text-slate-400">Shop sẽ nhận được thông báo này kèm theo trạng thái "Từ chối".</p>
                    </div>

                    <div className="mt-6 flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] rounded-2xl bg-red-600 py-3 text-sm font-bold text-white shadow-lg shadow-red-200 hover:bg-red-700 active:scale-[0.98] transition-all"
                        >
                            Xác nhận từ chối
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RejectionModal;
