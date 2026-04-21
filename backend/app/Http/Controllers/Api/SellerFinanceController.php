<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DoiSoatShop;
use App\Models\HoanTien;
use App\Models\ThanhToan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SellerFinanceController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'shop_id' => ['required', 'integer', 'exists:cua_hang,id'],
        ]);

        $shopId = $validated['shop_id'];

        $settlements = DoiSoatShop::query()
            ->where('shop_id', $shopId)
            ->orderByDesc('ngay_doi_soat')
            ->orderByDesc('created_at')
            ->get();

        $payments = ThanhToan::query()
            ->whereHas('order', fn ($query) => $query->where('cua_hang_id', $shopId))
            ->with('order:id,ma_don_hang,cua_hang_id')
            ->where('trang_thai', 'thanh_cong')
            ->orderByDesc('thoi_gian_thanh_toan')
            ->orderByDesc('created_at')
            ->limit(20)
            ->get();

        $refunds = HoanTien::query()
            ->whereHas('order', fn ($query) => $query->where('cua_hang_id', $shopId))
            ->with('order:id,ma_don_hang,cua_hang_id')
            ->orderByDesc('updated_at')
            ->limit(20)
            ->get();

        $availableBalance = (float) $settlements->where('trang_thai', 'cho_chuyen_khoan')->sum('thuc_nhan');
        $totalWithdrawn = (float) $settlements->where('trang_thai', 'da_chuyen_khoan')->sum('thuc_nhan');
        $frozenBalance = (float) $payments
            ->filter(fn (ThanhToan $payment) => $payment->order?->trang_thai_don_hang !== 'da_huy')
            ->sum('so_tien');

        $transactions = collect();

        foreach ($payments as $payment) {
            $transactions->push([
                'id' => $payment->ma_giao_dich ?: 'PAY-' . $payment->id,
                'type' => 'Cộng tiền',
                'type_code' => 'plus',
                'amount' => (float) $payment->so_tien,
                'amount_formatted' => '+ ' . number_format((float) $payment->so_tien, 0, ',', '.') . 'đ',
                'details' => 'Doanh thu từ đơn hàng #' . ($payment->order?->ma_don_hang ?? $payment->don_hang_id),
                'time' => optional($payment->thoi_gian_thanh_toan ?? $payment->created_at)?->format('d/m/Y H:i'),
                'sort_time' => optional($payment->thoi_gian_thanh_toan ?? $payment->created_at)?->timestamp,
                'status' => $payment->trang_thai,
            ]);
        }

        foreach ($refunds as $refund) {
            $transactions->push([
                'id' => 'REF-' . $refund->id,
                'type' => 'Hoàn tiền',
                'type_code' => 'refund',
                'amount' => (float) $refund->so_tien,
                'amount_formatted' => '- ' . number_format((float) $refund->so_tien, 0, ',', '.') . 'đ',
                'details' => 'Hoàn tiền đơn hàng #' . ($refund->order?->ma_don_hang ?? $refund->don_hang_id),
                'time' => optional($refund->updated_at ?? $refund->created_at)?->format('d/m/Y H:i'),
                'sort_time' => optional($refund->updated_at ?? $refund->created_at)?->timestamp,
                'status' => $refund->trang_thai,
            ]);
        }

        foreach ($settlements as $settlement) {
            $transactions->push([
                'id' => $settlement->ma_doi_soat,
                'type' => 'Đối soát shop',
                'type_code' => 'minus',
                'amount' => (float) $settlement->thuc_nhan,
                'amount_formatted' => '- ' . number_format((float) $settlement->thuc_nhan, 0, ',', '.') . 'đ',
                'details' => 'Phiên đối soát ' . $settlement->ma_doi_soat,
                'time' => optional($settlement->ngay_doi_soat ?? $settlement->created_at)?->format('d/m/Y H:i'),
                'sort_time' => optional($settlement->ngay_doi_soat ?? $settlement->created_at)?->timestamp,
                'status' => $settlement->trang_thai,
            ]);
        }

        $transactions = $transactions
            ->sortByDesc('sort_time')
            ->values()
            ->take(30)
            ->map(function (array $transaction) {
                unset($transaction['sort_time']);

                return $transaction;
            });

        $settlementHistory = $settlements->map(function (DoiSoatShop $settlement) {
            return [
                'id' => $settlement->ma_doi_soat,
                'date' => optional($settlement->ngay_doi_soat ?? $settlement->created_at)?->format('d/m/Y'),
                'amount' => number_format((float) $settlement->thuc_nhan, 0, ',', '.') . 'đ',
                'amount_raw' => (float) $settlement->thuc_nhan,
                'status' => $this->mapSettlementStatus($settlement->trang_thai),
                'status_code' => $settlement->trang_thai,
                'period' => $settlement->ky_doi_soat,
                'note' => $settlement->ghi_chu,
            ];
        })->values();

        return response()->json([
            'data' => [
                'wallet' => [
                    'available' => $availableBalance,
                    'available_formatted' => number_format($availableBalance, 0, ',', '.') . 'đ',
                    'frozen' => $frozenBalance,
                    'frozen_formatted' => number_format($frozenBalance, 0, ',', '.') . 'đ',
                    'total_withdrawn' => $totalWithdrawn,
                    'total_withdrawn_formatted' => number_format($totalWithdrawn, 0, ',', '.') . 'đ',
                ],
                'transactions' => $transactions,
                'settlements' => $settlementHistory,
            ],
        ]);
    }

    private function mapSettlementStatus(?string $status): string
    {
        return match ($status) {
            'da_chuyen_khoan' => 'Hoàn thành',
            'cho_chuyen_khoan' => 'Đang xử lý',
            'tu_choi' => 'Từ chối',
            default => $status ? ucfirst(str_replace('_', ' ', $status)) : 'Khác',
        };
    }
}