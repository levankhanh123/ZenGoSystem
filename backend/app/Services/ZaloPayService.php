<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ZaloPayService
{
    protected $appId;
    protected $key1;
    protected $key2;
    protected $endpoint;

    public function __construct()
    {
        $this->appId = env('ZALOPAY_APP_ID');
        $this->key1 = env('ZALOPAY_KEY1');
        $this->key2 = env('ZALOPAY_KEY2');
        $this->endpoint = env('ZALOPAY_ENDPOINT');
    }

    /**
     * Khởi tạo thanh toán ZaloPay
     */
    public function createOrder($order, $items = [])
    {
        $app_trans_id = date("ymd") . "_" . $order->ma_don_hang;
        $amount = (int) $order->tong_tien;
        $description = "ZenGo - Thanh toan don hang #" . $order->ma_don_hang;
        
        $itemsArray = is_array($items) ? $items : $items->all();
        $item_list = array_map(function($item) {
            return [
                'itemid' => (string) $item->san_pham_id,
                'itemname' => (string) $item->ten_san_pham,
                'itemprice' => (int) $item->don_gia,
                'itemquantity' => (int) $item->so_luong
            ];
        }, $itemsArray);

        $embed_json = json_encode(['redirecturl' => env('FRONTEND_URL', 'http://localhost:5173') . '/payment-result'], JSON_UNESCAPED_SLASHES);
        $item_json = json_encode($item_list, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        $order_data = [
            'app_id' => (int) $this->appId,
            'app_time' => (int) round(microtime(true) * 1000), // miliseconds
            'app_trans_id' => $app_trans_id,
            'app_user' => "User_" . $order->nguoi_mua_id,
            'item' => $item_json,
            'embed_data' => $embed_json,
            'amount' => $amount,
            'description' => $description,
            'bank_code' => "zalopayapp"
        ];

        // app_id|app_trans_id|app_user|amount|app_time|embed_data|item
        $data = $order_data['app_id'] . "|" . $order_data['app_trans_id'] . "|" . $order_data['app_user'] . "|" . $order_data['amount']
            . "|" . $order_data['app_time'] . "|" . $order_data['embed_data'] . "|" . $order_data['item'];
        
        $order_data['mac'] = hash_hmac("sha256", $data, $this->key1);

        Log::info("ZaloPay Create Order Request", $order_data);

        try {
            $response = Http::asForm()->post($this->endpoint, $order_data);
            $result = $response->json();
            
            Log::info("ZaloPay Create Order Response", $result);
            
            return $result;
        } catch (\Exception $e) {
            Log::error("ZaloPay Create Order Error: " . $e->getMessage());
            return ['return_code' => 2, 'return_message' => $e->getMessage()];
        }
    }

    /**
     * Xác minh Callback từ ZaloPay
     */
    public function verifyCallback($data, $requestMac)
    {
        $mac = hash_hmac("sha256", $data, $this->key2);
        return $mac === $requestMac;
    }
}
