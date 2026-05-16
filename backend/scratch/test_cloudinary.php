<?php

require __DIR__ . '/../vendor/autoload.php';

// Load environment variables manually if needed, but let's just try to use the ones from .env
$env = parse_ini_file(__DIR__ . '/../.env');

$cloudName = 'dqffntvmp';
$apiKey = '999232988658861';
$apiSecret = 'LwoWLSO_ONSECLaNtla7svPC4Nc';

echo "Testing Cloudinary Connection...\n";
echo "Cloud Name: $cloudName\n";
echo "API Key: $apiKey\n";

$url = "https://api.cloudinary.com/v1_1/$cloudName/usage";
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_USERPWD, "$apiKey:$apiSecret");
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Response: $response\n";

if ($httpCode == 200) {
    echo "\nSUCCESS: Connection established!\n";
} else {
    echo "\nFAILED: Please check your credentials.\n";
}
