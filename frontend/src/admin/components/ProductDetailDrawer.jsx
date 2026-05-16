import React, { useEffect, useState } from "react";
import { X, Package, Store, Tag, Info, List, Image as ImageIcon, Box } from "lucide-react";
import { adminStyles } from "../lib/adminStyles";
import { get } from "../lib/api";

function formatCurrency(value) {
    return `${Number(value || 0).toLocaleString("vi-VN")} đ`;
}

export default function ProductDetailDrawer({ product, open, onClose }) {
    const [fullProduct, setFullProduct] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && product?.id) {
            fetchDetail();
        } else {
            setFullProduct(null);
        }
    }, [open, product]);

    const fetchDetail = async () => {
        setLoading(true);
        try {
            const response = await get(`/api/admin/products/${product.id}`);
            setFullProduct(response.data);
        } catch (err) {
            console.error("Failed to fetch product details:", err);
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[60] overflow-hidden">
            <div 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            />
            
            <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
                <div className="w-screen max-w-2xl transform transition-transform duration-500 ease-in-out">
                    <div className="flex h-full flex-col bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-50 rounded-xl">
                                    <Package className="text-slate-400" size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">Chi tiết sản phẩm</h2>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Product ID: #{product?.id}</p>
                                </div>
                            </div>
                            <button 
                                onClick={onClose}
                                className="rounded-xl p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-8">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-64 gap-3">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ee4d2d]"></div>
                                    <p className="text-sm text-slate-400 font-medium">Đang tải thông tin...</p>
                                </div>
                            ) : fullProduct ? (
                                <div className="space-y-8">
                                    {/* Images Section */}
                                    <section>
                                        <div className="flex items-center gap-2 mb-4">
                                            <ImageIcon size={18} className="text-[#ee4d2d]" />
                                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Hình ảnh sản phẩm</h3>
                                        </div>
                                        <div className="grid grid-cols-4 gap-3">
                                            <div className="col-span-4 aspect-video rounded-2xl overflow-hidden border border-slate-100 bg-slate-50">
                                                <img 
                                                    src={fullProduct.hinh_dai_dien || "/placeholder-product.png"} 
                                                    className="w-full h-full object-contain" 
                                                    alt="Main"
                                                />
                                            </div>
                                            {(fullProduct.hinh_anh_san_pham || []).map((img, idx) => (
                                                <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
                                                    <img src={img.duong_dan} className="w-full h-full object-cover" alt={`Sub ${idx}`} />
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    {/* Basic Info */}
                                    <section className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Info size={18} className="text-[#ee4d2d]" />
                                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Thông tin cơ bản</h3>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tên sản phẩm</label>
                                                <p className="text-base font-bold text-slate-900 mt-1 leading-relaxed">{fullProduct.ten_san_pham}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mã SKU</label>
                                                    <p className="text-sm font-bold text-slate-700 mt-1">{fullProduct.sku || "N/A"}</p>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Danh mục</label>
                                                    <p className="text-sm font-bold text-[#ee4d2d] mt-1">{fullProduct.danh_muc?.ten_danh_muc}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Price & Inventory */}
                                    <section className="grid grid-cols-2 gap-4">
                                        <div className="bg-green-50/30 rounded-3xl p-6 border border-green-100">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-green-600">Giá bán hiện tại</label>
                                            <p className="text-2xl font-black text-green-700 mt-2">{formatCurrency(fullProduct.gia)}</p>
                                        </div>
                                        <div className="bg-blue-50/30 rounded-3xl p-6 border border-blue-100">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-blue-600">Số lượng tồn kho</label>
                                            <p className="text-2xl font-black text-blue-700 mt-2">{fullProduct.so_luong_ton} <span className="text-xs font-bold uppercase">cái</span></p>
                                        </div>
                                    </section>

                                    {/* Shop Info */}
                                    <section className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <Store size={18} className="text-[#ee4d2d]" />
                                                <h3 className="text-sm font-bold uppercase tracking-wider">Thông tin nhà bán hàng</h3>
                                            </div>
                                            <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Verified Seller</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center font-black text-xl">
                                                {fullProduct.cua_hang?.ten_cua_hang?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-lg font-bold">{fullProduct.cua_hang?.ten_cua_hang}</p>
                                                <p className="text-xs text-slate-400 mt-0.5">Tham gia từ: {new Date(fullProduct.cua_hang?.created_at).toLocaleDateString("vi-VN")}</p>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Description */}
                                    <section>
                                        <div className="flex items-center gap-2 mb-4">
                                            <List size={18} className="text-[#ee4d2d]" />
                                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Mô tả sản phẩm</h3>
                                        </div>
                                        <div className="prose prose-slate max-w-none text-sm text-slate-600 leading-relaxed bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                            {fullProduct.mo_ta ? (
                                                <div dangerouslySetInnerHTML={{ __html: fullProduct.mo_ta }} />
                                            ) : (
                                                <p className="italic text-slate-400">Không có mô tả chi tiết cho sản phẩm này.</p>
                                            )}
                                        </div>
                                    </section>

                                    {/* Extra Info */}
                                    {fullProduct.ghi_chu && (
                                        <section className="bg-orange-50 rounded-3xl p-6 border border-orange-100">
                                            <div className="flex items-center gap-2 mb-3">
                                                <AlertTriangle size={18} className="text-orange-600" />
                                                <h3 className="text-sm font-bold text-orange-900 uppercase tracking-wider">Ghi chú từ Admin</h3>
                                            </div>
                                            <p className="text-sm text-orange-800 font-medium">{fullProduct.ghi_chu}</p>
                                        </section>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-20 text-slate-400">Không tìm thấy thông tin sản phẩm.</div>
                            )}
                        </div>

                        <div className="sticky bottom-0 border-t border-slate-100 bg-slate-50/80 px-6 py-5 backdrop-blur-md">
                            <button
                                onClick={onClose}
                                className="w-full rounded-2xl bg-slate-900 px-6 py-4 text-sm font-black text-white hover:bg-slate-800 transition-all shadow-lg"
                            >
                                ĐÓNG CHI TIẾT
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
