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

        $vouchers = Voucher::query()
            ->with(['registrations' => function ($query) use ($shopId) {
                $query->where('shop_id', $shopId);
            }])
            ->orderByDesc('thoi_gian_bat_dau')
            ->get()
            ->map(function (Voucher $voucher) {
                $registration = $voucher->registrations->first();

                return [
                    'id' => $voucher->id,
                    'code' => $voucher->ma_voucher,
                    'name' => $voucher->ten_voucher,
                    'type' => $this->mapVoucherType($voucher->loai),
                    'value' => $this->formatVoucherValue($voucher),
                    'min_order' => number_format((float) $voucher->gia_tri_don_toi_thieu, 0, ',', '.') . 'đ',
                    'usage' => (int) ($voucher->so_luong_da_dung ?? 0) . '/' . (int) ($voucher->so_luong_voucher ?? 0),
                    'status' => $this->mapVoucherStatus($voucher->trang_thai),
                    'status_code' => $voucher->trang_thai,
                    'expiry' => optional($voucher->thoi_gian_ket_thuc)?->format('d/m/Y'),
                    'registration_status' => $registration?->trang_thai,
                    'registration_status_label' => $this->mapRegistrationStatus($registration?->trang_thai),
                    'registered' => (bool) $registration,
                    'note' => $registration?->ghi_chu_admin ?: $voucher->ghi_chu,
                ];
            })
            ->values();

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