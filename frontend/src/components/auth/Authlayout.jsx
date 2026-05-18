import { Link } from "react-router-dom";

export default function AuthLayout({ children, title, subtitle, switchText, switchLink, switchLabel }) {
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <Link to="/" className="text-3xl font-black text-[#f7452f]">
            ZenGo
          </Link>
          <Link to="/" className="text-sm font-semibold text-slate-600 transition hover:text-[#f7452f]">
            Trang chủ
          </Link>
        </div>
      </header>

      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#f7452f] px-4 py-10">
        <section className="w-full max-w-md rounded-sm bg-white p-6 shadow-xl md:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-black text-slate-950">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          </div>
          {children}
          {switchText && (
            <p className="mt-5 text-center text-sm text-slate-500">
              {switchText}{" "}
              <Link to={switchLink} className="font-bold text-[#f7452f] hover:underline">
                {switchLabel}
              </Link>
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
