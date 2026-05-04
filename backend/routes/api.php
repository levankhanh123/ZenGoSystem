<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::get('/test', function () {
    return response()->json(['message' => 'Backend run successfully!']);
});

// Schema helper (Development only)
Route::get('/schema', function (Request $request) {
    if (app()->environment('production')) {
        return response()->json(['error' => 'Forbidden'], 403);
    }
    
    $table = $request->query('table', 'san_pham');

    try {
        $columns = DB::select("DESCRIBE {$table}");

        return response()->json($columns);
    } catch (\Throwable $exception) {
        return response()->json(['error' => $exception->getMessage()], 400);
    }
});

// Categories helper (legacy or simple)
Route::get('/categories-simple', function () {
    return response()->json(DB::table('danh_muc')->orderBy('id')->get());
});

// Include Modular Routes
require __DIR__ . '/buyer.php';
require __DIR__ . '/seller.php';
require __DIR__ . '/admin.php';
require __DIR__ . '/shipper.php';
