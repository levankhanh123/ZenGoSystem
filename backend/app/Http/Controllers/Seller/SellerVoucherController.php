<?php
namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Voucher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SellerVoucherController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'shop_id' => ['required', 'integer', 'exists:cua_hang,id'],
        ]);

        $shopId = $validated['shop_id'];

        // Lấy ID các chiến dịch mà shop này đã đăng ký
        $registeredCampaignIds = \App\Models\DangKyChienDich::where('shop_id', $shopId)
            ->pluck('campaign_id');

        $vouchers = Voucher::query()
            ->where(function ($query) use ($shopId, $registeredCampaignIds) {
                $query->where('cua_hang_id', $shopId)
                      ->orWhereIn('campaign_id', $registeredCampaignIds);
            })
            ->with(['registrations' => function ($query) use ($shopId) {
                $query->where('shop_id', $shopId);
            }])
            ->orderByDesc('thoi_gian_bat_dau')
            ->get()
            ->map(function (Voucher $voucher) use ($shopId) {
                $voucher->refreshStatus();
                $registration = $voucher->registrations->first();
                
                // Trả về cả các field raw của model (frontend dùng) 
                // và các field mapped (nếu cần)
                return array_merge($voucher->toArray(), [
                    'registration_status' => $registration?->trang_thai,
                    'registration_status_label' => $this->mapRegistrationStatus($registration?->trang_thai),
                    'registered' => (bool) $registration,
                    'is_system_voucher' => is_null($voucher->cua_hang_id),
                ]);
            });

        return response()->json(['data' => $vouchers]);
    }

    private function mapVoucherType(?string $type): string
    {
        return match ($type) {
            'voucher_san', 'giam_tien' => 'Giảm số tiền',
            'giam_phan_tram' => 'Giảm phần trăm',
            'free_ship' => 'Miễn phí vận chuyển',
            default => $type ? ucfirst(str_replace('_', ' ', $type)) : 'Khác',
        };
    }

    private function formatVoucherValue(Voucher $voucher): string
    {
        if ($voucher->loai === 'giam_phan_tram' && (float) $voucher->gia_tri_voucher > 0) {
            $max = (float) $voucher->giam_toi_da > 0
                ? ' tối đa ' . number_format((float) $voucher->giam_toi_da, 0, ',', '.') . 'đ'
                : '';

            return rtrim(rtrim((string) $voucher->gia_tri_voucher, '0'), '.') . '%' . $max;
        }

        if ($voucher->loai === 'free_ship') {
            return (float) $voucher->giam_toi_da > 0
                ? 'Tối đa ' . number_format((float) $voucher->giam_toi_da, 0, ',', '.') . 'đ'
                : 'Miễn phí vận chuyển';
        }

        return number_format((float) $voucher->gia_tri_voucher, 0, ',', '.') . 'đ';
    }

    private function mapVoucherStatus(?string $status): string
    {
        return match ($status) {
            'dang_dien_ra' => 'Đang diễn ra',
            'dang_mo_dang_ky', 'sap_dien_ra' => 'Sắp diễn ra',
            'ket_thuc', 'da_ket_thuc' => 'Đã kết thúc',
            default => $status ? ucfirst(str_replace('_', ' ', $status)) : 'Khác',
        };
    }

    private function mapRegistrationStatus(?string $status): ?string
    {
        return match ($status) {
            'cho_duyet' => 'Chờ duyệt',
            'da_duyet' => 'Đã duyệt',
            'tu_choi' => 'Từ chối',
            null => null,
            default => ucfirst(str_replace('_', ' ', $status)),
        };
    }
}
