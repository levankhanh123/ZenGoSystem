<?php
namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Voucher;
use Illuminate\Support\Carbon;

class VoucherController extends Controller
{
    /**
     * Lấy danh sách phiếu giảm giá của một cửa hàng.
     */
    public function getShopVouchers($cua_hang_id)
    {
        $vouchers = Voucher::where('cua_hang_id', $cua_hang_id)
                           ->orderBy('created_at', 'desc')
                           ->get();

        foreach ($vouchers as $voucher) {
            /** @var \App\Models\Voucher $voucher */
            $voucher->refreshStatus();
        }

        return response()->json($vouchers);
    }

    /**
     * Thêm mới một phiếu giảm giá
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'cua_hang_id' => 'required|integer',
            'ten_voucher' => 'required|string|max:255',
            'ma_voucher' => 'required|string|max:50|unique:voucher,ma_voucher',
            'thoi_gian_bat_dau' => 'required|date',
            'thoi_gian_ket_thuc' => 'required|date|after:thoi_gian_bat_dau',
            'gia_tri_voucher' => 'required|numeric|min:0',
            'kieu_giam_gia' => 'required|string|in:phan_tram,so_tien',
            'giam_toi_da' => 'nullable|numeric|min:0',
            'gia_tri_don_toi_thieu' => 'required|numeric|min:0',
            'so_luong_voucher' => 'required|integer|min:1',
            'loai' => 'required|string'
        ]);

        $voucher = new Voucher();
        $voucher->cua_hang_id = $validatedData['cua_hang_id'];
        $voucher->ten_voucher = $validatedData['ten_voucher'];
        $voucher->ma_voucher = $validatedData['ma_voucher'];
        $voucher->thoi_gian_bat_dau = Carbon::parse($validatedData['thoi_gian_bat_dau']);
        $voucher->thoi_gian_ket_thuc = Carbon::parse($validatedData['thoi_gian_ket_thuc']);
        
        $voucher->gia_tri_voucher = $validatedData['gia_tri_voucher'];
        $voucher->kieu_giam_gia = $validatedData['kieu_giam_gia'];
        $voucher->giam_toi_da = $validatedData['giam_toi_da'] ?? 0;
        $voucher->gia_tri_don_toi_thieu = $validatedData['gia_tri_don_toi_thieu'];
        $voucher->so_luong_voucher = $validatedData['so_luong_voucher'];
        $voucher->so_luong_con_lai = $validatedData['so_luong_voucher'];
        
        $voucher->loai = $validatedData['loai'];
        $voucher->so_luong_da_dung = 0;
        
        $now = Carbon::now();
        if ($now->lt($voucher->thoi_gian_bat_dau)) {
            $voucher->trang_thai = 'Sắp diễn ra';
        } else {
            $voucher->trang_thai = 'Đang diễn ra';
        }

        $voucher->save();

        return response()->json(['message' => 'Tạo thành công', 'voucher' => $voucher], 201);
    }

    /**
     * Cập nhật thông tin voucher
     */
    public function update(Request $request, $id)
    {
        $voucher = Voucher::findOrFail($id);
        
        // Kiểm tra quyền sở hữu
        if ($voucher->cua_hang_id != $request->cua_hang_id) {
            return response()->json(['message' => 'Bạn không có quyền sửa voucher này'], 403);
        }

        $status = $voucher->trang_thai;

        if ($status === 'Đã kết thúc') {
            return response()->json(['message' => 'Không thể sửa voucher đã kết thúc'], 400);
        }

        $rules = [
            'ten_voucher' => 'required|string|max:255',
            'thoi_gian_ket_thuc' => 'required|date|after:now',
        ];

        // Nếu sắp diễn ra thì cho sửa nhiều hơn
        if ($status === 'Sắp diễn ra') {
            $rules['thoi_gian_bat_dau'] = 'required|date|after:now';
            $rules['gia_tri_voucher'] = 'required|numeric|min:0';
            $rules['kieu_giam_gia'] = 'required|string|in:phan_tram,so_tien';
            $rules['so_luong_voucher'] = 'required|integer|min:1';
        } else {
            // Đang diễn ra hoặc Tạm dừng
            $rules['so_luong_voucher'] = 'required|integer|min:' . $voucher->so_luong_voucher;
        }

        $validated = $request->validate($rules);

        $voucher->ten_voucher = $validated['ten_voucher'];
        $voucher->thoi_gian_ket_thuc = Carbon::parse($validated['thoi_gian_ket_thuc']);

        if ($status === 'Sắp diễn ra') {
            $voucher->thoi_gian_bat_dau = Carbon::parse($validated['thoi_gian_bat_dau']);
            $voucher->gia_tri_voucher = $validated['gia_tri_voucher'];
            $voucher->kieu_giam_gia = $validated['kieu_giam_gia'];
            $voucher->so_luong_voucher = $validated['so_luong_voucher'];
            $voucher->so_luong_con_lai = $validated['so_luong_voucher'] - $voucher->so_luong_da_dung;
        } else {
            // Chỉ cập nhật số lượng (tăng thêm)
            $diff = $validated['so_luong_voucher'] - $voucher->so_luong_voucher;
            $voucher->so_luong_voucher = $validated['so_luong_voucher'];
            $voucher->so_luong_con_lai += $diff;
        }

        $voucher->save();
        return response()->json(['message' => 'Cập nhật thành công', 'voucher' => $voucher]);
    }

    /**
     * Thay đổi trạng thái (Tạm dừng/Khôi phục)
     */
    public function togglePause(Request $request, $id)
    {
        $voucher = Voucher::findOrFail($id);

        // Kiểm tra quyền sở hữu
        if ($request->has('shop_id') && $voucher->cua_hang_id != $request->shop_id) {
            return response()->json(['message' => 'Bạn không có quyền thao tác trên voucher này'], 403);
        }

        if ($voucher->trang_thai === 'Đã kết thúc') {
            return response()->json(['message' => 'Voucher đã kết thúc'], 400);
        }

        if ($voucher->trang_thai === 'Tạm dừng') {
            // Khôi phục trạng thái dựa trên thời gian
            $now = Carbon::now();
            $start = Carbon::parse($voucher->thoi_gian_bat_dau);
            $voucher->trang_thai = $now->lt($start) ? 'Sắp diễn ra' : 'Đang diễn ra';
        } else {
            $voucher->trang_thai = 'Tạm dừng';
        }

        $voucher->save();
        return response()->json(['message' => 'Đã cập nhật trạng thái', 'trang_thai' => $voucher->trang_thai]);
    }

    /**
     * Kết thúc sớm
     */
    public function endEarly(Request $request, $id)
    {
        $voucher = Voucher::findOrFail($id);

        // Kiểm tra quyền sở hữu
        if ($request->has('shop_id') && $voucher->cua_hang_id != $request->shop_id) {
            return response()->json(['message' => 'Bạn không có quyền kết thúc voucher này'], 403);
        }

        $voucher->thoi_gian_ket_thuc = Carbon::now();
        $voucher->trang_thai = 'Đã kết thúc';
        $voucher->save();

        return response()->json(['message' => 'Đã kết thúc voucher sớm']);
    }
}
