<?php
namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\SanPham;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;


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
                'price' => (float)$product->gia,
                'stock' => $product->so_luong_ton,
                'status' => $product->trang_thai ?? 'dang_ban',
                'image' => $image ?: 'https://via.placeholder.com/50',
                'category_id' => $product->danh_muc_id,
                'description' => $product->mo_ta,
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
            $product->trang_thai = 'het_hang';
        } elseif ($product->trang_thai === 'het_hang') {
            $product->trang_thai = 'dang_ban';
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
            'shop_category_id' => ['nullable', 'integer', 'exists:danh_muc_shop,id'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,svg', 'max:5120'],
            'product_images' => ['nullable', 'array'],
            'product_images.*' => ['image', 'mimes:jpeg,png,jpg,gif,svg', 'max:5120'],
            'video' => ['nullable', 'file', 'mimes:mp4,mov,avi,wmv', 'max:20480'], // Max 20MB
            'shop_id' => ['required', 'integer', 'exists:cua_hang,id'],
        ], [
            'sku.unique' => 'Ma SKU nay da ton tai, vui long chon ma khac.',
            'shop_id.required' => 'Vui long chon cua hang truoc khi dang san pham.',
            'shop_id.exists' => 'Cua hang duoc chon khong hop le.',
        ]);

        $imageUrl = null;
        if ($request->hasFile('image')) {
            $upload = Cloudinary::uploadApi()->upload($request->file('image')->getRealPath(), [
                'folder' => 'products/covers'
            ]);
            $imageUrl = $upload['secure_url'];
        }

        $videoUrl = null;
        if ($request->hasFile('video')) {
            $upload = Cloudinary::uploadApi()->upload($request->file('video')->getRealPath(), [
                'folder' => 'products/videos',
                'resource_type' => 'video'
            ]);
            $videoUrl = $upload['secure_url'];
        }

        $product = new SanPham();
        $product->ten_san_pham = $validated['name'];
        $product->sku = $validated['sku'];
        $product->slug = Str::slug($validated['name']) . '-' . time();
        $product->gia = $validated['price'];
        $product->so_luong_ton = $validated['stock'];
        $product->mo_ta = $validated['description'] ?? null;
        $product->trang_thai = $validated['stock'] > 0 ? 'dang_ban' : 'het_hang';
        $product->cua_hang_id = $validated['shop_id'];
        $product->danh_muc_id = $validated['category_id'];
        $product->danh_muc_shop_id = $request->shop_category_id;
        $product->khoi_luong = 500;

        if ($imageUrl) {
            $product->hinh_dai_dien = $imageUrl;
        }
        if ($videoUrl) {
            $product->video_url = $videoUrl;
        }

        $product->save();

        // Handle multiple product images
        if ($request->hasFile('product_images')) {
            foreach ($request->file('product_images') as $file) {
                $upload = Cloudinary::uploadApi()->upload($file->getRealPath(), [
                    'folder' => 'products/gallery'
                ]);
                
                DB::table('hinh_anh_san_pham')->insert([
                    'san_pham_id' => $product->id,
                    'duong_dan_anh' => $upload['secure_url'],
                    'created_at' => now(),
                ]);
            }
        }

        return response()->json([
            'message' => 'Them san pham thanh cong',
            'product' => $product,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $product = SanPham::find($id);

        if (!$product) {
            return response()->json(['message' => 'San pham khong ton tai'], 404);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:200'],
            'price' => ['required', 'numeric', 'min:0'],
            'category_id' => ['required', 'integer', 'exists:danh_muc,id'],
            'description' => ['nullable', 'string'],
        ]);

        $product->ten_san_pham = $validated['name'];
        $product->gia = $validated['price'];
        $product->danh_muc_id = $validated['category_id'];
        $product->mo_ta = $validated['description'];
        
        $product->slug = Str::slug($validated['name']) . '-' . time();
        $product->save();

        return response()->json([
            'message' => 'Cap nhat san pham thanh cong',
            'product' => $product
        ]);
    }
}
