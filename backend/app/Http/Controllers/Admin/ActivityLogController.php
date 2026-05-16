<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\NhatKyHoatDong;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = NhatKyHoatDong::query();

        if ($request->filled('user_id')) {
            $query->where('nguoi_dung_id', $request->input('user_id'));
        }

        if ($request->filled('hanh_dong')) {
            $query->where('hanh_dong', $request->input('hanh_dong'));
        }

        $logs = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($logs);
    }
}
