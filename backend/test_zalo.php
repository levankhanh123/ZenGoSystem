<?php
require 'vendor/autoload.php';
$app_id = 2553;
$key1 = '9ph319ecByr7uY9sB9s9q4YNLBaR97p7';
$app_time = (int) round(microtime(true) * 1000);
$app_trans_id = date('ymd') . '_123456';
$app_user = 'User_10';
$amount = 280000;
$embed_data = json_encode(['redirecturl' => 'http://localhost:5173/payment-result'], JSON_UNESCAPED_SLASHES);
$item = json_encode([['itemid' => '2', 'itemname' => 'Ao so mi lua', 'itemprice' => 250000, 'itemquantity' => 1]], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
$data = $app_id . '|' . $app_trans_id . '|' . $app_user . '|' . $amount . '|' . $app_time . '|' . $embed_data . '|' . $item;
$mac = hash_hmac('sha256', $data, $key1);

$order_data = [
    'app_id' => $app_id,
    'app_time' => $app_time,
    'app_trans_id' => $app_trans_id,
    'app_user' => $app_user,
    'item' => $item,
    'embed_data' => $embed_data,
    'amount' => $amount,
    'description' => 'ZenGo - Thanh toan',
    'bank_code' => 'zalopayapp',
    'mac' => $mac
];

$context = stream_context_create([
    'http' => [
        'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
        'method'  => 'POST',
        'content' => http_build_query($order_data)
    ]
]);
$result = file_get_contents('https://sb-openapi.zalopay.vn/v2/create', false, $context);
echo $result;
