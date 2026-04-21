import { Link } from "react-router-dom";

/**
 * AuthLayout
 * Standalone layout (không có Header/Footer).
 * Split screen: left = branding panel, right = form.
 *
 * Props:
 *  - children    : ReactNode (form content)
 *  - title       : string
 *  - subtitle    : string
 *  - switchText  : string
 *  - switchLink  : string  (href)
 *  - switchLabel : string  (link text)
 */
export default function AuthLayout({ children, title, subtitle, switchText, switchLink, switchLabel }) {
  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Nunito', sans-serif" }}>

      {/* ── Left: Branding panel ── */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #c0114d 0%, #e8175d 45%, #ff6b35 100%)" }}
      >
        {/* Decorative blobs */}
        <Blob style={{ width:320, height:320, top:-80, right:-80, opacity:0.15 }} />
        <Blob style={{ width:200, height:200, bottom:60, left:-60, opacity:0.12 }} />
        <Blob style={{ width:150, height:150, top:"40%", left:"30%", opacity:0.08 }} />

        {/* Stars */}
        {[
          { s:18, t:"12%", l:"8%",  r:20  },
          { s:12, t:"65%", l:"5%",  r:-10 },
          { s:22, t:"25%", l:"55%", r:0   },
          { s:14, t:"80%", l:"60%", r:30  },
          { s:10, t:"45%", l:"80%", r:-5  },
        ].map((st, i) => (
          <StarSVG key={i} size={st.s} top={st.t} left={st.l} rotate={st.r} />
        ))}

        {/* Logo */}
        <div className="relative z-10">
          <Link to="/" className="inline-block">
            <span
              className="font-black text-white tracking-tight"
              style={{ fontSize: "2.2rem", letterSpacing: "-0.03em" }}
            >
              zen<span className="italic">G</span>o
            </span>
          </Link>
          <p className="text-pink-200 text-sm mt-1 font-medium">
            Sàn thương mại điện tử hàng đầu
          </p>
        </div>

        {/* Main copy */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <h2 className="text-4xl font-black text-white leading-tight mb-5">
            Mua sắm thông minh,<br />
            <span className="text-yellow-300">tiết kiệm tối đa.</span>
          </h2>
          <p className="text-pink-100 text-base leading-relaxed max-w-sm mb-8">
            Khám phá hàng ngàn sản phẩm chất lượng với giá tốt nhất. Giao hàng nhanh, đổi trả dễ dàng.
          </p>

          {/* Stats */}
          <div className="flex gap-8">
            {[
              { value:"50+", label:"Sản phẩm"   },
              { value:"10+", label:"Cửa hàng"   },
              { value:"500+", label:"Khách hàng" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-black text-white">{value}</p>
                <p className="text-pink-300 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Feature pills */}
        <div className="relative z-10 flex flex-wrap gap-2">
          {["🚚 Freeship","🏷️ Voucher hấp dẫn","🔒 Thanh toán an toàn","⭐ Đánh giá thực"].map(f => (
            <span key={f}
                  className="bg-white/15 backdrop-blur-sm border border-white/25
                             text-white text-xs font-bold px-3 py-1.5 rounded-full">
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* ── Right: Form panel ── */}
      <div className="flex-1 flex flex-col justify-center items-center
                      px-6 py-12 bg-[#fdf5f0] overflow-y-auto">

        {/* Mobile logo */}
        <div className="lg:hidden mb-8 text-center">
          <Link to="/">
            <span className="font-black text-[#e8175d] tracking-tight"
                  style={{ fontSize:"2rem", letterSpacing:"-0.03em" }}>
              zen<span className="italic">G</span>o
            </span>
          </Link>
        </div>

        {/* Form card */}
        <div className="w-full max-w-md">
          {/* Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-black text-gray-900">{title}</h1>
            {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
          </div>

          {/* Slot for form */}
          {children}

          {/* Switch link */}
          {switchText && (
            <p className="text-center text-sm text-gray-500 mt-6">
              {switchText}{" "}
              <Link to={switchLink}
                    className="text-[#e8175d] font-extrabold hover:underline transition-colors">
                {switchLabel}
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Decorative helpers ─────────────────────────────────── */
function Blob({ style }) {
  return (
    <div className="absolute rounded-full bg-white pointer-events-none" style={style} />
  );
}
function StarSVG({ size, top, left, rotate }) {
  return (
    <div className="absolute pointer-events-none opacity-50"
         style={{ top, left, transform:`rotate(${rotate}deg)` }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
      </svg>
    </div>
  );
}