import { useNavigate } from "react-router-dom";
import { Tag, Truck, ArrowRight } from "lucide-react";

export default function VoucherTeaser() {
  const navigate = useNavigate();

  return (
    <section className="w-full py-12" style={{ background: "linear-gradient(180deg,#fdf5f0 0%,#fce4ec 100%)" }}>
      <div className="max-w-7xl mx-auto px-6">

        {/* ── Banner strip ── */}
        <div className="relative overflow-hidden rounded-2xl mb-8"
             style={{ background: "linear-gradient(90deg,#ff6b35 0%,#e8175d 50%,#c0114d 100%)", padding: "20px 32px" }}>
          {/* Blob decorations */}
          <div className="absolute w-32 h-32 rounded-full bg-white opacity-10 -top-8 -left-8" />
          <div className="absolute w-20 h-20 rounded-full bg-white opacity-10 -bottom-6 right-20" />
          <div className="absolute w-16 h-16 rounded-full bg-white opacity-[0.08] top-2 right-60" />

          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🏷️</span>
              <div>
                <h2 className="text-white font-extrabold text-xl leading-tight">
                  Săn ngay voucher săn hàng khuyến mãi cực số!!
                </h2>
                <p className="text-pink-200 text-sm mt-0.5">
                  Hàng trăm voucher freeship & giảm giá đang chờ bạn
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/voucher")}
              className="shrink-0 flex items-center gap-2 bg-white text-[#e8175d]
                         font-extrabold px-6 py-3 rounded-full shadow-xl
                         hover:shadow-2xl hover:-translate-y-0.5 active:scale-95
                         transition-all duration-200 text-sm whitespace-nowrap">
              Xem tất cả
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* ── Subtitle ── */}
        <p className="text-center text-base font-extrabold text-[#2d1b1b] mb-6">
          ✨ Khác nhau không??? ✨
        </p>

        {/* ── Voucher grid: 4 cols desktop ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {SAMPLE_VOUCHERS.map((v) => <VoucherCard key={v.id} voucher={v} />)}
        </div>
      </div>
    </section>
  );
}

function VoucherCard({ voucher }) {
  return (
    <div className="flex rounded-2xl overflow-hidden shadow-sm border border-orange-100
                    bg-white hover:shadow-md hover:-translate-y-0.5
                    transition-all duration-200 cursor-pointer group"
         style={{ minHeight: 72 }}>
      {/* Colored strip */}
      <div className="w-16 shrink-0 flex flex-col items-center justify-center gap-1"
           style={{
             background: voucher.type === "freeship"
               ? "linear-gradient(180deg,#22c55e,#15803d)"
               : "linear-gradient(180deg,#ff6b35,#e8175d)"
           }}>
        {voucher.type === "freeship"
          ? <Truck size={20} className="text-white" />
          : <Tag  size={20} className="text-white" />}
        <span className="text-white text-[9px] font-bold text-center leading-tight px-1">
          {voucher.type === "freeship" ? "FREE\nSHIP" : "SALE"}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 px-3 py-2.5 flex flex-col justify-center">
        <p className="text-sm font-extrabold text-gray-800 leading-tight">{voucher.title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{voucher.sub}</p>
        <p className="text-xs text-gray-400">HSD: {voucher.expiry}</p>
      </div>

      {/* Save btn */}
      <div className="flex items-center pr-3">
        <button className="text-xs font-bold text-[#e8175d] border-2 border-[#e8175d]
                           rounded-lg px-2.5 py-1 hover:bg-[#e8175d] hover:text-white
                           active:scale-95 transition-all whitespace-nowrap">
          Lưu
        </button>
      </div>
    </div>
  );
}

const SAMPLE_VOUCHERS = [
  { id:"v1", type:"freeship", title:"Miễn phí vận chuyển", sub:"Đơn tối thiểu 99K",  expiry:"31/12" },
  { id:"v2", type:"freeship", title:"Freeship toàn quốc",  sub:"Không giới hạn đơn", expiry:"30/11" },
  { id:"v3", type:"freeship", title:"Freeship Extra",       sub:"Đơn tối thiểu 149K", expiry:"15/12" },
  { id:"v4", type:"freeship", title:"Miễn phí ship 30K",   sub:"Áp dụng nội thành",  expiry:"20/12" },
  { id:"v5", type:"sale",     title:"Giảm 30K",             sub:"Đơn tối thiểu 200K", expiry:"31/12" },
  { id:"v6", type:"sale",     title:"Giảm 50K",             sub:"Đơn tối thiểu 350K", expiry:"25/12" },
  { id:"v7", type:"sale",     title:"Giảm 10%",             sub:"Thời trang nữ",       expiry:"28/12" },
  { id:"v8", type:"sale",     title:"Giảm 15%",             sub:"Thiết bị điện tử",   expiry:"31/12" },
];