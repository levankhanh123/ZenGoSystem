<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Buyer\CategoryController;
use App\Http\Controllers\Buyer\ProductController;
use App\Http\Controllers\Buyer\CuaHangController;
use App\Http\Controllers\Buyer\VoucherController;
use App\Http\Controllers\Buyer\AccountController;
use App\Http\Controllers\Buyer\CartController;
use App\Http\Controllers\Buyer\DanhGiaController;
use App\Http\Controllers\Buyer\HomepageController;
use App\Http\Controllers\Buyer\NotificationController;

/*
|--------------------------------------------------------------------------
| Buyer Routes
|--------------------------------------------------------------------------
*/

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

// SHOP
Route::get('/shops',       [CuaHangController::class, 'index']);
Route::get('/shops/top',   [CuaHangController::class, 'top']);
Route::get('/shops/{id}',  [CuaHangController::class, 'show']);

// VOUCHER
Route::get('/vouchers',         [VoucherController::class, 'index']);
Route::get('/vouchers/types',   [VoucherController::class, 'types']);
Route::get('/vouchers/{id}',    [VoucherController::class, 'show']);
Route::post('/vouchers/check',  [VoucherController::class, 'check']);
Route::get('/vouchers/shop/{cua_hang_id}', [VoucherController::class, 'getShopVouchers']);

// NOTIFICATION
Route::get('/notifications/{nguoi_dung_id}', [NotificationController::class, 'index']);
Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);

// Trang chủ v1
Route::prefix('v1')->group(function () {
    Route::get('/homepage', [HomepageController::class, 'index']);
});

// API cần đăng nhập (Buyer)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', function (\Illuminate\Http\Request $request) {
        return $request->user();
    });

    Route::prefix('account')->group(function () {
        Route::get   ('/profile',               [AccountController::class, 'getProfile']);
        Route::put   ('/profile',               [AccountController::class, 'updateProfile']);
        Route::post  ('/profile/avatar',        [AccountController::class, 'updateAvatar']);
        Route::put   ('/profile/password',      [AccountController::class, 'changePassword']);
        Route::get   ('/addresses',             [AccountController::class, 'getAddresses']);
        Route::post  ('/addresses',             [AccountController::class, 'addAddress']);
        Route::put   ('/addresses/{id}',        [AccountController::class, 'updateAddress']);
        Route::delete('/addresses/{id}',        [AccountController::class, 'deleteAddress']);
        Route::patch ('/addresses/{id}/default',[AccountController::class, 'setDefaultAddress']);
        Route::get   ('/wallet',                [AccountController::class, 'getWallet']);
        Route::get   ('/orders',                [AccountController::class, 'getOrders']);
        Route::post  ('/orders',                [AccountController::class, 'placeOrder']);
        Route::get   ('/orders/{id}/status',    [AccountController::class, 'getOrderStatus']);
        Route::post  ('/orders/{id}/repay',     [AccountController::class, 'repayOrder']);
        Route::patch ('/orders/{id}/cancel',    [AccountController::class, 'cancelOrder']);
        Route::get   ('/notifications',         [AccountController::class, 'getNotifications']);
        Route::patch ('/notifications/{id}/read', [AccountController::class, 'markRead']);
        Route::patch ('/notifications/read-all',  [AccountController::class, 'markAllRead']);
    });

    Route::prefix('cart')->group(function () {
        Route::get('/',              [CartController::class, 'getCart']);
        Route::post('/add',          [CartController::class, 'addToCart']);
        Route::put('/item/{id}',     [CartController::class, 'updateItem']);
        Route::delete('/item/{id}',  [CartController::class, 'removeItem']);
        Route::delete('/clear',      [CartController::class, 'clearCart']);
    });

    Route::prefix('reviews')->group(function () {
        Route::post('/', [DanhGiaController::class, 'store']);
        Route::put('/{id}', [DanhGiaController::class, 'update']);
        Route::delete('/{id}', [DanhGiaController::class, 'destroy']);
    });

    Route::post('/vouchers/collect', [VoucherController::class, 'collect']);
});

Route::get('/reviews/product/{san_pham_id}', [DanhGiaController::class, 'getByProduct']);
