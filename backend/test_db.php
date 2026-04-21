<?php
try {
    $pdo = new PDO(
        'mysql:host=gateway01.ap-southeast-1.prod.aws.tidbcloud.com;port=4000;dbname=test',
        '4SRakF67TEEOktA.root',
        '4w9t56jdGUYMCcs0',
        [
            PDO::MYSQL_ATTR_SSL_CA => __DIR__ . '/ca-cert.pem',
            PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => true
        ]
    );
    echo "SUCCESS: Connected to TiDB!\n";
} catch (\PDOException $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
