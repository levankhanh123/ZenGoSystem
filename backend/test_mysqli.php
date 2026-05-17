<?php
$mysqli = mysqli_init();
$sslCa = getenv('MYSQL_ATTR_SSL_CA') ?: (__DIR__ . '/ca-cert.pem');
$mysqli->ssl_set(null, null, $sslCa, null, null);
$mysqli->real_connect(
    getenv('DB_HOST') ?: '127.0.0.1',
    getenv('DB_USERNAME') ?: 'root',
    getenv('DB_PASSWORD') ?: '',
    getenv('DB_DATABASE') ?: 'zengo',
    (int) (getenv('DB_PORT') ?: 3306),
    null,
    MYSQLI_CLIENT_SSL
);
if ($mysqli->connect_error) {
    die('Connect Error (' . $mysqli->connect_errno . ') ' . $mysqli->connect_error);
}
echo "SUCCESS via MYSQLI";
$mysqli->close();
