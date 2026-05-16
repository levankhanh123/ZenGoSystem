import React, { useEffect, useMemo, useState, useRef } from "react";
import { get, put } from "../lib/api";
import { 
    Search, Filter, MoreVertical, ShieldAlert, ShieldCheck, 
    RefreshCcw, Eye, CheckCircle2, XCircle, Lock, Unlock, 
    ChevronRight, X, Package, Store, Tag, AlertTriangle
} from "lucide-react";
import { adminStyles } from "../lib/adminStyles";
import { useUrlFilterState } from "../lib/useUrlFilterState";
import RejectionModal from "../components/RejectionModal";
import ProductDetailDrawer from "../components/ProductDetailDrawer";

function formatCurrency(value) {
    return `${Number(value || 0).toLocaleString("vi-VN")} đ`;
}

function getProductStatusClass(status, stock) {
    if (stock === 0) return "bg-red-50 text-red-600 border-red-100";
    
    switch (status) {
        case "cho_duyet":
            return "bg-yellow-50 text-yellow-700 border-yellow-100";
        case "dang_ban":
            return "bg-green-50 text-green-700 border-green-100";
        case "bi_khoa":
        case "vi_pham":
            return "bg-red-100 text-red-700 border-red-200";
        case "tu_choi":
            return "bg-slate-100 text-slate-600 border-slate-200";
        default:
            return "bg-slate-50 text-slate-600 border-slate-100";
    }
}

function getProductStatusLabel(status, stock) {
    if (stock === 0) return "Hết hàng";
    
    switch (status) {
        case "cho_duyet":
            return "Chờ duyệt";
        case "dang_ban":
            return "Đang bán";
        case "bi_khoa":
            return "Bị khóa";
        case "vi_pham":
            return "Vi phạm";
        case "tu_choi":
            return "Từ chối";
        default:
            return status || "Chưa rõ";
    }
}

export default function Products() {
    const mounted = useRef(true);
    const [productList, setProductList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalProducts, setTotalProducts] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [globalStats, setGlobalStats] = useState({ pending: 0, active: 0, locked: 0, out_of_stock: 0 });
    
    const [filterData, setFilterData] = useState({ categories: [], shops: [] });
    const [filters, setFilters] = useUrlFilterState({
        keyword: "",
        danh_muc_id: "",
        cua_hang_id: "",
        trang_thai: "", // Tabs: all, cho_duyet, dang_ban, bi_khoa
    });

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [rejectionModal, setRejectionModal] = useState({ open: false, product: null, actionType: 'tu_choi' });
    const [error, setError] = useState(null);

    const fetchFilters = async () => {
        try {
            const response = await get("/api/admin/products/filters");
            setFilterData(response);
        } catch (err) {
            console.error("Failed to fetch filters:", err);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await get("/api/admin/products", {
                ...filters,
                page: currentPage,
                per_page: perPage,
            });

            if (mounted.current) {
                setProductList(response.data || []);
                setTotalProducts(response.total || 0);
                if (response.stats) {
                    setGlobalStats(response.stats);
                }
            }
        } catch {
            if (mounted.current) {
                setError("Không thể tải danh sách sản phẩm.");
            }
        } finally {
            if (mounted.current) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        mounted.current = true;
        fetchFilters();
        return () => {
            mounted.current = false;
        };
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [filters, currentPage]);

    const handleUpdateStatus = async (product, trang_thai, ly_do = "") => {
        try {
            await put(`/api/admin/products/${product.id}/status`, {
                trang_thai,
                ly_do
            });
            fetchProducts();
            setRejectionModal({ open: false, product: null, actionType: 'tu_choi' });
        } catch {
            setError("Không thể cập nhật trạng thái sản phẩm.");
        }
    };

    const openDrawer = (product) => {
        setSelectedProduct(product);
        setDrawerOpen(true);
    };

    return (
        <div className={adminStyles.pageStack}>
            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            <div className={adminStyles.heroHeader}>
                <div className="flex items-center justify-between">
                    <div>
                        <span className={adminStyles.eyebrow}>Quản lý vận hành</span>
                        <h1 className={adminStyles.heroTitle}>Quản lý sản phẩm</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => fetchProducts()}
                            disabled={loading}
                            className={adminStyles.secondaryButton}
                        >
                            <RefreshCcw size={16} className={loading ? "animate-spin mr-2" : "mr-2"} />
                            Làm mới
                        </button>
                        <div className="h-10 w-[1px] bg-slate-200 mx-1"></div>
                        <div className="flex flex-col items-end">
                            <span className={adminStyles.heroBadge}>SẢN PHẨM</span>
                            <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">
                                {new Date().toLocaleDateString("vi-VN")}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className={`${adminStyles.statCard} p-5`}>
                    <p className="text-sm text-slate-500">Chờ duyệt</p>
                    <h4 className="mt-2 text-3xl font-bold text-yellow-600">{globalStats.pending}</h4>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400 font-semibold">Cần xử lý ngay</p>
                </div>
                <div className={`${adminStyles.statCard} p-5`}>
                    <p className="text-sm text-slate-500">Đang bán</p>
                    <h4 className="mt-2 text-3xl font-bold text-green-600">{globalStats.active}</h4>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400 font-semibold">Hiển thị trên sàn</p>
                </div>
                <div className={`${adminStyles.statCard} p-5`}>
                    <p className="text-sm text-slate-500">Vi phạm/Khóa</p>
                    <h4 className="mt-2 text-3xl font-bold text-red-600">{globalStats.locked}</h4>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400 font-semibold">Dừng hoạt động</p>
                </div>
                <div className={`${adminStyles.statCard} p-5`}>
                    <p className="text-sm text-slate-500">Hết hàng</p>
                    <h4 className="mt-2 text-3xl font-bold text-slate-800">{globalStats.out_of_stock}</h4>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400 font-semibold">Cần nhập thêm</p>
                </div>
            </div>

            <div className={`${adminStyles.panel} rounded-[30px] p-6`}>
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ee4d2d]">Bộ lọc thông minh</p>
                            <h4 className="mt-1 text-xl font-bold text-slate-900">Tìm kiếm sản phẩm</h4>
                        </div>
                        <div className="flex bg-slate-100 p-1 rounded-2xl">
                            {['', 'cho_duyet', 'dang_ban', 'bi_khoa'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setFilters({ ...filters, trang_thai: tab })}
                                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition ${
                                        filters.trang_thai === tab 
                                            ? "bg-white text-[var(--admin-primary)] shadow-sm" 
                                            : "text-slate-500 hover:text-slate-700"
                                    }`}
                                >
                                    {tab === '' ? 'Tất cả' : tab === 'cho_duyet' ? 'Chờ duyệt' : tab === 'dang_ban' ? 'Đang bán' : 'Bị khóa'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#ee4d2d] transition-colors" size={18} />
                            <input
                                placeholder="Tên SP, SKU, Shop..."
                                value={filters.keyword}
                                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-11 pr-4 py-3.5 text-sm focus:border-[#ee4d2d] focus:bg-white focus:ring-4 focus:ring-[#ee4d2d]/5 transition-all outline-none"
                            />
                        </div>

                        <div className="relative">
                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <select
                                value={filters.danh_muc_id}
                                onChange={(e) => setFilters({ ...filters, danh_muc_id: e.target.value })}
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-11 pr-4 py-3.5 text-sm appearance-none outline-none focus:border-[#ee4d2d] focus:bg-white transition-all"
                            >
                                <option value="">Tất cả danh mục</option>
                                {filterData.categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.ten_danh_muc}</option>
                                ))}
                            </select>
                        </div>

                        <div className="relative">
                            <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <select
                                value={filters.cua_hang_id}
                                onChange={(e) => setFilters({ ...filters, cua_hang_id: e.target.value })}
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-11 pr-4 py-3.5 text-sm appearance-none outline-none focus:border-[#ee4d2d] focus:bg-white transition-all"
                            >
                                <option value="">Tất cả cửa hàng</option>
                                {filterData.shops.map(shop => (
                                    <option key={shop.id} value={shop.id}>{shop.ten_cua_hang}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={() => setFilters({ keyword: "", danh_muc_id: "", cua_hang_id: "", trang_thai: "" })}
                            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                        >
                            <RefreshCcw size={16} />
                            Đặt lại
                        </button>
                    </div>
                </div>
            </div>

            <div className={`${adminStyles.tableCard} p-0 overflow-hidden`}>
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/50">
                    <h4 className={adminStyles.sectionTitle}>Danh sách hàng hóa toàn sàn</h4>
                    <span className={adminStyles.chip}>Hiển thị: {productList.length} / Tổng: {totalProducts}</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-slate-50/80">
                                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Sản phẩm & Phân loại</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Cửa hàng (Seller)</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Kho & Giá bán</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Trạng thái</th>
                                <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Hành động</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 bg-white">
                            {productList.map((product) => (
                                <tr key={product.id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex items-start gap-4">
                                            <div className="h-16 w-16 flex-none overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                                                <img 
                                                    src={product.hinh_dai_dien || "/placeholder-product.png"} 
                                                    alt="" 
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <button 
                                                    onClick={() => openDrawer(product)}
                                                    className="text-[0.95rem] font-bold text-slate-900 hover:text-[#ee4d2d] transition-colors text-left line-clamp-1"
                                                >
                                                    {product.ten_san_pham}
                                                </button>
                                                <div className="mt-1 flex flex-col gap-0.5">
                                                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Mã: {product.sku || product.id}</span>
                                                    <span className="text-xs font-semibold text-slate-500">Danh mục: {product.danh_muc?.ten_danh_muc}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-bold text-slate-700">{product.cua_hang?.ten_cua_hang}</span>
                                            <span className="text-xs text-slate-400">ID Shop: #{product.cua_hang_id}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-bold text-slate-900">{formatCurrency(product.gia)}</span>
                                            <div className="flex items-center gap-1.5">
                                                <Package size={14} className={product.so_luong_ton === 0 ? "text-red-500" : "text-slate-400"} />
                                                <span className={`text-xs font-bold ${product.so_luong_ton === 0 ? "text-red-500" : "text-slate-600"}`}>
                                                    Kho: {product.so_luong_ton} cái
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${getProductStatusClass(product.trang_thai, product.so_luong_ton)}`}>
                                            {getProductStatusLabel(product.trang_thai, product.so_luong_ton)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openDrawer(product)}
                                                className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-xl transition-all"
                                                title="Xem chi tiết"
                                            >
                                                <Eye size={20} />
                                            </button>

                                            {product.trang_thai === 'cho_duyet' && (
                                                <>
                                                    <button
                                                        onClick={() => handleUpdateStatus(product, 'dang_ban')}
                                                        className="p-2 text-green-500 hover:bg-green-50 rounded-xl transition-all"
                                                        title="Phê duyệt"
                                                    >
                                                        <CheckCircle2 size={20} />
                                                    </button>
                                                    <button
                                                        onClick={() => setRejectionModal({ open: true, product, actionType: 'tu_choi' })}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                        title="Từ chối"
                                                    >
                                                        <XCircle size={20} />
                                                    </button>
                                                </>
                                            )}

                                            {product.trang_thai === 'dang_ban' && (
                                                <button
                                                    onClick={() => setRejectionModal({ open: true, product, actionType: 'bi_khoa' })}
                                                    className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"
                                                    title="Khóa sản phẩm"
                                                >
                                                    <Lock size={20} />
                                                </button>
                                            )}

                                            {['bi_khoa', 'vi_pham'].includes(product.trang_thai) && (
                                                <button
                                                    onClick={() => handleUpdateStatus(product, 'dang_ban')}
                                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                                                    title="Mở khóa"
                                                >
                                                    <Unlock size={20} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {!loading && productList.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                                <Search size={32} />
                                            </div>
                                            <p className="text-slate-500 font-medium">Không tìm thấy sản phẩm nào phù hợp</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-sm font-medium text-slate-500">
                        Trang <span className="text-slate-900">{currentPage}</span> / {Math.ceil(totalProducts / perPage) || 1}
                    </div>
                    <div className="flex gap-3">
                        <button
                            disabled={currentPage === 1 || loading}
                            onClick={() => setCurrentPage((prev) => prev - 1)}
                            className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 shadow-sm"
                        >
                            Trước
                        </button>
                        <button
                            disabled={currentPage * perPage >= totalProducts || loading}
                            onClick={() => setCurrentPage((prev) => prev + 1)}
                            className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 shadow-sm"
                        >
                            Sau
                        </button>
                    </div>
                </div>
            </div>

            <ProductDetailDrawer 
                product={selectedProduct}
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
            />

            <RejectionModal 
                isOpen={rejectionModal.open}
                onClose={() => setRejectionModal({ open: false, product: null, actionType: 'tu_choi' })}
                onSubmit={(reason) => handleUpdateStatus(rejectionModal.product, rejectionModal.actionType, reason)}
                title={rejectionModal.actionType === 'bi_khoa' ? "Khóa sản phẩm" : "Từ chối duyệt sản phẩm"}
                description={rejectionModal.actionType === 'bi_khoa' 
                    ? "Nhập lý do khóa sản phẩm này. Thông tin sẽ được gửi tới nhà bán hàng." 
                    : "Nhập lý do từ chối phê duyệt. Nhà bán hàng cần sửa lại sản phẩm theo yêu cầu này."}
            />
        </div>
    );
}
