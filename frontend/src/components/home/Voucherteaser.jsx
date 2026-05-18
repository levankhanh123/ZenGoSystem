import { Link } from "react-router-dom";
import { ChevronRight, TicketPercent, Truck } from "lucide-react";

const vouchers = [
  { id: "v1", type: "ship", title: "Freeship 30K" },
  { id: "v2", type: "sale", title: "Giảm 50K" },
  { id: "v3", type: "sale", title: "Giảm 10%" },
  { id: "v4", type: "ship", title: "Freeship Extra" },
];

export default function VoucherTeaser() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-5 md:px-6">
      <div className="rounded-sm bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <TicketPercent size={20} className="text-[#f7452f]" />
            <h2 className="text-base font-black text-slate-900">Voucher hôm nay</h2>
          </div>
          <Link to="/voucher" className="inline-flex items-center gap-1 text-sm font-semibold text-[#f7452f]">
            Xem tất cả <ChevronRight size={15} />
          </Link>
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          {vouchers.map((voucher) => (
            <div key={voucher.id} className="flex overflow-hidden rounded-sm border border-orange-100 bg-[#fff7f3]">
              <div className="flex w-16 items-center justify-center bg-[#f7452f] text-white">
                {voucher.type === "ship" ? <Truck size={22} /> : <TicketPercent size={22} />}
              </div>
              <div className="min-w-0 flex-1 px-3 py-2.5">
                <p className="truncate text-sm font-black text-slate-900">{voucher.title}</p>
              </div>
              <div className="flex items-center pr-3">
                <Link to="/voucher" className="rounded-sm border border-[#f7452f] px-2.5 py-1 text-xs font-bold text-[#f7452f]">
                  Lưu
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
