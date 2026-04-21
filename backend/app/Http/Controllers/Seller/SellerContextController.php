namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\CuaHang;
use App\Models\NguoiDung;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SellerContextController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $availableUsers = NguoiDung::query()
            ->whereIn('vai_tro', ['nguoi_ban', 'shop', 'nguoi_mua', 'customer'])
            ->where('trang_thai', '!=', 'khoa')
            ->orderBy('ho_ten')
            ->get(['id', 'ho_ten', 'email', 'so_dien_thoai', 'vai_tro', 'trang_thai']);

        $selectedUser = null;
        if ($request->filled('user_id')) {
            $selectedUser = $availableUsers->firstWhere('id', (int) $request->input('user_id'));
        }

        $availableShopsQuery = CuaHang::query()
            ->with('owner:id,ho_ten,email,so_dien_thoai,vai_tro,trang_thai')
            ->orderBy('ten_cua_hang');

        if ($selectedUser) {
            $availableShopsQuery->where('nguoi_ban_id', $selectedUser->id);
        }

        $availableShops = $availableShopsQuery->get([
            'id',
            'nguoi_ban_id',
            'ten_cua_hang',
            'email',
            'so_dien_thoai',
            'dia_chi_lay_hang',
            'logo',
            'trang_thai',
        ]);

        $selectedShop = null;
        if ($request->filled('shop_id')) {
            $selectedShop = $availableShops->firstWhere('id', (int) $request->input('shop_id'));

            if (! $selectedShop) {
                $selectedShop = CuaHang::query()
                    ->with('owner:id,ho_ten,email,so_dien_thoai,vai_tro,trang_thai')
                    ->find($request->integer('shop_id'));
            }
        }

        if (! $selectedShop && $selectedUser) {
            $selectedShop = $availableShops->firstWhere('nguoi_ban_id', $selectedUser->id);
        }

        if (! $selectedShop) {
            $selectedShop = CuaHang::query()
                ->with('owner:id,ho_ten,email,so_dien_thoai,vai_tro,trang_thai')
                ->orderBy('ten_cua_hang')
                ->first([
                    'id',
                    'nguoi_ban_id',
                    'ten_cua_hang',
                    'email',
                    'so_dien_thoai',
                    'dia_chi_lay_hang',
                    'logo',
                    'trang_thai',
                ]);
        }

        if (! $selectedUser && $selectedShop?->owner) {
            $selectedUser = $availableUsers->firstWhere('id', $selectedShop->nguoi_ban_id) ?? $selectedShop->owner;
        }

        if (! $selectedUser) {
            $selectedUser = $availableUsers->first();
        }

        if ($selectedUser && $availableShops->isEmpty()) {
            $availableShops = CuaHang::query()
                ->with('owner:id,ho_ten,email,so_dien_thoai,vai_tro,trang_thai')
                ->where('nguoi_ban_id', $selectedUser->id)
                ->orderBy('ten_cua_hang')
                ->get([
                    'id',
                    'nguoi_ban_id',
                    'ten_cua_hang',
                    'email',
                    'so_dien_thoai',
                    'dia_chi_lay_hang',
                    'logo',
                    'trang_thai',
                ]);
        }

        return response()->json([
            'data' => [
                'selected_user' => $selectedUser,
                'selected_shop' => $selectedShop,
                'available_users' => $availableUsers->values(),
                'available_shops' => $availableShops->values(),
            ],
        ]);
    }
}