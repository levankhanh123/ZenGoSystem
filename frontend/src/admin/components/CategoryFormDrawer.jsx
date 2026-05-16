import React, { useEffect, useState } from "react";
import { X, Upload, Check, ChevronDown, ChevronRight, Image as ImageIcon, Tag, Hash, ToggleLeft, ToggleRight, Eye, RefreshCcw } from "lucide-react";
import { adminStyles } from "../lib/adminStyles";
import { get, post, put } from "../lib/api";

const TreeSelectOption = ({ category, level = 0, selectedId, onSelect }) => {
    const hasChildren = category.children_recursive && category.children_recursive.length > 0;
    
    return (
        <div className="flex flex-col">
            <button
                type="button"
                onClick={() => onSelect(category.id)}
                className={`
                    w-full text-left px-4 py-2 text-sm transition-colors rounded-xl
                    ${selectedId === category.id ? "bg-[#ee4d2d]/10 text-[#ee4d2d] font-bold" : "text-slate-600 hover:bg-slate-50"}
                `}
                style={{ paddingLeft: `${(level + 1) * 1.5}rem` }}
            >
                <div className="flex items-center gap-2">
                    {level > 0 && <span className="text-slate-300">└─</span>}
                    {category.ten_danh_muc}
                </div>
            </button>
            {hasChildren && category.children_recursive.map(child => (
                <TreeSelectOption 
                    key={child.id} 
                    category={child} 
                    level={level + 1} 
                    selectedId={selectedId} 
                    onSelect={onSelect} 
                />
            ))}
        </div>
    );
};

export default function CategoryFormDrawer({ isOpen, onClose, category, parent, onSuccess }) {
    const [formData, setFormData] = useState({
        ten_danh_muc: "",
        danh_muc_cha_id: null,
        hinh_anh: "",
        thu_tu: 0,
        trang_thai: true
    });
    const [treeData, setTreeData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showTreeSelect, setShowTreeSelect] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchTreeData();
            if (category) {
                setFormData({
                    ten_danh_muc: category.ten_danh_muc,
                    danh_muc_cha_id: category.danh_muc_cha_id,
                    hinh_anh: category.hinh_anh || "",
                    thu_tu: category.thu_tu || 0,
                    trang_thai: category.trang_thai !== undefined ? !!category.trang_thai : true
                });
            } else if (parent) {
                setFormData({
                    ten_danh_muc: "",
                    danh_muc_cha_id: parent.id,
                    hinh_anh: "",
                    thu_tu: 0,
                    trang_thai: true
                });
            } else {
                setFormData({
                    ten_danh_muc: "",
                    danh_muc_cha_id: null,
                    hinh_anh: "",
                    thu_tu: 0,
                    trang_thai: true
                });
            }
        }
    }, [isOpen, category, parent]);

    const fetchTreeData = async () => {
        setLoading(true);
        try {
            const response = await get("/api/admin/categories/tree");
            setTreeData(response.data || []);
        } catch (err) {
            console.error("Failed to fetch tree data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const uploadData = new FormData();
        uploadData.append("file", file);
        uploadData.append("upload_preset", "zengo_products"); // Reusing product preset

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/dqffntvmp/image/upload`,
                { method: "POST", body: uploadData }
            );
            const data = await response.json();
            setFormData({ ...formData, hinh_anh: data.secure_url });
        } catch (err) {
            console.error("Upload failed:", err);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (category) {
                await put(`/api/admin/categories/${category.id}`, formData);
            } else {
                await post("/api/admin/categories", formData);
            }
            onSuccess();
            onClose();
        } catch (err) {
            console.error("Save failed:", err);
            alert("Có lỗi xảy ra khi lưu danh mục.");
        } finally {
            setSubmitting(false);
        }
    };

    const getParentName = () => {
        if (!formData.danh_muc_cha_id) return "Không có (Danh mục gốc)";
        
        const findName = (list) => {
            for (let item of list) {
                if (item.id === formData.danh_muc_cha_id) return item.ten_danh_muc;
                if (item.children_recursive) {
                    const found = findName(item.children_recursive);
                    if (found) return found;
                }
            }
            return null;
        };
        
        return findName(treeData) || "Đang chọn...";
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
                <div className="w-screen max-w-md transform transition-transform duration-500">
                    <div className="flex h-full flex-col bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">{category ? "Sửa danh mục" : "Thêm danh mục mới"}</h2>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">
                                    {category ? `Editing ID: #${category.id}` : "Product Classification"}
                                </p>
                            </div>
                            <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-50 transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
                            {/* Basic Info */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 flex items-center gap-2">
                                        <Tag size={14} /> Tên danh mục
                                    </label>
                                    <input
                                        required
                                        value={formData.ten_danh_muc}
                                        onChange={(e) => setFormData({ ...formData, ten_danh_muc: e.target.value })}
                                        className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm outline-none focus:border-[#ee4d2d] focus:ring-4 focus:ring-[#ee4d2d]/5 transition-all"
                                        placeholder="Ví dụ: Thiết bị số, Thời trang nam..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 flex items-center gap-2">
                                        <ChevronDown size={14} /> Danh mục cha
                                    </label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setShowTreeSelect(!showTreeSelect)}
                                            className="w-full text-left rounded-2xl border border-slate-200 px-4 py-3.5 text-sm bg-slate-50/50 flex items-center justify-between group hover:border-slate-300 transition-all"
                                        >
                                            <span className={formData.danh_muc_cha_id ? "text-slate-900 font-bold" : "text-slate-400"}>
                                                {getParentName()}
                                            </span>
                                            <ChevronDown size={18} className={`text-slate-400 transition-transform ${showTreeSelect ? "rotate-180" : ""}`} />
                                        </button>
                                        
                                        {showTreeSelect && (
                                            <div className="absolute z-20 mt-2 w-full max-h-60 overflow-y-auto rounded-2xl border border-slate-100 bg-white shadow-xl p-2 animate-in fade-in zoom-in duration-200">
                                                <button
                                                    type="button"
                                                    onClick={() => { setFormData({ ...formData, danh_muc_cha_id: null }); setShowTreeSelect(false); }}
                                                    className={`w-full text-left px-4 py-2.5 text-sm rounded-xl transition-colors ${!formData.danh_muc_cha_id ? "bg-[#ee4d2d]/10 text-[#ee4d2d] font-bold" : "text-slate-600 hover:bg-slate-50"}`}
                                                >
                                                    Danh mục gốc
                                                </button>
                                                {treeData.map(cat => (
                                                    <TreeSelectOption 
                                                        key={cat.id} 
                                                        category={cat} 
                                                        selectedId={formData.danh_muc_cha_id}
                                                        onSelect={(id) => { setFormData({ ...formData, danh_muc_cha_id: id }); setShowTreeSelect(false); }}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Appearance */}
                            <div className="space-y-6 pt-6 border-t border-slate-100">
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 flex items-center gap-2">
                                        <ImageIcon size={14} /> Ảnh đại diện (Icon)
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <div className="h-20 w-20 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 overflow-hidden group hover:border-[#ee4d2d] transition-colors relative">
                                            {formData.hinh_anh ? (
                                                <img src={formData.hinh_anh} className="w-full h-full object-cover" alt="Preview" />
                                            ) : (
                                                <ImageIcon size={24} className="text-slate-300" />
                                            )}
                                            {uploading && (
                                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                                    <RefreshCcw size={20} className="animate-spin text-[#ee4d2d]" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                id="category-icon"
                                                hidden
                                                onChange={handleImageUpload}
                                                accept="image/*"
                                            />
                                            <label
                                                htmlFor="category-icon"
                                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer transition-all shadow-sm"
                                            >
                                                <Upload size={14} strokeWidth={3} />
                                                Chọn ảnh PNG/SVG
                                            </label>
                                            <p className="text-[10px] text-slate-400 mt-2 font-medium">Tỷ lệ 1:1, dung lượng tối đa 2MB.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 flex items-center gap-2">
                                            <Hash size={14} /> Thứ tự
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.thu_tu}
                                            onChange={(e) => setFormData({ ...formData, thu_tu: e.target.value })}
                                            className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm outline-none focus:border-[#ee4d2d] transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 flex items-center gap-2">
                                            <Eye size={14} /> Trạng thái
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, trang_thai: !formData.trang_thai })}
                                            className={`
                                                w-full rounded-2xl border px-4 py-3.5 text-sm flex items-center justify-between transition-all
                                                ${formData.trang_thai ? "border-green-200 bg-green-50 text-green-700" : "border-slate-200 bg-slate-50 text-slate-400"}
                                            `}
                                        >
                                            <span className="font-bold">{formData.trang_thai ? "Đang hiện" : "Đang ẩn"}</span>
                                            {formData.trang_thai ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>

                        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                            <button
                                type="submit"
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-900 py-4 text-sm font-black text-white hover:bg-slate-800 transition-all shadow-xl disabled:opacity-50"
                            >
                                {submitting ? <RefreshCcw size={18} className="animate-spin" /> : <Check size={18} strokeWidth={3} />}
                                {category ? "CẬP NHẬT DANH MỤC" : "TẠO DANH MỤC NGAY"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
