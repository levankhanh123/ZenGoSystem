<?php

use App\Http\Controllers\Admin\CampaignController;
use App\Http\Controllers\Admin\ComplaintController;
use App\Http\Controllers\Admin\ConversationController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\FinanceController;
use App\Http\Controllers\Admin\NotificationController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\ShipperController;
use App\Http\Controllers\Admin\ShopController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index']);

    Route::get('users', [UserController::class, 'index']);
    Route::put('users/status/bulk', [UserController::class, 'bulkUpdateStatus']);
    Route::get('users/{nguoiDung}', [UserController::class, 'show']);
    Route::put('users/{nguoiDung}/status', [UserController::class, 'updateStatus']);

    Route::get('shops', [ShopController::class, 'index']);
    Route::get('shops/{cuaHang}', [ShopController::class, 'show']);
    Route::put('shops/{cuaHang}/status', [ShopController::class, 'updateStatus']);

    Route::get('orders', [OrderController::class, 'index']);
    Route::get('orders/{donHang}', [OrderController::class, 'show']);
    Route::put('orders/{donHang}/status', [OrderController::class, 'updateStatus']);

    Route::get('shippers', [ShipperController::class, 'index']);
    Route::get('shippers/{shipper}', [ShipperController::class, 'show']);
    Route::put('shippers/{shipper}/intervene', [ShipperController::class, 'intervene']);

    Route::get('complaints', [ComplaintController::class, 'index']);
    Route::get('complaints/{khieuNai}', [ComplaintController::class, 'show']);
    Route::put('complaints/{khieuNai}', [ComplaintController::class, 'update']);

    Route::get('conversations', [ConversationController::class, 'index']);
    Route::post('conversations', [ConversationController::class, 'store']);
    Route::get('conversations/{hoiThoai}', [ConversationController::class, 'show']);
    Route::post('conversations/{hoiThoai}/messages', [ConversationController::class, 'sendMessage']);
    Route::put('conversations/{hoiThoai}/read', [ConversationController::class, 'markAdminRead']);
    Route::put('conversations/{hoiThoai}/status', [ConversationController::class, 'updateStatus']);

    Route::get('finance/overview', [FinanceController::class, 'overview']);
    Route::get('finance/payments', [FinanceController::class, 'payments']);
    Route::get('finance/shop-settlements', [FinanceController::class, 'shopSettlements']);
    Route::get('finance/shipper-settlements', [FinanceController::class, 'shipperSettlements']);
    Route::get('finance/refunds', [FinanceController::class, 'refunds']);
    Route::get('finance/logs', [FinanceController::class, 'logs']);
    Route::put('finance/payments/{thanhToan}', [FinanceController::class, 'updatePayment']);
    Route::put('finance/shop-settlements/{doiSoatShop}', [FinanceController::class, 'updateShopSettlement']);
    Route::put('finance/shipper-settlements/{doiSoatShipper}', [FinanceController::class, 'updateShipperSettlement']);
    Route::put('finance/refunds/{hoanTien}', [FinanceController::class, 'updateRefund']);

    Route::get('campaigns', [CampaignController::class, 'index']);
    Route::post('campaigns', [CampaignController::class, 'store']);
    Route::put('campaigns/{voucher}', [CampaignController::class, 'update']);
    Route::delete('campaigns/{voucher}', [CampaignController::class, 'destroy']);
    Route::get('campaign-registrations', [CampaignController::class, 'registrations']);
    Route::put('campaign-registrations/{dangKyChienDich}', [CampaignController::class, 'updateRegistration']);

    Route::get('notifications', [NotificationController::class, 'index']);
    Route::post('notifications', [NotificationController::class, 'store']);
    Route::post('notifications/broadcast', [NotificationController::class, 'broadcast']);
    Route::delete('notifications', [NotificationController::class, 'bulkDelete']);
    Route::put('notifications/{thongBao}/read', [NotificationController::class, 'markAsRead']);
    Route::put('notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('notifications/{thongBao}', [NotificationController::class, 'destroy']);
});