<?php

require_once 'login.php';

$str_json = file_get_contents('php://input');
$cleanData = json_decode($str_json);
$conn = new mysqli($hn, $un, $pw, $db);
if ($conn->connect_error) die("Failure");
$numberNeeded = array();
$squadronName = $cleanData[0];
$sql = "DELETE FROM opsRequirement WHERE squadronName='$squadronName'";
mysqli_query($conn, $sql);
for ($x = 0; $x < 38; $x++) {
    $sql = "INSERT INTO opsRequirement (squadronName, dateOps, numberAcftNeed) VALUES ('$squadronName','$dateOps','$numberAcftNeed')";


    $offsetter = $x + 36;
    $dateOps = $cleanData[$offsetter];
    $numberAcftNeed = $cleanData[$x];
    mysqli_query($conn, $sql);
}

mysqli_close($conn);
//$send_it = json_encode($output);

//echo $send_it;