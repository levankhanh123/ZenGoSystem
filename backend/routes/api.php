<?php

use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\SellerContextController;
use App\Http\Controllers\Api\SellerFinanceController;
use App\Http\Controllers\Api\SellerNotificationController;
use App\Http\Controllers\Api\SellerOrderController;
use App\Http\Controllers\Api\SellerRegistrationController;
use App\Http\Controllers\Api\SellerVoucherController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::get('/test', function () {
    return response()->json(['message' => 'Backend run successfully!']);
});

Route::post('/seller-registration', [SellerRegistrationController::class, 'register']);
Route::get('/seller/context', [SellerContextController::class, 'show']);

Route::get('/schema', function (Request $request) {
    $table = $request->query('table', 'san_pham');

    try {
        $columns = DB::select("DESCRIBE {$table}");

        return response()->json($columns);
    } catch (\Throwable $exception) {
        return response()->json(['error' => $exception->getMessage()], 400);
    }
});

Route::get('/categories', function () {
    if (DB::table('danh_muc')->count() === 0) {
        DB::table('danh_muc')->insert([
            ['ten_danh_muc' => 'Ao', 'slug' => 'ao'],
            ['ten_danh_muc' => 'Quan', 'slug' => 'quan'],
            ['ten_danh_muc' => 'Phu kien', 'slug' => 'phu-kien'],
        ]);
    }

    return response()->json(DB::table('danh_muc')->orderBy('id')->get());
});

Route::get('/products', [ProductController::class, 'index']);
Route::post('/products', [ProductController::class, 'store']);
Route::delete('/products/{id}', [ProductController::class, 'destroy']);
Route::patch('/products/{id}/status', [ProductController::class, 'updateStatus']);
Route::patch('/products/{id}/stock', [ProductController::class, 'updateStock']);
Route::get('/orders', [SellerOrderController::class, 'index']);
Route::get('/seller/vouchers', [SellerVoucherController::class, 'index']);
Route::get('/seller/finance', [SellerFinanceController::class, 'show']);
Route::get('/seller/notifications', [SellerNotificationController::class, 'index']);
Route::put('/seller/notifications/{thongBao}/read', [SellerNotificationController::class, 'markAsRead']);

Route::get('/chat/conversations/{cua_hang_id}', [ChatController::class, 'getConversations']);
Route::get('/chat/messages/{id}', [ChatController::class, 'getMessages']);
Route::post('/chat/message', [ChatController::class, 'sendMessage']);

require __DIR__ . '/admin.php';