import { useState as _us3 } from "react";
import { BellOff, CheckCheck } from "lucide-react";
import { useNotifications } from "../../hooks/useAccount.js";
 
const NOTI_ICON_MAP = {
  don_hang:   "📦",
  khuyen_mai: "🎁",
  vi_tien:    "💰",
  he_thong:   "🔔",
};
 
const NOTI_FILTERS = [
  { id:"all",        label:"Tất cả"     },
  { id:"don_hang",   label:"Đơn hàng"   },
  { id:"khuyen_mai", label:"Khuyến mãi" },
  { id:"vi_tien",    label:"Ví tiền"    },
];
 
const _fD2 = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  const now = new Date();
  const diff = (now - dt) / 1000;
  if (diff < 60)    return "Vừa xong";
  if (diff < 3600)  return `${Math.floor(diff/60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff/3600)} giờ trước`;
  return dt.toLocaleDateString("vi-VN");
};
 
export default function NotificationTab() {
  const { notis, unread, loading, type, setType, markRead, markAllRead } = useNotifications();
 
  if (loading) return <TabSkeleton rows={5} />;
 
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
            Thông báo
            {unread > 0 && (
              <span className="text-sm bg-[#e8175d] text-white font-black px-2 py-0.5 rounded-full">
                {unread} mới
              </span>
            )}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">Cập nhật về đơn hàng, ưu đãi và ví tiền</p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead}
            className="flex items-center gap-1.5 text-sm font-bold text-[#e8175d] hover:underline shrink-0">
            <CheckCheck size={15} /> Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>
 
      <div className="flex gap-2 flex-wrap">
        {NOTI_FILTERS.map((f) => (
          <button key={f.id} onClick={() => setType(f.id)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all border-2
              ${type === f.id
                ? "bg-[#e8175d] text-white border-[#e8175d] shadow"
                : "bg-white text-gray-600 border-gray-200 hover:border-[#e8175d] hover:text-[#e8175d]"}`}>
            {f.label}
          </button>
        ))}
      </div>
 
      {notis.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200
          flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
          <BellOff size={40} className="text-gray-300" />
          <p className="font-semibold">Không có thông báo nào</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
          {notis.map((noti) => {
            const icon  = NOTI_ICON_MAP[noti.loai_thong_bao] ?? "🔔";
            const isNew = !noti.da_doc;
            return (
              <div key={noti.id} onClick={() => isNew && markRead(noti.id)}
                className={`flex gap-4 px-5 py-4 transition-all duration-150 cursor-pointer
                  ${isNew ? "bg-pink-50/60 hover:bg-pink-50" : "hover:bg-gray-50"}`}>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 border
                  ${isNew ? "bg-white border-pink-200 shadow-sm" : "bg-gray-50 border-gray-100"}`}>
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <p className={`text-sm leading-tight ${isNew ? "font-extrabold text-gray-900" : "font-semibold text-gray-700"}`}>
                      {noti.tieu_de}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-gray-400">{_fD2(noti.created_at)}</span>
                      {isNew && <span className="w-2 h-2 rounded-full bg-[#e8175d]" />}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed line-clamp-2">{noti.noi_dung}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
function TabSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-5 h-24 border border-gray-100" />
      ))}
    </div>
  );
}