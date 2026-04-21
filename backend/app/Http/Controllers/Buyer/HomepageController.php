namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\DanhMuc;
use App\Models\SanPham;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class HomepageController extends Controller
{
    // Số sản phẩm bán chạy trả về mỗi danh mục
    private const TOP_PER_CATEGORY = 10;

    // Cache TTL (giây) — 1 tiếng
    private const CACHE_TTL = 3600;

    /**
     * GET /api/homepage
     *
     * Trả về:
     *  - banner (placeholder, bạn mở rộng sau)
     *  - danh_muc_ban_chay: mỗi danh mục cha kèm top sản phẩm bán chạy
     */
    public function index(): JsonResponse
    {
        $data = Cache::remember('homepage_data', self::CACHE_TTL, function () {
            return [
                'danh_muc_ban_chay' => $this->getDanhMucBanChay(),
            ];
        });

        return response()->json([
            'success' => true,
            'data'    => $data,
        ]);
    }

    // ================================================================
    // PRIVATE METHODS
    // ================================================================

    /**
     * Lấy danh mục cha + top sản phẩm bán chạy trong từng danh mục
     * (bao gồm cả sản phẩm thuộc danh mục con bên trong)
     */
    private function getDanhMucBanChay(): array
    {
        // Bước 1: Lấy tất cả danh mục cha kèm danh mục con
        $danhMucs = DanhMuc::danhMucGoc()
            ->with('children')
            ->orderBy('id')
            ->get();

        if ($danhMucs->isEmpty()) {
            return [];
        }

        // Bước 2: Gom tất cả danh mục id (cha + con) để query 1 lần
        $allCategoryIds = $danhMucs->flatMap(function ($dm) {
            $ids = collect([$dm->id]);
            if ($dm->children->isNotEmpty()) {
                $ids = $ids->merge($dm->children->pluck('id'));
            }
            return $ids;
        });

        // Bước 3: Query top sản phẩm bán chạy với ROW_NUMBER()
        $topSanPhams = $this->getTopSanPhamByCategories($allCategoryIds->toArray());

        // Bước 4: Nhóm sản phẩm theo danh_muc_id gốc
        $sanPhamGrouped = $topSanPhams->groupBy('root_danh_muc_id');

        // Bước 5: Build response
        return $danhMucs->map(function ($danhMuc) use ($sanPhamGrouped) {
            $sanPhams = $sanPhamGrouped->get($danhMuc->id, collect());

            return [
                'id'            => $danhMuc->id,
                'ten_danh_muc'  => $danhMuc->ten_danh_muc,
                'slug'          => $danhMuc->slug,
                'danh_muc_con'  => $danhMuc->children->map(fn($c) => [
                    'id'   => $c->id,
                    'ten'  => $c->ten_danh_muc,
                    'slug' => $c->slug,
                ]),
                'san_pham_ban_chay' => $sanPhams->map(
                    fn($sp) => $this->formatSanPham($sp)
                )->values(),
            ];
        })->toArray();
    }

    /**
     * Query sản phẩm bán chạy nhất theo nhóm danh mục
     * Dùng ROW_NUMBER() để lấy top N mỗi danh mục cha
     */
    private function getTopSanPhamByCategories(array $categoryIds)
    {
        if (empty($categoryIds)) {
            return collect();
        }

        $placeholders = implode(',', array_fill(0, count($categoryIds), '?'));
        $topN         = self::TOP_PER_CATEGORY;

        /*
         * Logic:
         *  - JOIN danh_muc để biết root (danh mục cha) của mỗi sản phẩm
         *  - Đếm tổng so_luong từ chi_tiet_don_hang, loại đơn bị hủy
         *  - ROW_NUMBER() để rank trong từng nhóm danh mục cha
         *  - Lấy rank <= TOP_PER_CATEGORY
         */
        $sql = "
            SELECT *
            FROM (
                SELECT
                    sp.id,
                    sp.ten_san_pham,
                    sp.slug,
                    sp.gia,
                    sp.hinh_dai_dien,
                    sp.so_luong_ton,
                    sp.danh_muc_id,
                    -- Nếu có danh mục cha thì dùng cha, không thì dùng chính nó
                    COALESCE(dm.danh_muc_cha_id, sp.danh_muc_id) AS root_danh_muc_id,
                    ch.id        AS cua_hang_id,
                    ch.ten_cua_hang,
                    COALESCE(SUM(ctdh.so_luong), 0)     AS tong_da_ban,
                    COALESCE(AVG(dg.so_sao), 0)         AS danh_gia_trung_binh,
                    COUNT(DISTINCT dg.id)               AS so_luot_danh_gia,
                    ROW_NUMBER() OVER (
                        PARTITION BY COALESCE(dm.danh_muc_cha_id, sp.danh_muc_id)
                        ORDER BY COALESCE(SUM(ctdh.so_luong), 0) DESC
                    ) AS xep_hang
                FROM san_pham sp
                INNER JOIN cua_hang ch
                    ON ch.id = sp.cua_hang_id
                    AND ch.trang_thai = 'hoat_dong'
                INNER JOIN danh_muc dm
                    ON dm.id = sp.danh_muc_id
                LEFT JOIN chi_tiet_don_hang ctdh
                    ON ctdh.san_pham_id = sp.id
                LEFT JOIN don_hang dh
                    ON dh.id = ctdh.don_hang_id
                    AND dh.trang_thai_don_hang NOT IN ('da_huy', 'cho_xac_nhan')
                LEFT JOIN danh_gia dg
                    ON dg.san_pham_id = sp.id
                WHERE
                    sp.trang_thai = 'dang_ban'
                    AND sp.danh_muc_id IN ({$placeholders})
                GROUP BY
                    sp.id, sp.ten_san_pham, sp.slug, sp.gia,
                    sp.hinh_dai_dien, sp.so_luong_ton, sp.danh_muc_id,
                    ch.id, ch.ten_cua_hang, dm.danh_muc_cha_id
            ) ranked
            WHERE xep_hang <= {$topN}
            ORDER BY root_danh_muc_id, xep_hang
        ";

        return collect(DB::select($sql, $categoryIds));
    }

    /**
     * Format một sản phẩm trả về cho frontend
     */
    private function formatSanPham(object $sp): array
    {
        return [
            'id'                  => $sp->id,
            'ten_san_pham'        => $sp->ten_san_pham,
            'slug'                => $sp->slug,
            'gia'                 => (float) $sp->gia,
            'hinh_dai_dien'       => $sp->hinh_dai_dien
                ? asset('storage/' . $sp->hinh_dai_dien)
                : null,
            'so_luong_ton'        => (int) $sp->so_luong_ton,
            'tong_da_ban'         => (int) $sp->tong_da_ban,
            'danh_gia_trung_binh' => round((float) $sp->danh_gia_trung_binh, 1),
            'so_luot_danh_gia'    => (int) $sp->so_luot_danh_gia,
            'xep_hang'            => (int) $sp->xep_hang,
            'cua_hang'            => [
                'id'  => $sp->cua_hang_id,
                'ten' => $sp->ten_cua_hang,
            ],
        ];
    }
}