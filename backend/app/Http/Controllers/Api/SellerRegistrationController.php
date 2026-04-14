<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class SellerRegistrationController extends Controller
{
    /**
     * Handle the incoming request for Seller Registration.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {
        // For now, since authentication is not fully wired on frontend for testing,
        // we accept user_id from the request.
        $userId = $request->input('user_id', 1);

        $validator = Validator::make($request->all(), [
            'shopName' => 'required|string|max:150',
            'email' => 'required|email|max:150',
            'phone' => 'required|string|max:20',
            'address' => 'required|string',
            'shopAvatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            $nguoiDung = DB::table('nguoi_dung')->where('id', $userId)->first();
            
            if (!$nguoiDung) {
                return response()->json(['error' => 'User not found. Cannot upgrade to seller.'], 404);
            }

            // Upgrade role
            DB::table('nguoi_dung')->where('id', $userId)->update([
                'vai_tro' => 'nguoi_ban',
                'updated_at' => Carbon::now()
            ]);

            // Handle Logo Upload
            $logoPath = null;
            if ($request->hasFile('shopAvatar')) {
                $file = $request->file('shopAvatar');
                $filename = time() . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('public/shops', $filename);
                // Store path correctly for frontend URL access
                $logoPath = str_replace('public/', 'storage/', $path);
            }

            // Create cua_hang record
            $shopId = DB::table('cua_hang')->insertGetId([
                'nguoi_ban_id' => $userId,
                'ten_cua_hang' => $request->input('shopName'),
                'dia_chi_lay_hang' => $request->input('address'),
                'email_shop' => $request->input('email'),
                'sdt_shop' => $request->input('phone'),
                'logo' => $logoPath,
                'trang_thai' => 'cho_duyet',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now()
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Shop registered successfully! Pending approval.',
                'cua_hang_id' => $shopId
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Seller Registration Error: ' . $e->getMessage());
            return response()->json(['error' => 'An error occurred during registration. Please try again later.', 'details' => $e->getMessage()], 500);
        }
    }
}
