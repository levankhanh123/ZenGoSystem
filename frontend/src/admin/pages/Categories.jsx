import React, { useEffect, useState, useRef } from "react";
import { 
    ChevronRight, ChevronDown, Plus, Pencil, Eye, EyeOff, 
    Trash2, RefreshCcw, FolderTree, Info, MoreVertical, X,
    LayoutGrid, ListTree, Layers
} from "lucide-react";
import { adminStyles } from "../lib/adminStyles";
import { get, post, put, del } from "../lib/api";
import CategoryFormDrawer from "../components/CategoryFormDrawer";

const CategoryNode = ({ category, level = 0, onAddChild, onEdit, onToggleStatus, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(level < 1); // Expand first level by default
    const hasChildren = category.children_recursive && category.children_recursive.length > 0;

    return (
        <div className="flex flex-col">
            <div className={`
                group flex items-center justify-between py-3 px-4 rounded-2xl transition-all
                ${level === 0 ? "bg-white border border-slate-100 mb-2 shadow-sm" : "hover:bg-slate-50"}
                ${!category.trang_thai ? "opacity-60" : ""}
            `}>
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex items-center justify-center w-6 h-6">
                        {hasChildren ? (
                            <button 
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-400 group-hover:text-[#ee4d2d]"
                            >
                                {isExpanded ? <ChevronDown size={14} strokeWidth={3} /> : <ChevronRight size={14} strokeWidth={3} />}
                            </button>
                        ) : (
                            <div className="w-1 h-1 rounded-full bg-slate-300 ml-2" />
                        )}
                    </div>

                    <div className="flex items-center gap-3 truncate">
                        {category.hinh_anh && (
                            <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-100 flex-none bg-white">
                                <img src={category.hinh_anh} alt="" className="w-full h-full object-cover" />
                            </div>
                        )}
                        <span className={`text-sm font-bold truncate ${level === 0 ? "text-slate-900" : "text-slate-700"}`}>
                            {category.ten_danh_muc}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                            ID: #{category.id}
                        </span>
                        {!category.trang_thai && (
                            <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                Đang ẩn
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {level < 2 && (
                        <button 
                            onClick={() => onAddChild(category)}
                            className="p-2 text-slate-400 hover:text-[#ee4d2d] hover:bg-white rounded-xl transition-all"
                            title="Thêm danh mục con"
                        >
                            <Plus size={16} strokeWidth={2.5} />
                        </button>
                    )}
                    <button 
                        onClick={() => onEdit(category)}
                        className="p-2 text-slate-400 hover:text-blue-500 hover:bg-white rounded-xl transition-all"
                        title="Sửa"
                    >
                        <Pencil size={16} strokeWidth={2.5} />
                    </button>
                    <button 
                        onClick={() => onToggleStatus(category)}
                        className={`p-2 transition-all rounded-xl hover:bg-white ${category.trang_thai ? "text-slate-400 hover:text-amber-500" : "text-amber-500 hover:text-amber-600"}`}
                        title={category.trang_thai ? "Ẩn" : "Hiện"}
                    >
                        {category.trang_thai ? <Eye size={16} strokeWidth={2.5} /> : <EyeOff size={16} strokeWidth={2.5} />}
                    </button>
                    <button 
                        onClick={() => onDelete(category)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-xl transition-all"
                        title="Xóa"
                    >
                        <Trash2 size={16} strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {hasChildren && isExpanded && (
                <div className="ml-8 border-l border-slate-100 pl-2 mt-1 space-y-1">
                    {category.children_recursive.map(child => (
                        <CategoryNode 
                            key={child.id} 
                            category={child} 
                            level={level + 1}
                            onAddChild={onAddChild}
                            onEdit={onEdit}
                            onToggleStatus={onToggleStatus}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [parentCategory, setParentCategory] = useState(null);
    const [error, setError] = useState(null);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await get("/api/admin/categories");
            setCategories(response.data || []);
        } catch {
            setError("Không thể tải danh mục.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAddRoot = () => {
        setSelectedCategory(null);
        setParentCategory(null);
        setDrawerOpen(true);
    };

    const handleAddChild = (parent) => {
        setSelectedCategory(null);
        setParentCategory(parent);
        setDrawerOpen(true);
    };

    const handleEdit = (category) => {
        setSelectedCategory(category);
        setParentCategory(null);
        setDrawerOpen(true);
    };

    const handleToggleStatus = async (category) => {
        try {
            await put(`/api/admin/categories/${category.id}/toggle`);
            fetchCategories();
        } catch {
            setError("Không thể cập nhật trạng thái.");
        }
    };

    const handleDelete = async (category) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${category.ten_danh_muc}"?`)) return;

        try {
            await del(`/api/admin/categories/${category.id}`);
            fetchCategories();
        } catch (err) {
            const message = err.response?.data?.message || "Không thể xóa danh mục.";
            alert(message);
        }
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
                        <h1 className={adminStyles.heroTitle}>Ngành hàng & Phân loại</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleAddRoot}
                            className={adminStyles.primaryButton}
                        >
                            <Plus size={16} className="mr-2" strokeWidth={3} />
                            Thêm danh mục gốc
                        </button>
                        <div className="h-10 w-[1px] bg-slate-200 mx-1"></div>
                        <div className="flex flex-col items-end">
                            <span className={adminStyles.heroBadge}>CATEGORY TREE</span>
                            <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">
                                Total: {categories.length} groups
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-8">
                    <div className={`${adminStyles.panel} p-6 min-h-[600px]`}>
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ee4d2d]">Hệ thống phân cấp</p>
                                <h4 className="mt-1 text-xl font-bold text-slate-900 font-display">Sơ đồ danh mục 3 cấp</h4>
                            </div>
                            <button onClick={fetchCategories} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                                <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
                            </button>
                        </div>

                        {loading && categories.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <div className="h-12 w-12 rounded-full border-2 border-slate-100 border-t-[#ee4d2d] animate-spin" />
                                <p className="text-sm font-medium text-slate-400">Đang xây dựng sơ đồ...</p>
                            </div>
                        ) : categories.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4 border-2 border-dashed border-slate-100 rounded-[30px]">
                                <FolderTree size={48} className="text-slate-200" />
                                <p className="text-slate-500 font-medium">Chưa có danh mục nào được tạo.</p>
                                <button onClick={handleAddRoot} className="text-[#ee4d2d] font-bold text-sm hover:underline">
                                    Bắt đầu tạo ngay
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {categories.map(cat => (
                                    <CategoryNode 
                                        key={cat.id} 
                                        category={cat}
                                        onAddChild={handleAddChild}
                                        onEdit={handleEdit}
                                        onToggleStatus={handleToggleStatus}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="xl:col-span-4 space-y-6">
                    <div className={`${adminStyles.statCard} p-6 !bg-slate-900 text-white overflow-hidden relative`}>
                        <div className="relative z-10">
                            <Layers className="text-[#ee4d2d] mb-4" size={24} />
                            <h4 className="text-lg font-bold">Quy tắc ngành hàng</h4>
                            <ul className="mt-4 space-y-4 text-slate-400 text-xs leading-relaxed font-medium">
                                <li className="flex gap-3">
                                    <div className="h-1.5 w-1.5 rounded-full bg-[#ee4d2d] mt-1.5 flex-none" />
                                    <span>Hệ thống hỗ trợ tối đa 3 cấp danh mục (Cha - Con - Cháu).</span>
                                </li>
                                <li className="flex gap-3">
                                    <div className="h-1.5 w-1.5 rounded-full bg-[#ee4d2d] mt-1.5 flex-none" />
                                    <span>Danh mục Cấp 3 là cấp cuối cùng, nơi Seller gắn sản phẩm vào.</span>
                                </li>
                                <li className="flex gap-3">
                                    <div className="h-1.5 w-1.5 rounded-full bg-[#ee4d2d] mt-1.5 flex-none" />
                                    <span>Khi ẩn danh mục cha, toàn bộ cấp con bên dưới sẽ bị ẩn theo ngoài trang chủ.</span>
                                </li>
                                <li className="flex gap-3">
                                    <div className="h-1.5 w-1.5 rounded-full bg-[#ee4d2d] mt-1.5 flex-none" />
                                    <span>Ảnh icon là bắt buộc để hiển thị các nút lọc nhanh tại trang chủ Buyer.</span>
                                </li>
                            </ul>
                        </div>
                        <div className="absolute -right-10 -bottom-10 opacity-10">
                            <ListTree size={200} />
                        </div>
                    </div>

                    <div className="p-6 rounded-[30px] bg-blue-50 border border-blue-100">
                        <div className="flex items-center gap-3 mb-3">
                            <Info size={20} className="text-blue-600" />
                            <h5 className="font-bold text-blue-900 text-sm">Mẹo quản trị</h5>
                        </div>
                        <p className="text-xs text-blue-700 leading-relaxed font-medium">
                            Sử dụng "Thứ tự hiển thị" để đẩy các ngành hàng hot lên đầu trang chủ. 
                            Số nhỏ hơn sẽ được ưu tiên xếp trước.
                        </p>
                    </div>
                </div>
            </div>

            <CategoryFormDrawer 
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                category={selectedCategory}
                parent={parentCategory}
                onSuccess={fetchCategories}
            />
        </div>
    );
}
