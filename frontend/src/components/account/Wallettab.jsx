import { useState as _useState } from "react";
import { Wallet, ArrowDownLeft, ArrowUpRight, Lock, Plus, X, CheckCircle as _CC } from "lucide-react";
import { useWallet } from "../../hooks/useAccount.js";
 
const formatVND = (n) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n ?? 0);
const formatDate = (d) => d ? new Date(d).toLocaleString("vi-VN") : "—";
 
export default  function WalletTab() {
  const { wallet, loading } = useWallet();
  const [showTopup, setShowTopup] = _useState(false);
  const [amount,    setAmount]    = _useState("");
  const [method,    setMethod]    = _useState("vnpay");
  const [success,   setSuccess]   = _useState(false);
 
  if (loading) return <TabSkeleton rows={4} />;
  if (!wallet)  return <p className="text-gray-400 text-sm">Không tải được ví.</p>;
 
  const handleTopup = (e) => {
    e.preventDefault();
    setShowTopup(false);
    setSuccess(true);
    setAmount("");
    setTimeout(() => setSuccess(false), 2500);
  };
 
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-gray-900">Ví tiền của tôi</h2>
        <p className="text-sm text-gray-500 mt-0.5">Quản lý số dư và lịch sử giao dịch</p>
      </div>
 
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main balance */}
        <div className="md:col-span-2 bg-gradient-to-br from-[#e8175d] to-[#ff6b35]
          rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white opacity-10" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white opacity-10" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <Wallet size={20} className="text-pink-200" />
              <p className="text-pink-200 text-sm font-semibold">Số dư khả dụng</p>
            </div>
            <p className="text-4xl font-black tracking-tight mb-1">{formatVND(wallet.so_du_kha_dung)}</p>
            <p className="text-pink-200 text-xs mt-2">Cập nhật: {formatDate(wallet.updated_at)}</p>
            <button onClick={() => setShowTopup(true)}
              className="mt-5 flex items-center gap-2 bg-white text-[#e8175d] font-extrabold
                px-5 py-2.5 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5
                active:scale-95 transition-all text-sm">
              <Plus size={15} /> Nạp tiền
            </button>
          </div>
        </div>
 
        <div className="bg-white rounded-2xl p-5 border-2 border-orange-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 text-orange-600 mb-3">
            <Lock size={16} />
            <p className="text-sm font-bold">Số dư tạm giữ</p>
          </div>
          <p className="text-2xl font-black text-orange-600">{formatVND(wallet.so_du_dong_bang)}</p>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">Tiền đang giữ trong quá trình giải quyết tranh chấp</p>
        </div>
      </div>
 
      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200
          text-green-700 px-4 py-3 rounded-xl font-semibold text-sm">
          <_CC size={16} /> Nạp tiền thành công!
        </div>
      )}
 
      {/* Transactions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-extrabold text-gray-800 text-base">Lịch sử giao dịch</h3>
        </div>
        {wallet.transactions?.length === 0 ? (
          <p className="text-center text-gray-400 py-12 text-sm">Chưa có giao dịch nào.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {(wallet.transactions ?? []).map((tx) => (
              <div key={tx.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0
                  ${tx.loai === "nap" ? "bg-green-50" : "bg-red-50"}`}>
                  {tx.loai === "nap"
                    ? <ArrowDownLeft size={18} className="text-green-500" />
                    : <ArrowUpRight  size={18} className="text-red-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 line-clamp-1">{tx.mo_ta}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(tx.created_at)}</p>
                </div>
                <p className={`font-extrabold text-base shrink-0 ${tx.loai === "nap" ? "text-green-600" : "text-red-500"}`}>
                  {tx.loai === "nap" ? "+" : ""}{formatVND(Math.abs(tx.so_tien))}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
 
      {showTopup && (
        <TopupModal amount={amount} setAmount={setAmount} method={method} setMethod={setMethod}
          onSubmit={handleTopup} onClose={() => setShowTopup(false)} />
      )}
    </div>
  );
}
 
function TopupModal({ amount, setAmount, method, setMethod, onSubmit, onClose }) {
  const iCls = `w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm outline-none
    focus:border-[#e8175d] focus:ring-2 focus:ring-pink-100 transition-all`;
  const QUICK = [50000, 100000, 200000, 500000];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }} onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-extrabold text-gray-900">💰 Nạp tiền vào ví</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
            <X size={15} className="text-gray-600" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Số tiền</label>
            <input type="number" required min="10000" step="1000" value={amount}
              onChange={(e) => setAmount(e.target.value)} className={iCls} placeholder="Nhập số tiền (VNĐ)" />
            <div className="flex gap-2 mt-2 flex-wrap">
              {QUICK.map((q) => (
                <button key={q} type="button" onClick={() => setAmount(String(q))}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full border-2 transition-all
                    ${String(amount) === String(q)
                      ? "bg-[#e8175d] text-white border-[#e8175d]"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:border-pink-300"}`}>
                  {formatVND(q)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Phương thức</label>
            <div className="grid grid-cols-3 gap-2">
              {[{ id:"vnpay",label:"VNPay",emoji:"💳"},{id:"momo",label:"MoMo",emoji:"💜"},{id:"bank",label:"ATM",emoji:"🏦"}].map((m) => (
                <button key={m.id} type="button" onClick={() => setMethod(m.id)}
                  className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 text-sm font-bold transition-all
                    ${method === m.id ? "border-[#e8175d] bg-pink-50 text-[#e8175d]" : "border-gray-200 text-gray-600 hover:border-pink-200"}`}>
                  <span>{m.emoji}</span>{m.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 border-2 border-gray-200 rounded-2xl font-bold text-gray-600 hover:border-gray-300 active:scale-95 transition-all text-sm">Huỷ</button>
            <button type="submit" className="flex-1 py-3 bg-[#e8175d] hover:bg-[#c0114d] text-white font-extrabold rounded-2xl shadow active:scale-95 transition-all text-sm">Xác nhận nạp</button>
          </div>
        </form>
      </div>
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