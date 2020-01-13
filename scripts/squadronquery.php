<?php
require_once 'login.php';
$conn = new mysqli($hn, $un, $pw, $db);
if ($conn->connect_error) die("Failure");
$result = $conn -> query("SELECT squadronName FROM squadron_basic_details");
if(!$result) die("NO LOVE");
$row_count= $result ->num_rows;
$output_array = mysqli_fetch_all($result);
$send_it=json_encode($output_array);
echo $send_it;
mysqli_close($conn);
?>