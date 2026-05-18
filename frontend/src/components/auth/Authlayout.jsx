import { Link } from "react-router-dom";
import { ShieldCheck, ShoppingBag, TicketPercent, WalletCards } from "lucide-react";

const features = [
  { icon: <TicketPercent size={16} />, label: "Voucher" },
  { icon: <ShieldCheck size={16} />, label: "Shop uy tín" },
  { icon: <WalletCards size={16} />, label: "ZaloPay" },
];

export default function AuthLayout({ children, title, subtitle, switchText, switchLink, switchLabel }) {
  return (
    <div className="min-h-screen bg-[#fff7f5]" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[1.05fr_0.95fr]">
        <section
          className="relative hidden overflow-hidden px-10 py-8 text-white lg:flex lg:flex-col"
          style={{ background: "linear-gradient(145deg, #c0114d 0%, #e8175d 52%, #ff5b3d 100%)" }}
        >
          <Blob className="right-[-110px] top-[-90px] h-72 w-72 opacity-15" />
          <Blob className="bottom-[-70px] left-[-70px] h-52 w-52 opacity-15" />
          <Blob className="left-[34%] top-[38%] h-28 w-28 opacity-10" />

          <Link to="/" className="relative z-10 text-4xl font-black tracking-tight">
            zenGo
          </Link>

          <div className="relative z-10 flex flex-1 flex-col justify-center">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-2 text-sm font-bold backdrop-blur">
              <ShoppingBag size={17} />
              ZenGo Mall
            </div>
            <h1 className="max-w-lg text-5xl font-black leading-tight">
              Mua nhanh,
              <br />
              <span className="text-yellow-300">giá tốt.</span>
            </h1>
            <div className="mt-8 flex flex-wrap gap-2">
              {features.map((item) => (
                <span
                  key={item.label}
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-2 text-xs font-bold backdrop-blur"
                >
                  {item.icon}
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-8 lg:px-12">
          <div className="w-full max-w-[430px] rounded-3xl border border-pink-100 bg-white/95 p-7 shadow-[0_24px_70px_rgba(192,17,77,0.12)] md:p-8">
            <div className="mb-7 flex items-start justify-between gap-4">
              <div>
                <Link to="/" className="mb-5 block text-3xl font-black tracking-tight text-[#e8175d] lg:hidden">
                  zenGo
                </Link>
                <h2 className="text-2xl font-black text-slate-950">{title}</h2>
                {subtitle && <p className="mt-1.5 text-sm font-medium text-slate-500">{subtitle}</p>}
              </div>
              <Link to="/" className="hidden text-xs font-bold text-[#e8175d] hover:underline lg:block">
                Trang chủ
              </Link>
            </div>

            {children}

            {switchText && (
              <p className="mt-6 text-center text-sm text-slate-500">
                {switchText}{" "}
                <Link to={switchLink} className="font-black text-[#e8175d] hover:underline">
                  {switchLabel}
                </Link>
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Blob({ className }) {
  return <div className={`absolute rounded-full bg-white pointer-events-none ${className}`} />;
}
