import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, ShoppingBag, Tag, Zap } from "lucide-react";

export default function HeroBanner() {
  const navigate = useNavigate();

  return (
    <section
      className="relative overflow-hidden w-full"
      style={{ background: "linear-gradient(135deg, #ff85a1 0%, #e8175d 55%, #b0103f 100%)", minHeight: "420px" }}
    >
      {/* ── Decorative blobs ── */}
      <div className="absolute rounded-full opacity-10" style={{ width:380, height:380, background:"#fff", top:-100, right:-80 }} />
      <div className="absolute rounded-full opacity-10" style={{ width:200, height:200, background:"#fff", bottom:-60, left:-50 }} />
      <div className="absolute rounded-full opacity-[0.07]" style={{ width:250, height:250, background:"#fff", top:"30%", left:"38%" }} />

      {/* ── Floating stars ── */}
      {[
        { s:18, t:"8%",  l:"6%",  r:20,  op:0.55 },
        { s:11, t:"65%", l:"4%",  r:-15, op:0.4  },
        { s:22, t:"15%", l:"32%", r:0,   op:0.3  },
        { s:14, t:"75%", l:"30%", r:30,  op:0.35 },
        { s:10, t:"12%", l:"55%", r:-10, op:0.4  },
        { s:16, t:"80%", l:"58%", r:15,  op:0.3  },
        { s:20, t:"20%", r:"4%",  rotate:25,  op:0.45 },
        { s:12, t:"60%", r:"8%",  rotate:-20, op:0.35 },
      ].map((st, i) => (
        <StarSVG key={i} size={st.s} top={st.t} left={st.l} right={st.r2 ?? st.r} rotate={st.r} opacity={st.op} />
      ))}

      {/* ── Main content: max-width container ── */}
      <div className="relative max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between gap-8 py-14 md:py-20">

        {/* Left column: text */}
        <div className="flex-1 max-w-xl">
          {/* Tag line */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm
                          text-white text-xs font-bold px-3 py-1.5 rounded-full mb-5 border border-white/30">
            <Zap size={12} className="fill-yellow-300 text-yellow-300" />
            Flash Sale đang diễn ra!
          </div>

          <h1 className="font-black text-white leading-tight mb-4"
              style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", textShadow: "0 3px 12px rgba(0,0,0,0.2)" }}>
            Giảm giá cực mạnh,<br />
            <span className="text-yellow-300">không mua</span> đêm về<br />
            mất ngủ!!!
          </h1>

          <p className="text-pink-100 text-base mb-8 leading-relaxed max-w-md">
            Hàng ngàn sản phẩm chất lượng, giá tốt mỗi ngày. Mua sắm ngay hôm nay
            để không bỏ lỡ ưu đãi hấp dẫn nhất! 🛍️
          </p>

          {/* CTA buttons */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => navigate("/product")}
              className="flex items-center gap-2 bg-white text-[#e8175d] font-extrabold
                         px-6 py-3 rounded-full shadow-xl hover:shadow-2xl
                         hover:-translate-y-0.5 active:scale-95 transition-all duration-200 text-sm"
            >
              <ShoppingBag size={16} />
              Mua ngay
              <ArrowRight size={14} />
            </button>
            <button
              onClick={() => navigate("/voucher")}
              className="flex items-center gap-2 bg-transparent border-2 border-white/60
                         text-white font-bold px-6 py-3 rounded-full
                         hover:bg-white/15 active:scale-95 transition-all duration-200 text-sm"
            >
              <Tag size={14} />
              Lấy voucher
            </button>
          </div>

          {/* Stats row */}
          <div className="flex gap-8 mt-10">
            {[
              { value: "10K+", label: "Sản phẩm" },
              { value: "500+", label: "Cửa hàng" },
              { value: "50K+", label: "Khách hàng" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-white font-black text-xl leading-none">{value}</p>
                <p className="text-pink-200 text-xs mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: BIG SALE visual */}
        <div className="hidden md:flex shrink-0 flex-col items-center justify-center gap-4">
          <BigSaleCard />
        </div>
      </div>
    </section>
  );
}

function BigSaleCard() {
  return (
    <div className="relative">
      {/* Main card */}
      <div
        className="relative rounded-3xl flex flex-col items-center justify-center p-8 gap-3"
        style={{
          width: 280, height: 300,
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(16px)",
          border: "2px solid rgba(255,255,255,0.35)",
          boxShadow: "0 24px 48px rgba(0,0,0,0.2)",
        }}
      >
        <span style={{ fontSize: "5rem", lineHeight: 1 }}>🛍️</span>

        <div className="text-center">
          <p className="text-white font-black text-3xl tracking-tight leading-none">BIG</p>
          <p className="text-yellow-300 font-black text-4xl tracking-tight leading-none">SALE</p>
        </div>

        {/* SPECIAL OFFER badge */}
        <div className="bg-yellow-400 text-gray-900 font-black text-xs px-4 py-1.5
                        rounded-full tracking-widest shadow-lg">
          SPECIAL OFFER
        </div>

        {/* Discount badge */}
        <div
          className="absolute -top-4 -right-4 w-16 h-16 bg-white rounded-full
                     flex flex-col items-center justify-center shadow-xl border-4 border-[#e8175d]"
        >
          <p className="text-[#e8175d] font-black text-xs leading-none">ĐẾN</p>
          <p className="text-[#e8175d] font-black text-lg leading-none">70%</p>
        </div>
      </div>

      {/* Sparkle decorations */}
      <div className="absolute -top-6 -left-6">
        <Sparkles size={28} className="text-yellow-300 fill-yellow-300" />
      </div>
      <div className="absolute -bottom-4 -right-5">
        <Sparkles size={20} className="text-white fill-white opacity-70" />
      </div>
      <div className="absolute top-10 -left-8">
        <Sparkles size={16} className="text-pink-200 fill-pink-200 opacity-80" />
      </div>
    </div>
  );
}

function StarSVG({ size, top, left, right, rotate, opacity }) {
  return (
    <div className="absolute pointer-events-none" style={{ top, left, right, opacity, transform: `rotate(${rotate}deg)` }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
      </svg>
    </div>
  );
}