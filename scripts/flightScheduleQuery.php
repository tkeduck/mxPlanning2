<?php
require_once 'login.php';
$conn = new mysqli($hn, $un, $pw, $db);
$str_json = file_get_contents('php://input');
$cleanData = json_decode($str_json);
$buno =$cleanData;
//$sql = "SELECT * FROM flightSchedule WHERE BUNO ='$buno'";
$sql = "SELECT flightEntry FROM flightScheduleAlt WHERE BUNO ='$buno'";
$result = mysqli_query($conn, $sql);
$resultArray=mysqli_fetch_all($result);
$sendIt = json_encode($resultArray);


echo $sendIt;

