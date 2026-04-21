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
        
        $campaigns = ChienDich::with(['vouchers' => function($query) {
                $query->where('loai', 'san');
            }])
            ->where('trang_thai', 'dang_dien_ra')
            ->where('ngay_ket_thuc', '>=', now())
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
                'ma_chien_dich' => $campaign->ma_chien_dich,
                'ten_chien_dich' => $campaign->ten_chien_dich,
                'mo_ta' => $campaign->mo_ta,
                'ngay_bat_dau' => $campaign->ngay_bat_dau,
                'ngay_ket_thuc' => $campaign->ngay_ket_thuc,
                'registration' => $registration,
                'vouchers' => $campaign->vouchers
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
            'campaign_id' => 'required|exists:chien_dich,id',
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
