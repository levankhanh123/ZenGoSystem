<?php
$mysqli = mysqli_init();
$mysqli->ssl_set(null, null, __DIR__ . '/ca-cert.pem', null, null);
$mysqli->real_connect('gateway01.ap-southeast-1.prod.aws.tidbcloud.com', '4SRakF67TEEOktA.root', '4w9t56jdGUYMCcs0', 'zengo_system', 4000, null, MYSQLI_CLIENT_SSL);
if ($mysqli->connect_error) {
    die('Connect Error (' . $mysqli->connect_errno . ') ' . $mysqli->connect_error);
}
echo "SUCCESS via MYSQLI";
$mysqli->close();
