<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\DonHang;
use App\Models\ChiTietDonHang;
use App\Models\SanPham;
use App\Models\DanhGia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class StatisticsController extends Controller
{
    public function getOverview(Request $request): JsonResponse
    {
        $shopId = $request->query('shop_id');
        $range = $request->query('range', 'Tháng này');

        if (!$shopId) {
            return response()->json(['error' => 'Missing shop_id'], 400);
        }

        // 1. Determine Date Range
        $startDate = Carbon::now()->startOfMonth();
        $endDate = Carbon::now()->endOfMonth();
        $prevStartDate = Carbon::now()->subMonth()->startOfMonth();
        $prevEndDate = Carbon::now()->subMonth()->endOfMonth();

        if ($range === 'Hôm nay') {
            $startDate = Carbon::now()->startOfDay();
            $endDate = Carbon::now()->endOfDay();
            $prevStartDate = Carbon::now()->subDay()->startOfDay();
            $prevEndDate = Carbon::now()->subDay()->endOfDay();
        } elseif ($range === 'Tuần này') {
            $startDate = Carbon::now()->startOfWeek();
            $endDate = Carbon::now()->endOfWeek();
            $prevStartDate = Carbon::now()->subWeek()->startOfWeek();
            $prevEndDate = Carbon::now()->subWeek()->endOfWeek();
        } elseif ($range === 'Năm nay') {
            $startDate = Carbon::now()->startOfYear();
            $endDate = Carbon::now()->endOfYear();
            $prevStartDate = Carbon::now()->subYear()->startOfYear();
            $prevEndDate = Carbon::now()->subYear()->endOfYear();
        }

        // 2. Performance Metrics
        $currentOrders = DonHang::where('cua_hang_id', $shopId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->whereIn('trang_thai_don_hang', ['cho_lay_hang', 'dang_giao', 'da_giao', 'cho_xac_nhan'])
            ->get();

        $prevOrders = DonHang::where('cua_hang_id', $shopId)
            ->whereBetween('created_at', [$prevStartDate, $prevEndDate])
            ->whereIn('trang_thai_don_hang', ['cho_lay_hang', 'dang_giao', 'da_giao', 'cho_xac_nhan'])
            ->get();

        $revenue = (float)$currentOrders->sum('tong_tien');
        $prevRevenue = (float)$prevOrders->sum('tong_tien');
        $revenueTrend = $prevRevenue > 0 ? (($revenue - $prevRevenue) / $prevRevenue) * 100 : 0;

        $orderCount = $currentOrders->count();
        $prevOrderCount = $prevOrders->count();
        $orderTrend = $prevOrderCount > 0 ? (($orderCount - $prevOrderCount) / $prevOrderCount) * 100 : 0;

        $aov = $orderCount > 0 ? $revenue / $orderCount : 0;
        $prevAov = $prevOrderCount > 0 ? $prevRevenue / $prevOrderCount : 0;
        $aovTrend = $prevAov > 0 ? (($aov - $prevAov) / $prevAov) * 100 : 0;

        // 3. Product Insights
        $topProducts = DB::table('chi_tiet_don_hang')
            ->join('don_hang', 'chi_tiet_don_hang.don_hang_id', '=', 'don_hang.id')
            ->join('san_pham', 'chi_tiet_don_hang.san_pham_id', '=', 'san_pham.id')
            ->select('san_pham.id', 'san_pham.ten_san_pham', 'san_pham.sku', DB::raw('SUM(chi_tiet_don_hang.so_luong) as total_sold'))
            ->where('don_hang.cua_hang_id', $shopId)
            ->whereBetween('don_hang.created_at', [$startDate, $endDate])
            ->groupBy('san_pham.id', 'san_pham.ten_san_pham', 'san_pham.sku')
            ->orderByDesc('total_sold')
            ->limit(3)
            ->get();

        $lowStockProducts = SanPham::where('cua_hang_id', $shopId)
            ->where('so_luong_ton', '<=', 5)
            ->select('id', 'ten_san_pham', 'sku', 'so_luong_ton')
            ->limit(5)
            ->get();

        // 4. Operation Metrics
        $avgRating = DanhGia::whereHas('donHang', fn($q) => $q->where('cua_hang_id', $shopId))
            ->avg('so_sao') ?? 0;

        $cancellationRate = 0;
        $totalOrdersInRange = DonHang::where('cua_hang_id', $shopId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();
        
        if ($totalOrdersInRange > 0) {
            $cancelledOrders = DonHang::where('cua_hang_id', $shopId)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->where('trang_thai_don_hang', 'da_huy')
                ->count();
            $cancellationRate = ($cancelledOrders / $totalOrdersInRange) * 100;
        }

        return response()->json([
            'metrics' => [
                'revenue' => [
                    'value' => $revenue,
                    'trend' => round($revenueTrend, 1),
                    'isUp' => $revenueTrend >= 0
                ],
                'orders' => [
                    'value' => $orderCount,
                    'trend' => round($orderTrend, 1),
                    'isUp' => $orderTrend >= 0
                ],
                'aov' => [
                    'value' => $aov,
                    'trend' => round($aovTrend, 1),
                    'isUp' => $aovTrend >= 0
                ],
                'conversion' => [
                    'value' => 4.2, // Mocked for now as we don't have traffic data
                    'trend' => -0.5,
                    'isUp' => false
                ]
            ],
            'topProducts' => $topProducts,
            'lowStock' => $lowStockProducts,
            'operational' => [
                'avgRating' => round($avgRating, 1),
                'prepTime' => 0.8, // Mocked
                'cancelRate' => round($cancellationRate, 1),
                'totalCancelled' => $cancelledOrders ?? 0
            ]
        ]);
    }
}
