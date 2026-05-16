<?php
namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\DanhGia;
use App\Models\SanPham;
use App\Models\DonHang;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    /**
     * Get reviews for a specific shop
     */
    public function getShopReviews(Request $request, $shop_id)
    {
        $query = DanhGia::query()
            ->join('san_pham', 'danh_gia.san_pham_id', '=', 'san_pham.id')
            ->join('nguoi_dung', 'danh_gia.nguoi_mua_id', '=', 'nguoi_dung.id')
            ->where('san_pham.cua_hang_id', $shop_id)
            ->select(
                'danh_gia.*',
                'san_pham.ten_san_pham',
                'san_pham.hinh_dai_dien as san_pham_hinh',
                'nguoi_dung.ho_ten as ten_nguoi_mua',
                'nguoi_dung.anh_dai_dien as anh_nguoi_mua'
            );

        // Filter by stars
        if ($request->has('stars') && $request->stars != 'all') {
            $query->where('danh_gia.so_sao', $request->stars);
        }

        // Filter by state
        if ($request->has('state')) {
            if ($request->state === 'responded') {
                $query->whereNotNull('danh_gia.noi_dung_phan_hoi');
            } elseif ($request->state === 'unresponded') {
                $query->whereNull('danh_gia.noi_dung_phan_hoi');
            }
        }

        // Search by product name or review content
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('san_pham.ten_san_pham', 'like', "%$search%")
                  ->orWhere('danh_gia.noi_dung', 'like', "%$search%");
            });
        }

        $reviews = $query->orderBy('danh_gia.created_at', 'desc')->get();

        return response()->json($reviews);
    }

    /**
     * Reply to a review
     */
    public function reply(Request $request, $id)
    {
        $request->validate([
            'noi_dung_phan_hoi' => 'required|string|max:1000'
        ]);

        $review = DanhGia::findOrFail($id);
        
        $review->update([
            'noi_dung_phan_hoi' => $request->noi_dung_phan_hoi,
            'thoi_gian_phan_hoi' => now()
        ]);

        return response()->json([
            'message' => 'Đã gửi phản hồi thành công!',
            'review' => $review
        ]);
    }

    /**
     * Get review statistics for a shop
     */
    public function getShopReviewStats($shop_id)
    {
        // Get all products of the shop
        $productIds = SanPham::where('cua_hang_id', $shop_id)->pluck('id');

        $stats = DanhGia::whereIn('san_pham_id', $productIds)
            ->select('so_sao', DB::raw('count(*) as count'))
            ->groupBy('so_sao')
            ->pluck('count', 'so_sao')
            ->all();

        // Ensure all stars 1-5 exist in stats
        $distribution = [];
        $totalReviews = 0;
        $totalStars = 0;

        for ($i = 1; $i <= 5; $i++) {
            $count = $stats[$i] ?? 0;
            $distribution[] = [
                'stars' => $i,
                'count' => $count
            ];
            $totalReviews += $count;
            $totalStars += ($count * $i);
        }

        $avgRating = $totalReviews > 0 ? round($totalStars / $totalReviews, 1) : 0;

        $respondedCount = DanhGia::whereIn('san_pham_id', $productIds)
            ->whereNotNull('noi_dung_phan_hoi')
            ->count();

        $responseRate = $totalReviews > 0 ? round(($respondedCount / $totalReviews) * 100, 1) : 0;

        return response()->json([
            'avg_rating' => $avgRating,
            'total_reviews' => $totalReviews,
            'distribution' => $distribution,
            'response_rate' => $responseRate,
            'responded_count' => $respondedCount
        ]);
    }
}
