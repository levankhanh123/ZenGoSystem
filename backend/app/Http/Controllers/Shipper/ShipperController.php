<?php

namespace App\Http\Controllers\Shipper;

use App\Http\Controllers\Controller;
use App\Models\GiaoHang;
use App\Models\DonHang;
use App\Models\NguoiDung;
use App\Models\DoiSoatShipper;
use App\Models\ThongBao;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ShipperController extends Controller
{
    /**
     * Dashboard chính cho Shipper
     */
    public function dashboard()
    {
        $shipper = Auth::user();
        
        $stats = [
            'tong_don_hom_nay' => GiaoHang::whereDate('created_at', today())
                ->where('nguoi_giao_hang_id', $shipper->id)
                ->count(),
            
            'don_da_giao' => GiaoHang::whereDate('created_at', today())
                ->where('nguoi_giao_hang_id', $shipper->id)
                ->where('trang_thai', 'delivered')
                ->count(),
            
            'doanh_thu_hom_nay' => GiaoHang::whereDate('created_at', today())
                ->where('nguoi_giao_hang_id', $shipper->id)
                ->join('don_hang', 'giao_hang.don_hang_id', '=', 'don_hang.id')
                ->sum('don_hang.phi_giao_hang') ?? 0,
            
            'don_cho_giao' => GiaoHang::where('nguoi_giao_hang_id', $shipper->id)
                ->whereIn('trang_thai', ['pending', 'confirmed', 'picking_up'])
                ->count(),
        ];
        
        $recentOrders = GiaoHang::where('nguoi_giao_hang_id', $shipper->id)
            ->with('order')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();
        
        return view('shipper.dashboard', compact('shipper', 'stats', 'recentOrders'));
    }

    /**
     * Danh sách tất cả đơn hàng của Shipper
     */
    public function listOrders(Request $request)
    {
        $shipper = Auth::user();
        $query = GiaoHang::where('nguoi_giao_hang_id', $shipper->id)->with('order');
        
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
            $query->whereHas('order', function ($q) use ($search) {
                $q->where('ma_don_hang', 'like', "%$search%");
            });
        }
        
        $orders = $query->orderBy('created_at', 'desc')->paginate(15);
        
        return view('shipper.orders.list', compact('orders'));
    }

    /**
     * Chi tiết một đơn hàng
     */
    public function orderDetail($id)
    {
        $shipper = Auth::user();
        $giao_hang = GiaoHang::findOrFail($id);
        
        // Kiểm quyền
        if ($giao_hang->nguoi_giao_hang_id != $shipper->id) {
            abort(403, 'Unauthorized');
        }
        
        $giao_hang->load('order.buyer', 'order.shop');
        
        return view('shipper.orders.detail', compact('giao_hang'));
    }

    /**
     * Cập nhật trạng thái đơn hàng
     */
    public function updateStatus(Request $request, $id)
    {
        $shipper = Auth::user();
        $giao_hang = GiaoHang::findOrFail($id);
        
        if ($giao_hang->nguoi_giao_hang_id != $shipper->id) {
            abort(403, 'Unauthorized');
        }
        
        $validated = $request->validate([
            'trang_thai' => 'required|in:pending,confirmed,picking_up,picked_up,in_transit,delivering,delivered,failed,returned,cancelled',
            'ghi_chu' => 'nullable|string|max:500',
            'ly_do_that_bai' => 'nullable|string|max:500',
            'so_lan_giao_lai' => 'nullable|integer|min:0',
        ]);
        
        $old_status = $giao_hang->trang_thai;
        $giao_hang->update($validated);
        
        // Record tracking
        LichSuTrangThaiDonHang::create([
            'don_hang_id' => $giao_hang->don_hang_id,
            'trang_thai_cu' => $old_status,
            'trang_thai_moi' => $validated['trang_thai'],
            'ghi_chu' => $validated['ghi_chu'] ?? null,
            'nguoi_cap_nhat_id' => $shipper->id,
        ]);
        
        // Notify customer
        ThongBao::create([
            'nguoi_dung_id' => $giao_hang->order->nguoi_mua_id,
            'tieu_de' => 'Cập nhật trạng thái đơn hàng',
            'noi_dung' => "Đơn hàng {$giao_hang->order->ma_don_hang} đã được cập nhật: {$validated['trang_thai']}",
            'loai' => 'order',
            'don_hang_id' => $giao_hang->don_hang_id,
        ]);
        
        return redirect()->back()->with('success', 'Cập nhật trạng thái thành công');
    }

    /**
     * Quản lý tài khoản Shipper
     */
    public function accountManagement()
    {
        $shipper = Auth::user();
        
        return view('shipper.account.profile', compact('shipper'));
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
            'anh_dai_dien' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);
        
        if ($request->hasFile('anh_dai_dien')) {
            $file = $request->file('anh_dai_dien');
            $path = $file->store('avatars/shippers', 'public');
            $validated['anh_dai_dien'] = $path;
        }
        
        $shipper->update($validated);
        
        return redirect()->back()->with('success', 'Cập nhật tài khoản thành công');
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
            return redirect()->back()->withErrors(['mat_khau_cu' => 'Mật khẩu cũ không chính xác']);
        }
        
        $shipper->update(['mat_khau' => \Hash::make($validated['mat_khau_moi'])]);
        
        return redirect()->back()->with('success', 'Đổi mật khẩu thành công');
    }

    /**
     * Trang đối soát (reconciliation)
     */
    public function reconciliation(Request $request)
    {
        $shipper = Auth::user();
        
        $query = DoiSoatShipper::where('nguoi_giao_hang_id', $shipper->id);
        
        // Filter by date range
        if ($request->has('from_date') && $request->from_date) {
            $query->whereDate('ngay_tao', '>=', $request->from_date);
        }
        
        if ($request->has('to_date') && $request->to_date) {
            $query->whereDate('ngay_tao', '<=', $request->to_date);
        }
        
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
            'tong_con_no' => DoiSoatShipper::where('nguoi_giao_hang_id', $shipper->id)
                ->where('trang_thai', 'completed')
                ->sum('tien_phai_tra') ?? 0 - (DoiSoatShipper::where('nguoi_giao_hang_id', $shipper->id)
                ->where('trang_thai', 'paid')
                ->sum('tien_phai_tra') ?? 0),
        ];
        
        return view('shipper.reconciliation.index', compact('records', 'summary'));
    }

    /**
     * Chi tiết đối soát
     */
    public function reconciliationDetail($id)
    {
        $shipper = Auth::user();
        $record = DoiSoatShipper::findOrFail($id);
        
        if ($record->nguoi_giao_hang_id != $shipper->id) {
            abort(403, 'Unauthorized');
        }
        
        $record->load('shipper', 'giao_hang.order');
        
        return view('shipper.reconciliation.detail', compact('record'));
    }

    /**
     * Lịch sử giao hàng
     */
    public function history(Request $request)
    {
        $shipper = Auth::user();
        
        $query = GiaoHang::where('nguoi_giao_hang_id', $shipper->id)
            ->whereIn('trang_thai', ['delivered', 'failed', 'returned', 'cancelled'])
            ->with('order');
        
        // Date filter
        if ($request->has('month') && $request->month) {
            $query->whereMonth('ngay_giao_thuc_te', $request->month);
        }
        
        if ($request->has('year') && $request->year) {
            $query->whereYear('ngay_giao_thuc_te', $request->year);
        }
        
        $history = $query->orderBy('ngay_giao_thuc_te', 'desc')->paginate(20);
        
        return view('shipper.history.index', compact('history'));
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
                ->where('trang_thai', 'delivered')
                ->count(),
            'tong_don_that_bai' => GiaoHang::where('nguoi_giao_hang_id', $shipper->id)
                ->where('trang_thai', 'failed')
                ->count(),
            'ty_le_thanh_cong' => 0, // Tính toán bên dưới
            'trung_binh_danh_gia' => 0, // Tính toán từ ratings
            'doanh_thu_thang_nay' => 0, // Tính toán từ completed deliveries
        ];
        
        if ($stats['tong_so_don_giao'] > 0) {
            $stats['ty_le_thanh_cong'] = ($stats['tong_don_thanh_cong'] / $stats['tong_so_don_giao']) * 100;
        }
        
        return view('shipper.statistics', compact('stats', 'shipper'));
    }
}
