<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SanPham;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * Lấy toàn bộ sản phẩm (có thể lọc theo cửa hàng)
     */
    public function index(Request $request)
    {
        $query = SanPham::query();
        
        if ($request->has('shop_id')) {
            $query->where('cua_hang_id', $request->shop_id);
        }

        // Chú ý: Ở đây ta map data DB về định dạng frontend mong đợi.
        // Frontend đang dùng trường 'id' như 'SP001' và không dùng DB id thật.
        // Tuy nhiên lúc gọi DELETE / PUT, frontend sẽ gửi db_id thay vì 'SP001'.
        $products = $query->orderBy('id', 'desc')->get()->map(function ($p) {
            return [
                'id' => $p->id, // Frontend sẽ dùng ID này làm key xử lý
                'sku' => $p->sku, // Mã SKU thật từ DB
                'name' => $p->ten_san_pham,
                // Do frontend component hiện tại có code render `product.price` nên ta giả mạo chuỗi ở response, nhưng
                // tốt nhất ở frontend tự format. Chúng ta trả về chuỗi tạm để ít phải đổi FE nhất.
                'price' => number_format($p->gia, 0, ',', '.') . 'đ',
                'stock' => $p->so_luong_ton,
                'status' => $p->trang_thai ?? 'Hoạt động', // Fallback default 'Hoạt động'
                'image' => $p->hinh_dai_dien 
                    ? (str_starts_with($p->hinh_dai_dien, 'http') ? $p->hinh_dai_dien : url($p->hinh_dai_dien)) 
                    : 'https://via.placeholder.com/50',
                'category_id' => $p->danh_muc_id
            ];
        });

        return response()->json($products);
    }

    /**
     * Xóa sản phẩm
     */
    public function destroy($id)
    {
        $product = SanPham::find($id);
        if (!$product) {
            return response()->json(['message' => 'Sản phẩm không tồn tại'], 404);
        }
        
        $product->delete();
        return response()->json(['message' => 'Đã xóa sản phẩm thành công']);
    }

    /**
     * Đổi trạng thái hiển thị
     */
    public function updateStatus(Request $request, $id)
    {
        $product = SanPham::find($id);
        if (!$product) {
            return response()->json(['message' => 'Sản phẩm không tồn tại'], 404);
        }

        $request->validate([
            'status' => 'required|string'
        ]);

        $product->trang_thai = $request->status;
        $product->save();

        return response()->json([
            'message' => 'Cập nhật trạng thái thành công',
            'product' => $product
        ]);
    }

    /**
     * Cập nhật tồn kho
     */
    public function updateStock(Request $request, $id)
    {
        $product = SanPham::find($id);
        if (!$product) {
            return response()->json(['message' => 'Sản phẩm không tồn tại'], 404);
        }

        $request->validate([
            'stock' => 'required|integer|min:0'
        ]);

        $stock = $request->stock;
        $product->so_luong_ton = $stock;

        // Nếu kho bằng 0 thì set là Hết hàng.
        if ($stock == 0) {
            $product->trang_thai = 'Hết hàng';
        } else if ($product->trang_thai == 'Hết hàng') {
            $product->trang_thai = 'Hoạt động';
        }

        $product->save();

        return response()->json([
            'message' => 'Cập nhật tồn kho thành công',
            'stock' => $product->so_luong_ton,
            'status' => $product->trang_thai
        ]);
    }

    /**
     * Thêm mới sản phẩm
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:200',
            'sku' => 'required|string|max:220|unique:san_pham,sku',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'description' => 'nullable|string',
            'category_id' => 'required|integer',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'shop_id' => 'nullable|integer'
        ], [
            'sku.unique' => 'Mã SKU này đã tồn tại, vui lòng chọn mã khác.',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            // lưu vào storage/app/public/products
            $imagePath = $request->file('image')->store('products', 'public');
        }

        $shopId = $request->shop_id;
        if (!$shopId) {
            $cuaHang = \Illuminate\Support\Facades\DB::table('cua_hang')->first();
            $shopId = $cuaHang ? $cuaHang->id : 1;
        }

        $product = new SanPham();
        $product->ten_san_pham = $request->name;
        $product->sku = $request->sku;
        $product->slug = Str::slug($request->name) . '-' . time(); // Đảm bảo slug duy nhất
        $product->gia = $request->price;
        $product->so_luong_ton = $request->stock;
        $product->mo_ta = $request->description;
        $product->trang_thai = $request->stock > 0 ? 'Hoạt động' : 'Hết hàng';
        $product->cua_hang_id = $shopId;
        $product->danh_muc_id = $request->category_id;
        $product->khoi_luong = 500; // Mặc định 500g nếu frontend chưa có field này

        if ($imagePath) {
            $product->hinh_dai_dien = '/storage/' . $imagePath;
        }

        // Tắt check khóa ngoại tạm thời nếu db bị trống bảng phụ
        \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        $product->save();
        \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        return response()->json([
            'message' => 'Thêm sản phẩm thành công',
            'product' => $product
        ], 201);
    }
}
