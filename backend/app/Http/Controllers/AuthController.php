<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\NguoiDung;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'ho_ten' => 'required|min:3',
            'email' => 'required|email|unique:nguoi_dung,email',
            'so_dien_thoai' => 'nullable',
            'mat_khau' => 'required|min:8'
        ]);

        $user = NguoiDung::create([
            'ho_ten' => $request->ho_ten,
            'email' => $request->email,
            'so_dien_thoai' => $request->so_dien_thoai,
            'mat_khau' => bcrypt($request->mat_khau),
            'vai_tro' => 'user'
        ]);

        // 🎯 tạo token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Đăng ký thành công',
            'token' => $token,
            'user' => $user
        ]);
    }
    public function login(Request $request)
{
    $request->validate([
        'email' => 'required|email',
        'mat_khau' => 'required'
    ]);

    $user = NguoiDung::where('email', $request->email)->first();

    if (!$user) {
        return response()->json([
            'success' => false,
            'message' => 'Email không tồn tại'
        ], 404);
    }

    if (!Hash::check($request->mat_khau, $user->mat_khau)) {
        return response()->json([
            'success' => false,
            'message' => 'Sai mật khẩu'
        ], 401);
    }

    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'success' => true,
        'token' => $token,
        'user' => $user
    ]);
}
}
