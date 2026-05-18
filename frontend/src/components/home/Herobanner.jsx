import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, ShoppingBag, TicketPercent } from "lucide-react";

const quickCategories = [
  "Thời trang",
  "Mỹ phẩm",
  "Đồ gia dụng",
  "Điện tử",
  "Phụ kiện",
  "Đồ học tập",
  "Mẹ & bé",
  "Sức khỏe",
];

export default function HeroBanner() {
  const navigate = useNavigate();

  return (
    <section className="bg-[#f7452f] pb-6">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 pt-4 md:grid-cols-[230px_1fr] md:px-6">
        <aside className="hidden overflow-hidden rounded-sm bg-white shadow-sm md:block">
          <div className="border-b border-slate-100 px-4 py-3 text-sm font-bold text-slate-900">
            Danh mục
          </div>
          <div className="py-1">
            {quickCategories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => navigate(`/product?q=${encodeURIComponent(item)}`)}
                className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-orange-50 hover:text-[#f7452f]"
              >
                {item}
                <ChevronRight size={14} />
              </button>
            ))}
          </div>
        </aside>

        <div className="overflow-hidden rounded-sm bg-white shadow-sm">
          <div className="relative min-h-[260px] bg-gradient-to-r from-[#fff1eb] via-[#fff7f2] to-[#ffe0d4] p-6 md:min-h-[320px] md:p-10">
            <div className="relative z-10 max-w-xl">
              <div className="mb-4 inline-flex items-center rounded-sm bg-[#f7452f] px-3 py-1 text-xs font-bold uppercase text-white">
                Sale hôm nay
              </div>
              <h1 className="max-w-lg text-3xl font-black leading-tight text-slate-950 md:text-5xl">
                Deal tốt mỗi ngày trên ZenGo
              </h1>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/product"
                  className="inline-flex items-center gap-2 rounded-sm bg-[#f7452f] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#e83f24]"
                >
                  <ShoppingBag size={17} />
                  Mua ngay
                </Link>
                <Link
                  to="/voucher"
                  className="inline-flex items-center gap-2 rounded-sm border border-[#f7452f] bg-white px-5 py-3 text-sm font-bold text-[#f7452f] transition hover:bg-orange-50"
                >
                  <TicketPercent size={17} />
                  Lấy voucher
                </Link>
              </div>
            </div>

            <div className="absolute bottom-6 right-6 hidden w-56 rounded-sm border border-orange-100 bg-white p-3 shadow-xl lg:block">
              <div className="aspect-[4/3] rounded-sm bg-gradient-to-br from-[#f7452f] to-[#ff9f43] p-4 text-white">
                <div className="text-sm font-bold">Flash Sale</div>
                <div className="mt-6 text-4xl font-black">-50%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
