<?php
require_once 'login.php';
$str_json = file_get_contents('php://input');
$string =  json_decode($str_json);
//echo json_encode($string);

$conn = new mysqli($hn, $un, $pw, $db);

if ($conn->connect_error) die("Failure");
$squadron_name = $string;

//$result = $conn->query("SELECT numberAcftNeeded FROM opsRequirement WHERE squadronName = $squadron_name");
$sql = "SELECT * FROM opsRequirement WHERE squadronName = '$squadron_name'";


$result = mysqli_query($conn, $sql);
if (!$result) die("NO LOVE");

$output_array = mysqli_fetch_all($result);
$send_it = json_encode($output_array);
echo $send_it;
mysqli_close($conn);