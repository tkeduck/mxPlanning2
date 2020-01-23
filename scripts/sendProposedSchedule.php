<?php
$str_json = file_get_contents('php://input');
$cleandata = json_decode($str_json);
$lengthArray = count($cleandata);
$BUNO = $cleandata[2];
$SQDName = $cleandata[3];
$numMXwindows = $cleandata[0];
$currentCounter = $cleandata[1];
//$send_it = json_encode($numMXwindows);

//echo $send_it;



$MXDate = end($cleandata);
$MXDate = str_replace('-','/',$MXDate);
$year = substr($MXDate,6,4);
$day = substr($MXDate,3,2);
$month = substr($MXDate,0,2);
$MXDate = $year.'/'.$month.'/'.$day;


require_once 'login.php';
$conn = new mysqli($hn, $un, $pw, $db);

if($numMXwindows==1) {
    $SQL = "DELETE FROM proposedMXDates WHERE BUNO ='$BUNO'";
    mysqli_query($conn, $SQL);
    $SQL = "INSERT INTO proposedMXDates (BUNO, SQDName) VALUES ('$BUNO','$SQDName')";
    mysqli_query($conn, $SQL);
}

for ($x = 4; $x<$lengthArray-1;$x++){
    $mxName = $cleandata[$x];
    //$SQL = "UPDATE proposedMXDates SET '$mxName' ='$MXDate' WHERE BUNO = '$BUNO'";
    $SQL = "UPDATE proposedMXDates SET $mxName= '$MXDate' WHERE BUNO = '$BUNO'";
    mysqli_query($conn,$SQL);
}

if(mysqli_error($conn)){
$output= "Error: " . $SQL . "" . mysqli_error($conn);
}else{
    $output='Updated Schedule Created for BUNO: '.$BUNO;
}

$send_it = json_encode($output);

echo $send_it;