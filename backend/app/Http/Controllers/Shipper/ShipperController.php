<?php

namespace App\Http\Controllers\Shipper;

use App\Http\Controllers\Controller;
use App\Models\GiaoHang;
use App\Models\DonHang;
use App\Models\NguoiDung;
use App\Models\DoiSoatShipper;
use App\Models\ThongBao;
use App\Models\LichSuTrangThaiDonHang;
use App\Models\ViTien;
use App\Models\NhatKyTaiChinh;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;


class ShipperController extends Controller
{
    /**
     * Dashboard chính cho Shipper
     */
    public function dashboard()
    {
        $shipper = Auth::user()->load('shipperProfile');
        $districtId = $shipper->shipperProfile?->district_id;
        
        // 1. Đơn trong vùng (Zone Orders)
        // Những đơn đang Chờ lấy hàng và thuộc Quận của shipper
        $zoneOrders = GiaoHang::where('trang_thai', 'cho_lay_hang')
            ->where(function($q) use ($shipper, $districtId) {
                // Đã gán cho shipper này HOẶC chưa gán ai nhưng cùng quận (Lấy hàng hoặc Giao hàng)
                $q->where('nguoi_giao_hang_id', $shipper->id)
                  ->orWhere(function($sq) use ($districtId) {
                      $sq->whereNull('nguoi_giao_hang_id')
                         ->where(function($ssq) use ($districtId) {
                             $ssq->whereHas('order.cuaHang', function($shopQ) use ($districtId) {
                                 $shopQ->where('district_id', $districtId);
                             })->orWhereHas('order', function($orderQ) use ($districtId) {
                                 $orderQ->where('district_id', $districtId);
                             });
                         });
                  });
            })
            ->with(['order.cuaHang', 'order.buyer'])
            ->orderBy('created_at', 'desc')
            ->get();
            
        // 2. Đang xử lý (In Progress)
        $processingOrders = GiaoHang::where('nguoi_giao_hang_id', $shipper->id)
            ->whereIn('trang_thai', ['dang_lay_hang', 'da_lay_hang', 'dang_giao'])
            ->with(['order.cuaHang', 'order.buyer'])
            ->orderBy('updated_at', 'desc')
            ->get();
            
        // 3. Lịch sử (History)
        $historyOrders = GiaoHang::where('nguoi_giao_hang_id', $shipper->id)
            ->whereIn('trang_thai', ['da_giao', 'giao_that_bai', 'da_tra_hang', 'da_huy'])
            ->with(['order.cuaHang', 'order.buyer'])
            ->orderBy('updated_at', 'desc')
            ->limit(20)
            ->get();
        
        return response()->json([
            'shipper' => $shipper,
            'zoneOrders' => $zoneOrders,
            'processingOrders' => $processingOrders,
            'historyOrders' => $historyOrders,
            'stats' => [
                'cho_lay_hang' => $zoneOrders->count(),
                'dang_xu_ly' => $processingOrders->count(),
                'da_giao' => GiaoHang::where('nguoi_giao_hang_id', $shipper->id)->where('trang_thai', 'da_giao')->count(),
            ]
        ]);
    }

    /**
     * Danh sách tất cả đơn hàng của Shipper
     */
    public function listOrders(Request $request)
    {
        $shipper = Auth::user();
        $query = GiaoHang::where('nguoi_giao_hang_id', $shipper->id)
            ->with(['order.cuaHang', 'order.buyer']);
        
        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('trang_thai', $request->status);
        }
        
        // Filter by date
        if ($request->has('date') && $request->date) {
            $query->whereDate('created_at', $request->date);
        }
        
        // Search by order code
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('ma_van_don', 'like', "%$search%")
                  ->orWhereHas('order', function ($sq) use ($search) {
                      $sq->where('ma_don_hang', 'like', "%$search%");
                  });
            });
        }
        
        $orders = $query->orderBy('created_at', 'desc')->paginate(15);
        
        return response()->json($orders);
    }

    /**
     * Chi tiết một đơn hàng
     */
    public function orderDetail($id)
    {
        $shipper = Auth::user();
        $giao_hang = GiaoHang::with(['order.buyer', 'order.shop', 'order.chiTietDonHangs.sanPhamBienThe.sanPham'])
            ->findOrFail($id);
        
        // Kiểm quyền
        if ($giao_hang->nguoi_giao_hang_id != $shipper->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        return response()->json($giao_hang);
    }

    /**
     * Cập nhật trạng thái đơn hàng
     */
    public function updateStatus(Request $request, $id)
    {
        $shipper = Auth::user();
        $giao_hang = GiaoHang::findOrFail($id);
        
        if ($giao_hang->nguoi_giao_hang_id != $shipper->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $validated = $request->validate([
            'trang_thai' => 'required|in:cho_lay_hang,dang_lay_hang,da_lay_hang,dang_giao,da_giao,giao_that_bai,da_tra_hang,da_huy',
            'ghi_chu' => 'nullable|string|max:500',
            'ly_do_that_bai' => 'nullable|string|max:500',
            'so_lan_giao_lai' => 'nullable|integer|min:0',
            'anh_xac_nhan' => 'nullable|string' // URL from Cloudinary (frontend upload)
        ]);
        
        $old_status = $giao_hang->trang_thai;
        
        // Nếu giao thành công, cập nhật ngày giao thực tế
        if ($validated['trang_thai'] === 'da_giao') {
            $giao_hang->ngay_giao_thuc_te = now();
        }

        // Xử lý logic giao lại (Retry Workflow)
        if ($validated['trang_thai'] === 'giao_that_bai') {
            $giao_hang->increment('so_lan_giao_lai');
            $currentAttempts = $giao_hang->so_lan_giao_lai;
            
            // Nếu chưa quá 3 lần và lý do không phải là khách từ chối nhận (Boom hàng)
            if ($currentAttempts < 3 && ($validated['ly_do_that_bai'] ?? '') !== 'Khách từ chối nhận hàng') {
                $validated['trang_thai'] = 'dang_giao'; // Vẫn giữ đang giao để Shipper thấy trong tab Đang xử lý
                $validated['sub_status'] = 'cho_giao_lai';
            } else {
                // Thất bại vĩnh viễn
                $validated['sub_status'] = 'that_bai_vinh_vien';
            }
        } else {
            // Nếu chuyển sang trạng thái khác (da_giao, etc), xóa sub_status
            $validated['sub_status'] = null;
        }
        
        $giao_hang->update($validated);
        
        // Đồng bộ trạng thái sang DonHang nếu cần
        $orderStatusMap = [
            'dang_giao' => 'dang_giao',
            'da_giao' => 'da_giao',
            'da_huy' => 'da_huy',
            'giao_that_bai' => 'that_bai', // Lúc này mới thực sự chuyển sang Thất bại trên app Buyer
        ];
        
        if (isset($orderStatusMap[$validated['trang_thai']])) {
            $giao_hang->order->update(['trang_thai_don_hang' => $orderStatusMap[$validated['trang_thai']]]);
        }
        
        // Financial logic for da_giao
        if ($validated['trang_thai'] === 'da_giao' && $old_status !== 'da_giao') {
            DB::transaction(function () use ($giao_hang) {
                $this->processCompletionFinancials($giao_hang);
            });
        }
        
        // Record tracking
        LichSuTrangThaiDonHang::create([
            'don_hang_id' => $giao_hang->don_hang_id,
            'trang_thai_cu' => $old_status,
            'trang_thai_moi' => $validated['trang_thai'],
            'ghi_chu' => $validated['ghi_chu'] ?? null,
            'nguoi_cap_nhat_id' => $shipper->id,
        ]);
        
        // Notify customer
        try {
            ThongBao::create([
                'nguoi_dung_id' => $giao_hang->order->nguoi_mua_id,
                'tieu_de' => 'Cập nhật trạng thái đơn hàng',
                'noi_dung' => "Đơn hàng {$giao_hang->order->ma_don_hang} đã được cập nhật: {$validated['trang_thai']}",
                'loai' => 'order',
                'don_hang_id' => $giao_hang->don_hang_id,
            ]);
        } catch (\Exception $e) {
            // Log error but continue
        }
        
        return response()->json([
            'message' => 'Cập nhật trạng thái thành công',
            'giao_hang' => $giao_hang
        ]);
    }

    /**
     * Quản lý tài khoản Shipper
     */
    public function accountManagement()
    {
        $shipper = Auth::user();
        return response()->json($shipper);
    }

    /**
     * Cập nhật thông tin tài khoản
     */
    public function updateAccount(Request $request)
    {
        $shipper = Auth::user();
        
        $validated = $request->validate([
            'ho_ten' => 'required|string|max:100',
            'so_dien_thoai' => 'required|string|max:15|unique:nguoi_dung,so_dien_thoai,' . $shipper->id,
            'email' => 'required|email|unique:nguoi_dung,email,' . $shipper->id,
            'dia_chi' => 'required|string|max:500',
            'anh_dai_dien' => 'nullable|string', // Support URL directly for simpler SPA
        ]);
        
        $shipper->update($validated);
        
        return response()->json([
            'message' => 'Cập nhật tài khoản thành công',
            'shipper' => $shipper
        ]);
    }

    /**
     * Đổi mật khẩu
     */
    public function changePassword(Request $request)
    {
        $validated = $request->validate([
            'mat_khau_cu' => 'required|string|min:6',
            'mat_khau_moi' => 'required|string|min:6|confirmed',
        ]);
        
        $shipper = Auth::user();
        
        if (!\Hash::check($validated['mat_khau_cu'], $shipper->mat_khau)) {
            return response()->json(['message' => 'Mật khẩu cũ không chính xác'], 400);
        }
        
        $shipper->update(['mat_khau' => \Hash::make($validated['mat_khau_moi'])]);
        
        return response()->json(['message' => 'Đổi mật khẩu thành công']);
    }

    /**
     * Trang đối soát (reconciliation)
     */
    public function reconciliation(Request $request)
    {
        $shipper = Auth::user();
        
        $query = DoiSoatShipper::where('nguoi_giao_hang_id', $shipper->id);
        
        // Filter by status
        if ($request->has('trang_thai') && $request->trang_thai) {
            $query->where('trang_thai', $request->trang_thai);
        }
        
        $records = $query->orderBy('ngay_tao', 'desc')->paginate(20);
        
        $summary = [
            'tong_doanh_thu' => DoiSoatShipper::where('nguoi_giao_hang_id', $shipper->id)
                ->where('trang_thai', 'completed')
                ->sum('tien_phai_tra') ?? 0,
            'tong_da_nhan' => DoiSoatShipper::where('nguoi_giao_hang_id', $shipper->id)
                ->where('trang_thai', 'paid')
                ->sum('tien_phai_tra') ?? 0,
        ];
        
        return response()->json([
            'records' => $records,
            'summary' => $summary
        ]);
    }

    /**
     * Chi tiết đối soát
     */
    public function reconciliationDetail($id)
    {
        $shipper = Auth::user();
        $record = DoiSoatShipper::with(['giao_hang.order'])->findOrFail($id);
        
        if ($record->nguoi_giao_hang_id != $shipper->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        return response()->json($record);
    }

    /**
     * Lịch sử giao hàng
     */
    public function history(Request $request)
    {
        $shipper = Auth::user();
        
        $query = GiaoHang::where('nguoi_giao_hang_id', $shipper->id)
            ->whereIn('trang_thai', ['da_giao', 'giao_that_bai', 'da_tra_hang', 'da_huy'])
            ->with('order');
        
        $history = $query->orderBy('ngay_giao_thuc_te', 'desc')->paginate(20);
        
        return response()->json($history);
    }

    /**
     * Thống kê hiệu suất
     */
    public function statistics()
    {
        $shipper = Auth::user();
        
        $stats = [
            'tong_so_don_giao' => GiaoHang::where('nguoi_giao_hang_id', $shipper->id)->count(),
            'tong_don_thanh_cong' => GiaoHang::where('nguoi_giao_hang_id', $shipper->id)
                ->where('trang_thai', 'da_giao')
                ->count(),
            'tong_don_that_bai' => GiaoHang::where('nguoi_giao_hang_id', $shipper->id)
                ->where('trang_thai', 'giao_that_bai')
                ->count(),
            'ty_le_thanh_cong' => 0,
        ];
        
        if ($stats['tong_so_don_giao'] > 0) {
            $stats['ty_le_thanh_cong'] = round(($stats['tong_don_thanh_cong'] / $stats['tong_so_don_giao']) * 100, 2);
        }
        
        return response()->json($stats);
    }

    /**
     * Nhận đơn hàng mới (từ Tab Đơn trong vùng)
     */
    public function receiveOrder($id)
    {
        $shipper = Auth::user();
        
        // Check capacity
        $profile = $shipper->shipperProfile;
        $maxCapacity = $profile->suc_chua_don_hang ?? 5;
        
        $activeCount = GiaoHang::where('nguoi_giao_hang_id', $shipper->id)
            ->whereIn('trang_thai', ['cho_lay_hang', 'dang_lay_hang', 'dang_giao'])
            ->count();
            
        if ($activeCount >= $maxCapacity) {
            return response()->json(['message' => "Bạn đã đạt giới hạn {$maxCapacity} đơn hàng đang xử lý. Vui lòng hoàn thành các đơn cũ trước khi nhận mới."], 400);
        }

        $giao_hang = GiaoHang::findOrFail($id);
        
        if ($giao_hang->nguoi_giao_hang_id != null && $giao_hang->nguoi_giao_hang_id != $shipper->id) {
            return response()->json(['message' => 'Đơn hàng đã có người khác nhận'], 400);
        }
        
        $giao_hang->update([
            'nguoi_giao_hang_id' => $shipper->id,
            'ngay_nhan_don' => now(),
            'trang_thai' => 'dang_lay_hang' // "Shipper đang đến lấy"
        ]);
        
        return response()->json([
            'message' => 'Nhận đơn thành công',
            'giao_hang' => $giao_hang
        ]);
    }

    /**
     * Xử lý tài chính khi giao hàng thành công
     */
    private function processCompletionFinancials($giao_hang)
    {
        $order = $giao_hang->order;
        if (!$order) return;

        $shop = $order->shop;
        $shipper = Auth::user();
        $isCOD = ($order->phuong_thuc_thanh_toan === 'cod');

        // 1. Phân bổ Tiền Sản Phẩm (Đã trừ 5% hoa hồng)
        $productTotal = $order->tong_tien - $order->phi_giao_hang;
        $commission = $productTotal * 0.05;
        $sellerAmount = $productTotal - $commission;

        if ($sellerAmount > 0 && $shop) {
            $sellerWallet = ViTien::firstOrCreate(['nguoi_dung_id' => $shop->nguoi_ban_id]);
            
            if ($isCOD) {
                // Nếu COD, tiền vào trạng thái "Chờ về" (đóng băng)
                $sellerWallet->increment('so_du', $sellerAmount);
                $sellerWallet->increment('so_du_dong_bang', $sellerAmount);
                $moTa = "Tiền chờ về từ đơn COD #{$order->ma_don_hang} (Đã trừ 5% hoa hồng)";
            } else {
                // Nếu đã thanh toán trước (ZaloPay...), tiền vào thẳng số dư khả dụng
                $sellerWallet->increment('so_du', $sellerAmount);
                $moTa = "Thu nhập từ đơn hàng #{$order->ma_don_hang} (Đã trừ 5% hoa hồng)";
            }
            
            NhatKyTaiChinh::create([
                'loai' => 'thu_nhap_ban_hang',
                'doi_tuong' => "order:{$order->id}",
                'noi_dung' => $moTa,
                'so_tien' => $sellerAmount,
                'created_at' => now(),
            ]);
        }

        // 2. Phí Ship cho Shipper (Luôn cộng vào số dư khả dụng)
        $shipperAmount = $order->phi_giao_hang;
        if ($shipperAmount > 0) {
            $shipperWallet = ViTien::firstOrCreate(['nguoi_dung_id' => $shipper->id]);
            $shipperWallet->increment('so_du', $shipperAmount);
            
            NhatKyTaiChinh::create([
                'loai' => 'thu_nhap_giao_hang',
                'doi_tuong' => "delivery:{$giao_hang->id}",
                'noi_dung' => "Phí giao hàng từ đơn #{$order->ma_don_hang}",
                'so_tien' => $shipperAmount,
                'created_at' => now(),
            ]);
        }

        // 3. Ghi nhận Công nợ Shipper (Nếu là COD)
        if ($isCOD) {
            $profile = $shipper->shipperProfile;
            if ($profile) {
                // Shipper nợ sàn số tiền mặt đã thu từ khách (bằng giá trị sản phẩm)
                $profile->increment('cong_no_hien_tai', $productTotal);
            }

            // Tạo bản ghi đối soát để Admin theo dõi
            DoiSoatShipper::create([
                'ma_doi_soat_shipper' => 'DS' . strtoupper(\Illuminate\Support\Str::random(8)),
                'shipper_id' => $shipper->id,
                'giao_hang_id' => $giao_hang->id,
                'cod_da_thu' => $productTotal,
                'so_tien_nguoi_ban' => $sellerAmount,
                'so_tien_hoa_hong' => $commission,
                'cod_da_nop' => 0,
                'cod_con_thieu' => $productTotal,
                'phi_giao_hang_duoc_huong' => $shipperAmount,
                'cong_no' => $productTotal,
                'trang_thai_cong_no' => 'pending',
                'ngay_cap_nhat' => now(),
                'ghi_chu' => "Đối soát đơn COD #{$order->ma_don_hang}",
            ]);
        }

        // 4. Cập nhật trạng thái thanh toán đơn hàng
        $order->update(['trang_thai_thanh_toan' => 'da_thanh_toan']);
    }
}
