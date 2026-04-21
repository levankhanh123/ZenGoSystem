import {
  User, MapPin, Wallet, ShoppingBag,
  Bell, ChevronRight, LogOut
} from "lucide-react";

export const ACCOUNT_TABS = [
  { id: "profile",       label: "Thông tin cá nhân",  icon: User       },
  { id: "address",       label: "Địa chỉ giao hàng",  icon: MapPin     },
  { id: "wallet",        label: "Ví tiền của tôi",     icon: Wallet     },
  { id: "orders",        label: "Đơn hàng của tôi",   icon: ShoppingBag},
  { id: "notifications", label: "Thông báo",           icon: Bell       },
];

/**
 * AccountSidebar
 * Props:
 *  - user       : nguoi_dung object
 *  - activeTab  : string
 *  - onChange   : (tabId) => void
 *  - unreadNoti : number
 */
export default function AccountSidebar({ user, activeTab, onChange, unreadNoti = 0 }) {
  const initials = user.ho_ten
    .split(" ")
    .slice(-2)
    .map((w) => w[0].toUpperCase())
    .join("");

  return (
    <aside className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

      {/* ── Avatar + name block ── */}
      <div className="bg-gradient-to-br from-[#e8175d] to-[#ff6b35] p-6 text-center">
        <div className="mx-auto w-20 h-20 rounded-full border-4 border-white shadow-lg
                        flex items-center justify-center overflow-hidden mb-3"
             style={{ background: "#fce4ec" }}>
          {user.anh_dai_dien
            ? <img src={user.anh_dai_dien} alt={user.ho_ten} className="w-full h-full object-cover" />
            : <span className="text-2xl font-extrabold text-[#e8175d]">{initials}</span>
          }
        </div>
        <p className="text-white font-extrabold text-base leading-tight">{user.ho_ten}</p>
        <p className="text-pink-200 text-xs mt-0.5">{user.email}</p>
        <span className="inline-block mt-2 bg-white/20 text-white text-[10px]
                         font-bold px-2.5 py-0.5 rounded-full">
          Người mua
        </span>
      </div>

      {/* ── Nav links ── */}
      <nav className="py-2">
        {ACCOUNT_TABS.map((tab) => {
          const Icon   = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm font-semibold
                          transition-all duration-150 group
                          ${active
                            ? "bg-pink-50 text-[#e8175d] border-r-4 border-[#e8175d]"
                            : "text-gray-600 hover:bg-gray-50 hover:text-[#e8175d]"
                          }`}
            >
              <Icon
                size={17}
                className={active ? "text-[#e8175d]" : "text-gray-400 group-hover:text-[#e8175d]"}
              />
              <span className="flex-1 text-left">{tab.label}</span>

              {/* Badge for notifications */}
              {tab.id === "notifications" && unreadNoti > 0 && (
                <span className="min-w-[20px] h-5 bg-[#e8175d] text-white text-[10px]
                                 font-black rounded-full flex items-center justify-center px-1">
                  {unreadNoti}
                </span>
              )}

              <ChevronRight
                size={14}
                className={`shrink-0 transition-transform
                            ${active ? "text-[#e8175d]" : "text-gray-300 group-hover:text-pink-300"}`}
              />
            </button>
          );
        })}
      </nav>

      
    </aside>
  );
}
