<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CuaHangController;
use App\Http\Controllers\Api\HomepageController;
use App\Http\Controllers\VoucherController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\DanhGiaController;


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// CATEGORY
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/tree', [CategoryController::class, 'tree']);
Route::get('/categories/{slug}', [CategoryController::class, 'show']);

// PRODUCT
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/top-selling', [ProductController::class, 'topSelling']);
Route::get('/products/recommended', [ProductController::class, 'recommended']);
Route::get('/products/{id}/detail', [ProductController::class, 'detail']);
Route::get('/products/{slug}', [ProductController::class, 'show']);


Route::get('/shops',       [CuaHangController::class, 'index']);
Route::get('/shops/top',   [CuaHangController::class, 'top']);
Route::get('/shops/{id}',  [CuaHangController::class, 'show']);

// routes/api.php
Route::get('/vouchers',         [VoucherController::class, 'index']);   // danh sách
Route::get('/vouchers/types',   [VoucherController::class, 'types']);   // lọc loại
Route::get('/vouchers/{id}',    [VoucherController::class, 'show']);    // chi tiết
Route::post('/vouchers/check',  [VoucherController::class, 'check']); 


Route::prefix('v1')->group(function () {

    // Trang chủ
    Route::get('/homepage', [HomepageController::class, 'index']);

    // Sản phẩm
    Route::get('/products',       [ProductController::class, 'index']);
    Route::get('/products/{slug}',[ProductController::class, 'show']);

});

// API cần đăng nhập
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', function (Request $request) {
        return $request->user();
    });
});
Route::middleware('auth:sanctum')->prefix('account')->group(function () {
    // Profile
    Route::get   ('/profile',               [AccountController::class, 'getProfile']);
    Route::put   ('/profile',               [AccountController::class, 'updateProfile']);
    Route::post  ('/profile/avatar',        [AccountController::class, 'updateAvatar']);
    Route::put   ('/profile/password',      [AccountController::class, 'changePassword']);
 
    // Addresses
    Route::get   ('/addresses',             [AccountController::class, 'getAddresses']);
    Route::post  ('/addresses',             [AccountController::class, 'addAddress']);
    Route::put   ('/addresses/{id}',        [AccountController::class, 'updateAddress']);
    Route::delete('/addresses/{id}',        [AccountController::class, 'deleteAddress']);
    Route::patch ('/addresses/{id}/default',[AccountController::class, 'setDefaultAddress']);
 
    // Wallet
    Route::get   ('/wallet',                [AccountController::class, 'getWallet']);
 
    // Orders
    Route::get   ('/orders',                [AccountController::class, 'getOrders']);
    Route::patch ('/orders/{id}/cancel',    [AccountController::class, 'cancelOrder']);
 
    // Notifications
    Route::get   ('/notifications',         [AccountController::class, 'getNotifications']);
    Route::patch ('/notifications/{id}/read', [AccountController::class, 'markRead']);
    Route::patch ('/notifications/read-all',  [AccountController::class, 'markAllRead']);
});
Route::middleware('auth:sanctum')->prefix('cart')->group(function () {
    Route::get('/',              [CartController::class, 'getCart']);
    Route::post('/add',          [CartController::class, 'addToCart']);
    Route::put('/item/{id}',     [CartController::class, 'updateItem']);
    Route::delete('/item/{id}',  [CartController::class, 'removeItem']);
    Route::delete('/clear',      [CartController::class, 'clearCart']);
});
Route::middleware('auth:sanctum')->prefix('reviews')->group(function () {
    Route::post('/', [DanhGiaController::class, 'store']);          // tạo đánh giá
    // Route::get('/product/{san_pham_id}', [DanhGiaController::class, 'getByProduct']); // lấy theo sản phẩm
    Route::put('/{id}', [DanhGiaController::class, 'update']);      // sửa đánh giá
    Route::delete('/{id}', [DanhGiaController::class, 'destroy']);  // xoá
});
Route::get('/reviews/product/{san_pham_id}', [DanhGiaController::class, 'getByProduct']);