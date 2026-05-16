<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Shipper\ShipperController;

/*
|--------------------------------------------------------------------------
| Shipper Routes
|--------------------------------------------------------------------------
| Routes dành cho người giao hàng (Shipper)
*/

Route::middleware('auth:sanctum')->prefix('shipper')->name('shipper.')->group(function () {
    
    // Dashboard
    Route::get('/dashboard', [ShipperController::class, 'dashboard'])->name('dashboard');
    Route::get('/statistics', [ShipperController::class, 'statistics'])->name('statistics');
    
    // Quản lý đơn hàng
    Route::prefix('orders')->name('orders.')->group(function () {
        Route::get('/', [ShipperController::class, 'listOrders'])->name('list');
        Route::get('/{id}', [ShipperController::class, 'orderDetail'])->name('detail');
        Route::put('/{id}/status', [ShipperController::class, 'updateStatus'])->name('update-status');
        Route::post('/{id}/receive', [ShipperController::class, 'receiveOrder'])->name('receive');
    });
    
    // Quản lý tài khoản
    Route::prefix('account')->name('account.')->group(function () {
        Route::get('/', [ShipperController::class, 'accountManagement'])->name('profile');
        Route::put('/update', [ShipperController::class, 'updateAccount'])->name('update');
        Route::post('/change-password', [ShipperController::class, 'changePassword'])->name('change-password');
    });
    
    // Đối soát
    Route::prefix('reconciliation')->name('reconciliation.')->group(function () {
        Route::get('/', [ShipperController::class, 'reconciliation'])->name('index');
        Route::get('/{id}', [ShipperController::class, 'reconciliationDetail'])->name('detail');
    });
    
    // Lịch sử
    Route::get('/history', [ShipperController::class, 'history'])->name('history');
});
