export default function WelcomeSection() {
  return (
    <section className="relative overflow-hidden w-full">
      <WaveTop />
      <div
        className="relative w-full py-10 px-6"
        style={{ background: "linear-gradient(180deg,#fce4ec 0%,#fdf5f0 100%)" }}
      >
        {/* Clouds */}
        <Cloud className="absolute top-2 left-4"  width={120} opacity={0.5} />
        <Cloud className="absolute top-4 left-48" width={90}  opacity={0.4} />
        <Cloud className="absolute top-1 right-6" width={110} opacity={0.45} />
        <Cloud className="absolute top-5 right-52" width={80} opacity={0.35} />
        <Cloud className="absolute bottom-2 left-24" width={70} opacity={0.3} />
        <Cloud className="absolute bottom-1 right-36" width={100} opacity={0.35} />

        <div className="relative max-w-3xl mx-auto text-center z-10">
          <h2 className="text-xl md:text-2xl font-extrabold text-[#e8175d] mb-3">
            ZenGo Mall
          </h2>
          <p className="text-sm md:text-base text-[#7a4040] leading-relaxed">
            Sản phẩm nổi bật, voucher tốt và shop uy tín.
          </p>
        </div>
      </div>
      <WaveBottom />
    </section>
  );
}

function WaveTop() {
  return (
    <div className="h-8 w-full overflow-hidden" style={{ background: "#b0103f" }}>
      <svg viewBox="0 0 1440 32" preserveAspectRatio="none" className="w-full h-full">
        <path d="M0,0 C240,32 480,0 720,16 C960,32 1200,0 1440,16 L1440,32 L0,32 Z" fill="#fce4ec" />
      </svg>
    </div>
  );
}
function WaveBottom() {
  return (
    <div className="h-8 w-full overflow-hidden" style={{ background: "#fdf5f0" }}>
      <svg viewBox="0 0 1440 32" preserveAspectRatio="none" className="w-full h-full">
        <path d="M0,16 C240,0 480,32 720,16 C960,0 1200,32 1440,16 L1440,0 L0,0 Z" fill="#fce4ec" />
      </svg>
    </div>
  );
}
function Cloud({ className, width, opacity }) {
  return (
    <div className={`pointer-events-none ${className}`} style={{ width, opacity }}>
      <svg viewBox="0 0 120 48" fill="white">
        <ellipse cx="60" cy="38" rx="55" ry="12" />
        <ellipse cx="36" cy="28" rx="26" ry="18" />
        <ellipse cx="72" cy="24" rx="32" ry="20" />
        <ellipse cx="95" cy="33" rx="22" ry="14" />
      </svg>
    </div>
  );
}
