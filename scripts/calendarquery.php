<?php
$str_json = file_get_contents('php://input');
$cleandata = json_decode($str_json);
require_once 'login.php';
$conn = new mysqli($hn, $un, $pw, $db);
if ($conn->connect_error) die("Failure");
$squadron_name = $cleandata;

$result = $conn->query("SELECT * FROM BUNOMXDates WHERE squadronName = '$squadron_name'");

/*$result = $conn->query("SELECT * FROM squadron_basic_details WHERE squadronName= $squadron_name");*/
if (!$result) die("NO LOVE");
$output_array = mysqli_fetch_all($result);
$send_it = json_encode($output_array);
echo $send_it;
mysqli_close($conn);