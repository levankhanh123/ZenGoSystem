<?php

use App\Http\Controllers\Admin\ActivityLogController;
use App\Http\Controllers\Admin\CampaignController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ComplaintController;
use App\Http\Controllers\Admin\ConversationController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\FinanceController;
use App\Http\Controllers\Admin\NotificationController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ShipperController;
use App\Http\Controllers\Admin\ShopController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index']);

    Route::get('activity-logs', [ActivityLogController::class, 'index']);

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

    Route::get('products', [ProductController::class, 'index']);
    Route::get('products/filters', [ProductController::class, 'getFilterData']);
    Route::get('products/{sanPham}', [ProductController::class, 'show']);
    Route::put('products/{sanPham}/status', [ProductController::class, 'updateStatus']);

    Route::get('shippers', [ShipperController::class, 'index']);
    Route::post('shippers', [ShipperController::class, 'store']);
    Route::get('shippers/{shipper}', [ShipperController::class, 'show']);
    Route::put('shippers/{shipper}/intervene', [ShipperController::class, 'intervene']);
    Route::put('shippers/{shipper}/zone', [ShipperController::class, 'updateZone']);
    Route::put('shippers/{shipper}/toggle-status', [ShipperController::class, 'toggleStatus']);

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

    Route::get('finance/reconciliations/pending', [\App\Http\Controllers\Admin\ReconciliationController::class, 'pendingList']);
    Route::post('finance/reconciliations/{id}/confirm', [\App\Http\Controllers\Admin\ReconciliationController::class, 'confirmShipperReconciliation']);

    Route::get('campaigns/categories', [CampaignController::class, 'getCategories']);
    Route::get('campaigns', [CampaignController::class, 'index']);
    Route::post('campaigns', [CampaignController::class, 'store']);
    Route::put('campaigns/{voucher}', [CampaignController::class, 'update']);
    Route::delete('campaigns/{voucher}', [CampaignController::class, 'destroy']);
    Route::get('campaign-registrations', [CampaignController::class, 'registrations']);
    Route::post('campaign-registrations/bulk-update', [CampaignController::class, 'bulkUpdateRegistrations']);
    Route::put('campaign-registrations/{dangKyChienDich}', [CampaignController::class, 'updateRegistration']);

    Route::get('categories', [CategoryController::class, 'index']);
    Route::get('categories/tree', [CategoryController::class, 'getTreeSelect']);
    Route::post('categories', [CategoryController::class, 'store']);
    Route::put('categories/{danhMuc}', [CategoryController::class, 'update']);
    Route::delete('categories/{danhMuc}', [CategoryController::class, 'destroy']);
    Route::put('categories/{danhMuc}/toggle', [CategoryController::class, 'toggleStatus']);

    Route::get('shop-vouchers', [\App\Http\Controllers\Admin\ShopVoucherController::class, 'index']);
    Route::put('shop-vouchers/{voucher}/lock', [\App\Http\Controllers\Admin\ShopVoucherController::class, 'lock']);
    Route::put('shop-vouchers/{voucher}/unlock', [\App\Http\Controllers\Admin\ShopVoucherController::class, 'unlock']);

    Route::get('notifications', [NotificationController::class, 'index']);
    Route::post('notifications', [NotificationController::class, 'store']);
    Route::post('notifications/broadcast', [NotificationController::class, 'broadcast']);
    Route::delete('notifications', [NotificationController::class, 'bulkDelete']);
    Route::put('notifications/{thongBao}/read', [NotificationController::class, 'markAsRead']);
    Route::put('notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('notifications/{thongBao}', [NotificationController::class, 'destroy']);
});