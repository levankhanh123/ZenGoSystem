<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CuaHang;
use App\Models\DangKyChienDich;
use App\Models\DonHang;
use App\Models\HoiThoai;
use App\Models\KhieuNai;
use App\Models\NguoiDung;
use App\Models\ThongBao;
use App\Models\Voucher;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $recentUsers = NguoiDung::query()
            ->latest('created_at')
            ->limit(5)
            ->get();

        $priorityOrders = DonHang::query()
            ->with(['buyer', 'shop'])
            ->where(function ($query) {
                $query
                    ->where('bat_thuong', 1)
                    ->orWhere('trang_thai_xac_nhan', 'can_admin_xac_nhan');
            })
            ->latest('created_at')
            ->limit(8)
            ->get();

        $activeComplaints = KhieuNai::query()
            ->with(['complainant', 'order', 'assignedAdmin'])
            ->whereIn('trang_thai', ['moi', 'dang_xu_ly'])
            ->latest('created_at')
            ->limit(8)
            ->get();

        $recentConversations = HoiThoai::query()
            ->with(['members.user', 'complaint', 'order'])
            ->latest('thoi_gian_cuoi')
            ->limit(8)
            ->get();

        $pendingShops = CuaHang::query()
            ->with('owner')
            ->where('trang_thai', 'cho_duyet')
            ->latest('created_at')
            ->limit(8)
            ->get();

        return response()->json([
            'data' => [
                'users' => [
                    'total' => NguoiDung::count(),
                    'customers' => NguoiDung::whereIn('vai_tro', ['customer', 'nguoi_mua'])->count(),
                    'shops' => NguoiDung::whereIn('vai_tro', ['shop', 'nguoi_ban'])->count(),
                    'shippers' => NguoiDung::whereIn('vai_tro', ['shipper', 'giao_hang'])->count(),
                    'admins' => NguoiDung::whereIn('vai_tro', ['admin', 'quan_tri'])->count(),
                ],
                'shops' => [
                    'total' => CuaHang::count(),
                    'pending' => CuaHang::where('trang_thai', 'cho_duyet')->count(),
                    'rejected' => CuaHang::where('trang_thai', 'tu_choi')->count(),
                ],
                'orders' => [
                    'total' => DonHang::count(),
                    'abnormal' => DonHang::where('bat_thuong', 1)->count(),
                    'pending_confirmation' => DonHang::where('trang_thai_xac_nhan', 'cho_he_thong_xac_nhan')->count(),
                ],
                'complaints' => [
                    'open' => KhieuNai::where('trang_thai', 'dang_xu_ly')->count(),
                    'resolved' => KhieuNai::where('trang_thai', 'da_xu_ly')->count(),
                ],
                'conversations' => [
                    'total' => HoiThoai::count(),
                    'unread_admin' => HoiThoai::where('chua_doc_admin', 1)->count(),
                    'open' => HoiThoai::where('trang_thai', '!=', 'dong')->count(),
                ],
                'notifications' => [
                    'total' => ThongBao::count(),
                    'unread' => ThongBao::where('da_doc', 0)->count(),
                ],
                'campaigns' => [
                    'total' => Voucher::count(),
                    'open_signup' => Voucher::where('trang_thai', 'dang_mo_dang_ky')->count(),
                    'live' => Voucher::where('trang_thai', 'dang_dien_ra')->count(),
                    'pending_registrations' => DangKyChienDich::where('trang_thai', 'cho_duyet')->count(),
                ],
                'ops_signals' => [
                    'orders_need_attention' => DonHang::where(function ($query) {
                        $query->where('bat_thuong', 1)
                            ->orWhere('trang_thai_xac_nhan', 'can_admin_xac_nhan');
                    })->count(),
                    'high_priority_complaints' => KhieuNai::whereIn('trang_thai', ['moi', 'dang_xu_ly'])
                        ->where('uu_tien', 'cao')
                        ->count(),
                    'unassigned_complaints' => KhieuNai::whereIn('trang_thai', ['moi', 'dang_xu_ly'])
                        ->whereNull('assigned_admin_id')
                        ->count(),
                    'breached_complaints' => KhieuNai::whereIn('trang_thai', ['moi', 'dang_xu_ly'])
                        ->where('created_at', '<=', now()->subHours(48))
                        ->count(),
                    'stale_unread_conversations' => HoiThoai::where('chua_doc_admin', 1)
                        ->where(function ($query) {
                            $query->where('thoi_gian_cuoi', '<=', now()->subHours(6))
                                ->orWhere(function ($fallbackQuery) {
                                    $fallbackQuery->whereNull('thoi_gian_cuoi')
                                        ->where('created_at', '<=', now()->subHours(6));
                                });
                        })
                        ->count(),
                    'pending_shops' => CuaHang::where('trang_thai', 'cho_duyet')->count(),
                    'unread_notifications' => ThongBao::where('da_doc', 0)->count(),
                    'pending_campaign_registrations' => DangKyChienDich::where('trang_thai', 'cho_duyet')->count(),
                ],
                'recent_users' => $recentUsers,
                'priority_orders' => $priorityOrders,
                'active_complaints' => $activeComplaints,
                'recent_conversations' => $recentConversations,
                'pending_shops' => $pendingShops,
            ],
        ]);
    }
}
