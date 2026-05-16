<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CuaHang;
use App\Models\SanPham;
use App\Models\DanhMuc;
use Illuminate\Support\Facades\DB;

class CuaHangController extends Controller
{
    // ================================================================
    // GET /api/shops
    // Danh sách tất cả shop (đã được duyệt)
    // Query params: q (tìm kiếm), per_page
    // ================================================================
    public function index(Request $request)
    {
        $query = CuaHang::whereIn('trang_thai', ['active', 'da_duyet'])

            // Số sản phẩm đang bán
            ->addSelect([
                'so_san_pham' => DB::table('san_pham')
                    ->selectRaw('COUNT(*)')
                    ->whereColumn('cua_hang_id', 'cua_hang.id')
                    ->where('trang_thai', 'dang_ban'),
            ])

            // Tổng đơn đã giao
            ->addSelect([
                'tong_don' => DB::table('don_hang')
                    ->selectRaw('COUNT(*)')
                    ->whereColumn('cua_hang_id', 'cua_hang.id')
                    ->where('trang_thai_don_hang', 'da_giao'),
            ])

            // Rating trung bình của toàn shop (qua sản phẩm)
            ->addSelect([
                'rating_trung_binh' => DB::table('danh_gia as dg')
                    ->join('san_pham as sp', 'sp.id', '=', 'dg.san_pham_id')
                    ->selectRaw('ROUND(AVG(dg.so_sao), 1)')
                    ->whereColumn('sp.cua_hang_id', 'cua_hang.id'),
            ]);

        // Tìm kiếm theo tên
        if ($request->q) {
            $query->where('ten_cua_hang', 'like', '%' . $request->q . '%');
        }

        $perPage = $request->per_page ?? 12;
        $shops   = $query->latest()->paginate($perPage);

        $shops->getCollection()->transform(fn($s) => $this->formatShop($s));

        return response()->json($shops);
    }

    // ================================================================
    // GET /api/shops/{id}
    // Chi tiết 1 shop + danh sách sản phẩm có filter/sort/paginate
    // Query params: category_id, q, sort (ban_chay|moi_nhat|gia_tang|gia_giam), per_page
    // ================================================================
    public function show(Request $request, $id)
    {
        $shop = CuaHang::where('id', $id)
            ->whereIn('trang_thai', ['active', 'da_duyet'])

            ->addSelect([
                'so_san_pham' => DB::table('san_pham')
                    ->selectRaw('COUNT(*)')
                    ->whereColumn('cua_hang_id', 'cua_hang.id')
                    ->where('trang_thai', 'dang_ban'),
            ])

            ->addSelect([
                'tong_don' => DB::table('don_hang')
                    ->selectRaw('COUNT(*)')
                    ->whereColumn('cua_hang_id', 'cua_hang.id')
                    ->where('trang_thai_don_hang', 'da_giao'),
            ])

            ->addSelect([
                'rating_trung_binh' => DB::table('danh_gia as dg')
                    ->join('san_pham as sp', 'sp.id', '=', 'dg.san_pham_id')
                    ->selectRaw('ROUND(AVG(dg.so_sao), 1)')
                    ->whereColumn('sp.cua_hang_id', 'cua_hang.id'),
            ])

            ->firstOrFail();

        // ── Sản phẩm của shop ──
        $productQuery = SanPham::where('cua_hang_id', $shop->id)
            ->where('trang_thai', 'dang_ban')

            ->addSelect([
                'rating' => DB::table('danh_gia')
                    ->selectRaw('ROUND(AVG(so_sao),1)')
                    ->whereColumn('san_pham_id', 'san_pham.id'),
            ])

            ->addSelect([
                'sold' => DB::table('chi_tiet_don_hang as ct')
                    ->join('don_hang as dh', 'dh.id', '=', 'ct.don_hang_id')
                    ->selectRaw('COALESCE(SUM(ct.so_luong),0)')
                    ->whereColumn('ct.san_pham_id', 'san_pham.id')
                    ->where('dh.trang_thai_don_hang', 'da_giao'),
            ]);

        // Filter danh mục
        if ($request->category_id) {
            $cat     = DanhMuc::with('children')->find($request->category_id);
            $catIds  = $cat
                ? array_merge([$cat->id], $cat->children->pluck('id')->toArray())
                : [$request->category_id];
            $productQuery->whereIn('danh_muc_id', $catIds);
        }

        // Tìm kiếm
        if ($request->q) {
            $productQuery->where('ten_san_pham', 'like', '%' . $request->q . '%');
        }

        // Sắp xếp
        match ($request->sort) {
            'ban_chay'  => $productQuery->orderByDesc('sold'),
            'gia_tang'  => $productQuery->orderBy('gia'),
            'gia_giam'  => $productQuery->orderByDesc('gia'),
            default     => $productQuery->latest(), // moi_nhat
        };

        $perPage  = $request->per_page ?? 12;
        $products = $productQuery->paginate($perPage);

        $products->getCollection()->transform(fn($p) => [
            'id'       => $p->id,
            'name'     => $p->ten_san_pham,
            'slug'     => $p->slug,
            'price'    => (float) $p->gia,
            'image'    => $p->hinh_dai_dien,
            'rating'   => (float) ($p->rating ?? 0),
            'sold'     => (int)   ($p->sold   ?? 0),
            'stock'    => max(0, $p->so_luong_ton - ($p->so_luong_tam_giu ?? 0)),
        ]);

        // Danh mục có sản phẩm trong shop này (để làm filter)
        $categories = DanhMuc::whereHas('sanPhams', fn($q) =>
                $q->where('cua_hang_id', $shop->id)->where('trang_thai', 'dang_ban')
            )
            ->select('id', 'ten_danh_muc')
            ->get();

        return response()->json([
            'shop'       => $this->formatShop($shop),
            'categories' => $categories,
            'products'   => $products,
        ]);
    }

    // ================================================================
    // GET /api/shops/top
    // Top shop nổi bật (dùng cho trang chủ)
    // ================================================================
    public function top()
    {
        $shops = CuaHang::whereIn('trang_thai', ['active', 'da_duyet'])

            ->addSelect([
                'so_san_pham' => DB::table('san_pham')
                    ->selectRaw('COUNT(*)')
                    ->whereColumn('cua_hang_id', 'cua_hang.id')
                    ->where('trang_thai', 'dang_ban'),
            ])

            ->addSelect([
                'tong_don' => DB::table('don_hang')
                    ->selectRaw('COUNT(*)')
                    ->whereColumn('cua_hang_id', 'cua_hang.id')
                    ->where('trang_thai_don_hang', 'da_giao'),
            ])

            ->addSelect([
                'rating_trung_binh' => DB::table('danh_gia as dg')
                    ->join('san_pham as sp', 'sp.id', '=', 'dg.san_pham_id')
                    ->selectRaw('ROUND(AVG(dg.so_sao),1)')
                    ->whereColumn('sp.cua_hang_id', 'cua_hang.id'),
            ])

            ->orderByDesc('tong_don')
            ->limit(8)
            ->get();

        return response()->json($shops->map(fn($s) => $this->formatShop($s)));
    }

    // ── private helper ──
    private function formatShop($s): array
    {
        return [
            'id'               => $s->id,
            'ten_cua_hang'     => $s->ten_cua_hang,
            'logo'             => $s->logo,
            'mo_ta'            => $s->mo_ta,
            'dia_chi_lay_hang' => $s->dia_chi_lay_hang,
            'so_dien_thoai'    => $s->so_dien_thoai,
            'so_san_pham'      => (int) ($s->so_san_pham      ?? 0),
            'tong_don'         => (int) ($s->tong_don         ?? 0),
            'rating_trung_binh'=> (float) ($s->rating_trung_binh ?? 0),
        ];
    }
}