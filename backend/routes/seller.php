<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Seller\OrderController;
use App\Http\Controllers\Seller\ProductController;
use App\Http\Controllers\Seller\VoucherController;
use App\Http\Controllers\Seller\FinanceController;
use App\Http\Controllers\Seller\NotificationController;
use App\Http\Controllers\Seller\RegistrationController;
use App\Http\Controllers\Seller\CampaignController;
use App\Http\Controllers\Seller\ChatController;
use App\Http\Controllers\Seller\ReviewController;
use App\Http\Controllers\Seller\SellerContextController;
use App\Http\Controllers\Seller\SellerVoucherController;
use App\Http\Controllers\Seller\StatisticsController;

/*
|--------------------------------------------------------------------------
| Seller Routes
|--------------------------------------------------------------------------
*/

Route::post('/seller-registration', [RegistrationController::class, 'register']);

Route::middleware('auth:sanctum')->prefix('seller')->group(function () {
    Route::get('/context', [SellerContextController::class, 'show']);
    
    // Orders
    Route::get('/orders', [OrderController::class, 'index']);
    Route::patch('/orders/{id}/status', [OrderController::class, 'updateStatus']);

    // Returns / Refunds
    Route::get('/returns', [\App\Http\Controllers\Seller\ReturnController::class, 'index']);
    Route::patch('/returns/{id}/accept', [\App\Http\Controllers\Seller\ReturnController::class, 'accept']);
    Route::patch('/returns/{id}/dispute', [\App\Http\Controllers\Seller\ReturnController::class, 'dispute']);

    
    // Products (Seller side)
    Route::get('/products', [ProductController::class, 'index']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);
    Route::patch('/products/{id}', [ProductController::class, 'update']);
    Route::patch('/products/{id}/status', [ProductController::class, 'updateStatus']);
    Route::patch('/products/{id}/stock', [ProductController::class, 'updateStock']);

    // Shop Categories
    Route::get('/shop-categories', [\App\Http\Controllers\Seller\ShopCategoryController::class, 'index']);
    Route::post('/shop-categories', [\App\Http\Controllers\Seller\ShopCategoryController::class, 'store']);

    // Vouchers
    Route::get('/vouchers', [SellerVoucherController::class, 'index']);
    Route::post('/vouchers', [VoucherController::class, 'store']);
    Route::put('/vouchers/{id}', [VoucherController::class, 'update']);
    Route::patch('/vouchers/{id}/toggle-pause', [VoucherController::class, 'togglePause']);
    Route::patch('/vouchers/{id}/end-early', [VoucherController::class, 'endEarly']);

    // Finance
    Route::get('/finance', [FinanceController::class, 'show']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{thongBao}/read', [NotificationController::class, 'markAsRead']);

    // Chat
    Route::prefix('chat')->group(function () {
        Route::get('/conversations/{cua_hang_id}', [ChatController::class, 'getConversations']);
        Route::get('/messages/{id}', [ChatController::class, 'getMessages']);
        Route::post('/message', [ChatController::class, 'sendMessage']);
    });

    // Campaigns
    Route::prefix('campaigns')->group(function () {
        Route::get('/', [CampaignController::class, 'index']);
        Route::post('/register', [CampaignController::class, 'register']);
        Route::post('/unregister', [CampaignController::class, 'unregister']);
    });

    // Reviews
    Route::prefix('reviews')->group(function () {
        Route::get('/shop/{shop_id}', [ReviewController::class, 'getShopReviews']);
        Route::post('/{id}/reply', [ReviewController::class, 'reply']);
        Route::get('/stats/{shop_id}', [ReviewController::class, 'getShopReviewStats']);
    });

    // Statistics
    Route::get('/statistics/overview', [StatisticsController::class, 'getOverview']);
});
