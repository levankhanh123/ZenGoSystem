<?php
namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\CuaHang;
use App\Models\NguoiDung;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

class RegistrationController extends Controller
{
    public function register(Request $request)
    {
        Log::info('Seller Registration Attempt', $request->all());

        $validator = Validator::make($request->all(), [
            'user_id' => ['required', 'integer', 'exists:nguoi_dung,id'],
            'shopName' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:150'],
            'phone' => ['required', 'string', 'max:20'],
            'address' => ['required', 'string'],
            'shopAvatar' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
        ]);

        if ($validator->fails()) {
            Log::warning('Seller Registration Validation Failed', $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();
            $userId = $request->integer('user_id');

            $nguoiDung = NguoiDung::query()->find($userId);

            if (! $nguoiDung) {
                DB::rollBack();

                return response()->json(['error' => 'User not found. Cannot upgrade to seller.'], 404);
            }

            NguoiDung::query()->whereKey($userId)->update([
                'vai_tro' => 'seller',
                'updated_at' => Carbon::now(),
            ]);

            $logoUrl = null;
            if ($request->hasFile('shopAvatar')) {
                $upload = Cloudinary::uploadApi()->upload($request->file('shopAvatar')->getRealPath(), [
                    'folder' => 'shops'
                ]);
                $logoUrl = $upload['secure_url'];
            }

            $existingShop = CuaHang::query()->where('nguoi_ban_id', $userId)->first();
            $shopStatus = $existingShop && $existingShop->trang_thai === 'da_duyet'
                ? $existingShop->trang_thai
                : 'cho_duyet';

            $shop = CuaHang::query()->updateOrCreate(
                ['nguoi_ban_id' => $userId],
                [
                    'ten_cua_hang' => $request->string('shopName')->toString(),
                    'dia_chi_lay_hang' => $request->string('address')->toString(),
                    'email' => $request->string('email')->toString(),
                    'so_dien_thoai' => $request->string('phone')->toString(),
                    'email_shop' => $request->string('email')->toString(), // Thêm cột này
                    'sdt_shop' => $request->string('phone')->toString(),   // Thêm cột này
                    'logo' => $logoUrl ?? $existingShop?->logo,
                    'trang_thai' => $shopStatus,
                    'updated_at' => Carbon::now(),
                ]
            );

            DB::commit();

            return response()->json([
                'message' => $existingShop
                    ? 'Shop information updated successfully.'
                    : 'Shop registered successfully! Pending approval.',
                'details' => 'Created/Updated shop ID: ' . $shop->id,
                'cua_hang_id' => $shop->id,
            ], $existingShop ? 200 : 201);
        } catch (\Throwable $exception) {
            DB::rollBack();
            Log::error('Seller registration error', ['message' => $exception->getMessage()]);

            return response()->json([
                'error' => 'An error occurred during registration. Please try again later.',
                'details' => $exception->getMessage(),
            ], 500);
        }
    }
}
