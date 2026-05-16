<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use App\Models\SanPham;
use App\Models\DanhMuc;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = SanPham::with(['danhMuc', 'cuaHang'])
            ->where('trang_thai', 'dang_ban')
            ->whereHas('cuaHang', fn($q) => $q->whereIn('trang_thai', ['active', 'da_duyet']))

            // ⭐ rating
            ->addSelect([
                'rating' => DB::table('danh_gia')
                    ->selectRaw('AVG(so_sao)')
                    ->whereColumn('san_pham_id', 'san_pham.id')
            ])

            // 🔥 sold (chỉ tính đơn đã giao)
            ->addSelect([
                'sold' => DB::table('chi_tiet_don_hang as ct')
                    ->join('don_hang as dh', 'dh.id', '=', 'ct.don_hang_id')
                    ->selectRaw('SUM(ct.so_luong)')
                    ->whereColumn('ct.san_pham_id', 'san_pham.id')
                    ->where('dh.trang_thai_don_hang', 'da_giao')
            ]);

        // FILTER CATEGORY
        if ($request->category_id) {
            $category = DanhMuc::with('children')->find($request->category_id);

            if ($category) {
                $childIds = $category->children->pluck('id')->toArray();
                $categoryIds = array_merge([$category->id], $childIds);

                $query->whereIn('danh_muc_id', $categoryIds);
            }
        }

        // SEARCH
        if ($request->q) {
            $query->where('ten_san_pham', 'like', '%' . $request->q . '%');
        }

        $products = $query->latest()->paginate(12);

        // FORMAT
        $products->getCollection()->transform(function ($p) {
            return [
                'id' => $p->id,
                'name' => $p->ten_san_pham,
                'price' => (float)$p->gia,
                'image' => $p->hinh_dai_dien ?: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop',

                'rating' => round($p->rating ?? 0, 1),
                'sold' => (int)($p->sold ?? 0),

                'shopId' => $p->cuaHang->id ?? null,
                'shopName' => $p->cuaHang->ten_cua_hang ?? null,

                'categoryId' => $p->danh_muc_id,
            ];
        });

        return response()->json($products);
    }


    public function show($slug)
    {
        $product = SanPham::where('slug', $slug)
            ->where('trang_thai', 'dang_ban')
            ->whereHas('cuaHang', fn($q) => $q->whereIn('trang_thai', ['active', 'da_duyet']))
            ->with(['danhMuc', 'cuaHang'])
            ->firstOrFail();

        return response()->json($product);
    }

    public function topSelling()
    {
        $products = SanPham::with(['cuaHang'])
            ->where('trang_thai', 'dang_ban')
            ->whereHas('cuaHang', fn($q) => $q->whereIn('trang_thai', ['active', 'da_duyet']))

            // ⭐ rating
            ->addSelect([
                'rating' => DB::table('danh_gia')
                    ->selectRaw('AVG(so_sao)')
                    ->whereColumn('san_pham_id', 'san_pham.id')
            ])

            // 🔥 sold
            ->addSelect([
                'sold' => DB::table('chi_tiet_don_hang as ct')
                    ->join('don_hang as dh', 'dh.id', '=', 'ct.don_hang_id')
                    ->selectRaw('SUM(ct.so_luong)')
                    ->whereColumn('ct.san_pham_id', 'san_pham.id')
                    ->where('dh.trang_thai_don_hang', 'da_giao')
            ])

            ->orderByDesc('sold')   // 🔥 quan trọng
            ->orderByDesc('rating')
            ->limit(10)
            ->get();

        return response()->json($this->formatSimple($products));
    }
    public function recommended()
    {
        $products = SanPham::with(['cuaHang'])
            ->where('trang_thai', 'dang_ban')
            ->whereHas('cuaHang', fn($q) => $q->whereIn('trang_thai', ['active', 'da_duyet']))

            ->addSelect([
                'rating' => DB::table('danh_gia')
                    ->selectRaw('AVG(so_sao)')
                    ->whereColumn('san_pham_id', 'san_pham.id')
            ])

            ->addSelect([
                'sold' => DB::table('chi_tiet_don_hang as ct')
                    ->join('don_hang as dh', 'dh.id', '=', 'ct.don_hang_id')
                    ->selectRaw('SUM(ct.so_luong)')
                    ->whereColumn('ct.san_pham_id', 'san_pham.id')
                    ->where('dh.trang_thai_don_hang', 'da_giao')
            ])

            // 🎯 logic recommend
            ->orderByDesc('rating')
            ->orderByDesc('sold')
            ->limit(10)
            ->get();

        return response()->json($this->formatSimple($products));
    }
    private function formatSimple($products)
    {
        return $products->map(function ($p) {
            return [
                'id' => $p->id,
                'name' => $p->ten_san_pham,
                'price' => (float)$p->gia,
                'image' => $p->hinh_dai_dien ?: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop',

                'rating' => round($p->rating ?? 0, 1),
                'sold' => (int)($p->sold ?? 0),

                'shopId' => $p->cuaHang->id ?? null,
                'shopName' => $p->cuaHang->ten_cua_hang ?? null,
            ];
        });
    }
     public function detail($id)
    {
        $product = SanPham::where('id', $id)
            ->where('trang_thai', 'dang_ban')
            ->whereHas('cuaHang', fn($q) => $q->whereIn('trang_thai', ['active', 'da_duyet']))
 
            // ⭐ Rating trung bình
            ->addSelect([
                'rating' => DB::table('danh_gia')
                    ->selectRaw('AVG(so_sao)')
                    ->whereColumn('san_pham_id', 'san_pham.id'),
            ])
 
            // 🔥 Tổng đã bán (đơn đã giao)
            ->addSelect([
                'sold' => DB::table('chi_tiet_don_hang as ct')
                    ->join('don_hang as dh', 'dh.id', '=', 'ct.don_hang_id')
                    ->selectRaw('COALESCE(SUM(ct.so_luong), 0)')
                    ->whereColumn('ct.san_pham_id', 'san_pham.id')
                    ->where('dh.trang_thai_don_hang', 'da_giao'),
            ])
 
            // 💬 Số lượng đánh giá
            ->addSelect([
                'review_count' => DB::table('danh_gia')
                    ->selectRaw('COUNT(*)')
                    ->whereColumn('san_pham_id', 'san_pham.id'),
            ])
 
            // Quan hệ
            ->with([
                // Danh mục (kèm cha nếu có)
                'danhMuc:id,ten_danh_muc,slug,danh_muc_cha_id',
                'danhMuc.danhMucCha:id,ten_danh_muc,slug',
 
                // Cửa hàng
                'cuaHang:id,ten_cua_hang,logo,so_dien_thoai,dia_chi_lay_hang,mo_ta',
 
                // Hình ảnh phụ
                'hinhAnhSanPham:id,san_pham_id,duong_dan_anh',
 
                // Đánh giá (lấy 10 mới nhất, kèm tên người mua)
                'danhGia' => function ($q) {
                    $q->select('id', 'san_pham_id', 'nguoi_mua_id', 'don_hang_id', 'so_sao', 'noi_dung', 'created_at')
                      ->orderByDesc('created_at')
                      ->limit(10);
                },
                'danhGia.nguoiMua:id,ho_ten',
            ])
 
            ->firstOrFail();
 
        // ── Format response ──
        return response()->json([
            // Thông tin cơ bản
            'id'               => $product->id,
            'ten_san_pham'     => $product->ten_san_pham,
            'slug'             => $product->slug,
            'sku'              => $product->sku,
            'mo_ta'            => $product->mo_ta,
            'gia'              => (float) $product->gia,
            'so_luong_ton'     => $product->so_luong_ton,
            'so_luong_tam_giu' => $product->so_luong_tam_giu,
            'khoi_luong'       => $product->khoi_luong,
            'hinh_dai_dien'    => $product->hinh_dai_dien ?: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop',
            'trang_thai'       => $product->trang_thai,
 
            // Thống kê
            'rating'           => round($product->rating ?? 0, 1),
            'sold'             => (int) ($product->sold ?? 0),
            'review_count'     => (int) ($product->review_count ?? 0),
 
            // Danh mục
            'danh_muc' => $product->danhMuc ? [
                'id'            => $product->danhMuc->id,
                'ten_danh_muc'  => $product->danhMuc->ten_danh_muc,
                'slug'          => $product->danhMuc->slug,
                'danh_muc_cha'  => $product->danhMuc->danhMucCha ? [
                    'id'           => $product->danhMuc->danhMucCha->id,
                    'ten_danh_muc' => $product->danhMuc->danhMucCha->ten_danh_muc,
                ] : null,
            ] : null,
 
            // Cửa hàng
            'cua_hang' => $product->cuaHang ? [
                'id'              => $product->cuaHang->id,
                'ten_cua_hang'    => $product->cuaHang->ten_cua_hang,
                'logo'            => $product->cuaHang->logo,
                'so_dien_thoai'   => $product->cuaHang->so_dien_thoai,
                'dia_chi_lay_hang'=> $product->cuaHang->dia_chi_lay_hang,
                'mo_ta'           => $product->cuaHang->mo_ta,
            ] : null,
 
            // Hình ảnh phụ
            'hinh_anh_san_pham' => $product->hinhAnhSanPham->map(fn($i) => [
                'id'           => $i->id,
                'duong_dan_anh'=> $i->duong_dan_anh,
            ]),
 
            // Đánh giá
            'danh_gia' => $product->danhGia->map(fn($r) => [
                'id'         => $r->id,
                'so_sao'     => $r->so_sao,
                'noi_dung'   => $r->noi_dung,
                'created_at' => $r->created_at,
                'nguoi_mua'  => $r->nguoiMua ? ['ho_ten' => $r->nguoiMua->ho_ten] : null,
            ]),
        ]);
    }
}