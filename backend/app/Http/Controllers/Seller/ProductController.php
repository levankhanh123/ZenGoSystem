namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\SanPham;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = SanPham::query();

        if ($request->filled('shop_id')) {
            $query->where('cua_hang_id', $request->integer('shop_id'));
        }

        $products = $query->orderByDesc('id')->get()->map(function (SanPham $product) {
            $image = $product->hinh_dai_dien;

            if ($image && ! str_starts_with($image, 'http')) {
                $image = url($image);
            }

            return [
                'id' => $product->id,
                'sku' => $product->sku,
                'name' => $product->ten_san_pham,
                'price' => number_format((float) $product->gia, 0, ',', '.') . 'd',
                'stock' => $product->so_luong_ton,
                'status' => $product->trang_thai ?? 'Hoat dong',
                'image' => $image ?: 'https://via.placeholder.com/50',
                'category_id' => $product->danh_muc_id,
            ];
        });

        return response()->json($products);
    }

    public function destroy($id)
    {
        $product = SanPham::find($id);

        if (! $product) {
            return response()->json(['message' => 'San pham khong ton tai'], 404);
        }

        $product->delete();

        return response()->json(['message' => 'Da xoa san pham thanh cong']);
    }

    public function updateStatus(Request $request, $id)
    {
        $product = SanPham::find($id);

        if (! $product) {
            return response()->json(['message' => 'San pham khong ton tai'], 404);
        }

        $validated = $request->validate([
            'status' => ['required', 'string'],
        ]);

        $product->trang_thai = $validated['status'];
        $product->save();

        return response()->json([
            'message' => 'Cap nhat trang thai thanh cong',
            'product' => $product,
        ]);
    }

    public function updateStock(Request $request, $id)
    {
        $product = SanPham::find($id);

        if (! $product) {
            return response()->json(['message' => 'San pham khong ton tai'], 404);
        }

        $validated = $request->validate([
            'stock' => ['required', 'integer', 'min:0'],
        ]);

        $product->so_luong_ton = $validated['stock'];

        if ($validated['stock'] === 0) {
            $product->trang_thai = 'Hết hàng';
        } elseif ($product->trang_thai === 'Hết hàng') {
            $product->trang_thai = 'Hoạt động';
        }

        $product->save();

        return response()->json([
            'message' => 'Cap nhat ton kho thanh cong',
            'stock' => $product->so_luong_ton,
            'status' => $product->trang_thai,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:200'],
            'sku' => ['required', 'string', 'max:220', 'unique:san_pham,sku'],
            'price' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'description' => ['nullable', 'string'],
            'category_id' => ['required', 'integer', 'exists:danh_muc,id'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,svg', 'max:2048'],
            'shop_id' => ['required', 'integer', 'exists:cua_hang,id'],
        ], [
            'sku.unique' => 'Ma SKU nay da ton tai, vui long chon ma khac.',
            'shop_id.required' => 'Vui long chon cua hang truoc khi dang san pham.',
            'shop_id.exists' => 'Cua hang duoc chon khong hop le.',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('products', 'public');
        }

        $product = new SanPham();
        $product->ten_san_pham = $validated['name'];
        $product->sku = $validated['sku'];
        $product->slug = Str::slug($validated['name']) . '-' . time();
        $product->gia = $validated['price'];
        $product->so_luong_ton = $validated['stock'];
        $product->mo_ta = $validated['description'] ?? null;
        $product->trang_thai = $validated['stock'] > 0 ? 'Hoạt động' : 'Hết hàng';
        $product->cua_hang_id = $validated['shop_id'];
        $product->danh_muc_id = $validated['category_id'];
        $product->khoi_luong = 500;

        if ($imagePath) {
            $product->hinh_dai_dien = '/storage/' . $imagePath;
        }

        $product->save();

        return response()->json([
            'message' => 'Them san pham thanh cong',
            'product' => $product,
        ], 201);
    }
}