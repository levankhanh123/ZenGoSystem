<?php
$conn = new mysqli("127.0.0.1", "root", "", "zengo_system");
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
$result = $conn->query("DESCRIBE san_pham");
while($row = $result->fetch_assoc()) {
    echo $row["Field"] . " - " . $row["Type"] . "\n";
}
$conn->close();
