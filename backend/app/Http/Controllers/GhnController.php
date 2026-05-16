<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\JsonResponse;

class GhnController extends Controller
{
    private string $apiUrl;
    private string $token;

    public function __construct()
    {
        // Default to dev API if not configured, but should be in .env
        $this->apiUrl = env('GHN_API_URL', 'https://dev-online-gateway.ghn.vn/shiip/public-api/');
        $this->token = env('GHN_TOKEN', '');
    }

    private function getHeaders(): array
    {
        return [
            'Token' => $this->token,
            'Content-Type' => 'application/json'
        ];
    }

    /**
     * Get all provinces
     */
    public function getProvinces(): JsonResponse
    {
        try {
            $response = Http::withHeaders($this->getHeaders())
                ->get($this->apiUrl . 'master-data/province');

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json(['message' => 'Lỗi khi gọi API GHN', 'error' => $response->json()], 500);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Server error', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get districts by province_id
     */
    public function getDistricts(Request $request): JsonResponse
    {
        $request->validate([
            'province_id' => 'required|integer'
        ]);

        try {
            $response = Http::withHeaders($this->getHeaders())
                ->post($this->apiUrl . 'master-data/district', [
                    'province_id' => (int) $request->province_id
                ]);

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json(['message' => 'Lỗi khi gọi API GHN', 'error' => $response->json()], 500);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Server error', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get wards by district_id
     */
    public function getWards(Request $request): JsonResponse
    {
        $request->validate([
            'district_id' => 'required|integer'
        ]);

        try {
            $response = Http::withHeaders($this->getHeaders())
                ->post($this->apiUrl . 'master-data/ward', [
                    'district_id' => (int) $request->district_id
                ]);

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json(['message' => 'Lỗi khi gọi API GHN', 'error' => $response->json()], 500);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Server error', 'error' => $e->getMessage()], 500);
        }
    }
}
