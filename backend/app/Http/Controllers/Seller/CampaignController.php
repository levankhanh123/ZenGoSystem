<?php
namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\ChienDich;
use App\Models\DangKyChienDich;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CampaignController extends Controller
{
    /**
     * Lấy danh sách chiến dịch và trạng thái đăng ký của shop
     */
    public function index(Request $request)
    {
        $shopId = $request->query('shop_id');
        
        // Lấy các Voucher hệ thống (campaign) mà shop có thể đăng ký
        $campaigns = \App\Models\Voucher::whereNull('cua_hang_id')
            ->whereIn('trang_thai', ['dang_mo_dang_ky', 'dang_dien_ra'])
            ->where('thoi_gian_ket_thuc', '>=', now())
            ->get();

        $data = $campaigns->map(function ($campaign) use ($shopId) {
            $registration = null;
            if ($shopId) {
                $registration = DangKyChienDich::where('campaign_id', $campaign->id)
                    ->where('shop_id', $shopId)
                    ->first();
            }

            return [
                'id' => $campaign->id,
                'ma_chien_dich' => $campaign->ma_voucher,
                'ten_chien_dich' => $campaign->ten_voucher,
                'mo_ta' => $campaign->mo_ta,
                'mo_ta_rich' => $campaign->mo_ta_rich,
                'banner_url' => $campaign->banner_url,
                'ngay_bat_dau' => $campaign->thoi_gian_bat_dau,
                'ngay_ket_thuc' => $campaign->thoi_gian_ket_thuc,
                'trang_thai' => $campaign->trang_thai,
                'registration' => $registration,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    /**
     * Đăng ký tham gia chiến dịch
     */
    public function register(Request $request)
    {
        $request->validate([
            'campaign_id' => 'required|exists:voucher,id',
            'shop_id' => 'required'
        ]);

        $existing = DangKyChienDich::where('campaign_id', $request->campaign_id)
            ->where('shop_id', $request->shop_id)
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Shop đã đăng ký chiến dịch này rồi.'
            ], 400);
        }

        $registration = DangKyChienDich::create([
            'campaign_id' => $request->campaign_id,
            'shop_id' => $request->shop_id,
            'ngay_dang_ky' => now(),
            'trang_thai' => 'cho_duyet'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đăng ký tham gia chiến dịch thành công. Vui lòng chờ Admin duyệt.',
            'data' => $registration
        ]);
    }

    /**
     * Hủy đăng ký tham gia chiến dịch
     */
    public function unregister(Request $request)
    {
        $request->validate([
            'campaign_id' => 'required',
            'shop_id' => 'required'
        ]);

        $registration = DangKyChienDich::where('campaign_id', $request->campaign_id)
            ->where('shop_id', $request->shop_id)
            ->first();

        if (!$registration) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy thông tin đăng ký.'
            ], 404);
        }

        $registration->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã hủy đăng ký tham gia chiến dịch.'
        ]);
    }
}
