namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\DonHang;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'shop_id' => ['required', 'integer', 'exists:cua_hang,id'],
            'status' => ['nullable', 'string', 'max:50'],
            'keyword' => ['nullable', 'string', 'max:120'],
        ]);

        $lineItems = DB::table('chi_tiet_don_hang')
            ->selectRaw("don_hang_id, GROUP_CONCAT(CONCAT(ten_san_pham, ' x', so_luong) ORDER BY id SEPARATOR ', ') as products")
            ->groupBy('don_hang_id');

        $query = DonHang::query()
            ->where('cua_hang_id', $validated['shop_id'])
            ->with('buyer:id,ho_ten')
            ->leftJoinSub($lineItems, 'line_items', function ($join) {
                $join->on('line_items.don_hang_id', '=', 'don_hang.id');
            })
            ->select('don_hang.*', 'line_items.products');

        if (! empty($validated['status'])) {
            $query->where('trang_thai_don_hang', $validated['status']);
        }

        if (! empty($validated['keyword'])) {
            $keyword = $validated['keyword'];
            $query->where(function ($builder) use ($keyword) {
                $builder
                    ->where('ma_don_hang', 'like', "%{$keyword}%")
                    ->orWhere('ten_nguoi_nhan', 'like', "%{$keyword}%")
                    ->orWhere('line_items.products', 'like', "%{$keyword}%");
            });
        }

        $orders = $query
            ->orderByDesc('don_hang.created_at')
            ->get()
            ->map(function (DonHang $order) {
                return [
                    'id' => $order->id,
                    'code' => $order->ma_don_hang,
                    'customer' => $order->buyer?->ho_ten ?? $order->ten_nguoi_nhan,
                    'products' => $order->products ?: 'Chua co chi tiet san pham',
                    'total' => (float) $order->tong_tien,
                    'total_formatted' => number_format((float) $order->tong_tien, 0, ',', '.') . 'đ',
                    'status' => $this->mapOrderStatus($order->trang_thai_don_hang),
                    'status_code' => $order->trang_thai_don_hang,
                    'recipient_name' => $order->ten_nguoi_nhan,
                    'recipient_phone' => $order->so_dien_thoai_nguoi_nhan,
                    'recipient_address' => $order->dia_chi_nhan,
                    'payment_status' => $order->trang_thai_thanh_toan,
                    'created_at' => optional($order->created_at)?->toIso8601String(),
                    'created_at_label' => optional($order->created_at)?->format('d/m/Y H:i'),
                ];
            })
            ->values();

        return response()->json(['data' => $orders]);
    }

    private function mapOrderStatus(?string $status): string
    {
        return match ($status) {
            'cho_xac_nhan', 'cho_he_thong_xac_nhan' => 'Chờ xác nhận',
            'da_xac_nhan', 'dang_xu_ly', 'cho_lay_hang', 'dang_dong_goi' => 'Đang chuẩn bị',
            'dang_giao' => 'Đang giao',
            'da_giao' => 'Đã giao',
            'da_huy' => 'Đã hủy',
            default => $status ? ucfirst(str_replace('_', ' ', $status)) : 'Khác',
        };
    }
}