<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\SellerRegistrationController;

Route::get('/test', function () {
    return response()->json(['message' => 'Backend run successfully!']);
});

Route::post('/seller-registration', [SellerRegistrationController::class, 'register']);

Route::get('/schema', function(Request $request) {
    $table = $request->query('table', 'san_pham');
    try {
        $columns = DB::select("DESCRIBE {$table}");
        return response()->json($columns);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 400);
    }
});

Route::get('/categories', function() {
    // Tự động insert danh mục dummy nếu bảng trống
    if (DB::table('danh_muc')->count() === 0) {
        DB::table('danh_muc')->insert([
            ['ten_danh_muc' => 'Áo', 'slug' => 'ao'],
            ['ten_danh_muc' => 'Quần', 'slug' => 'quan'],
            ['ten_danh_muc' => 'Phụ kiện', 'slug' => 'phu-kien']
        ]);
    }
    return response()->json(DB::table('danh_muc')->get());
});

// Product Routes
Route::get('/products', [ProductController::class, 'index']);
Route::post('/products', [ProductController::class, 'store']);
Route::delete('/products/{id}', [ProductController::class, 'destroy']);
Route::patch('/products/{id}/status', [ProductController::class, 'updateStatus']);
Route::patch('/products/{id}/stock', [ProductController::class, 'updateStock']);

// Chat Routes
Route::get('/chat/conversations/{cua_hang_id}', [ChatController::class, 'getConversations']);
Route::get('/chat/messages/{id}', [ChatController::class, 'getMessages']);
Route::post('/chat/message', [ChatController::class, 'sendMessage']);