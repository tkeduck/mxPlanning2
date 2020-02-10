<?php


$str_json = file_get_contents('php://input');
$cleandata = json_decode($str_json);
$lengthArray = count($cleandata);
$BUNO = $cleandata[0];
$send_it = json_encode($cleandata);
//echo json_encode($BUNO);


require_once 'login.php';
$conn = new mysqli($hn, $un, $pw, $db);
$SQL = "DELETE FROM flightScheduleAlt WHERE BUNO ='$BUNO'";
mysqli_query($conn, $SQL);

for($x=1; $x<$lengthArray;$x++) {
    $SQL = "INSERT INTO flightScheduleAlt (BUNO, flightEntry ) VALUES ('$BUNO','$cleandata[$x]')";
    mysqli_query($conn, $SQL);
}
//echo json_encode($cleandata[1]);

if (mysqli_error($conn)) {
    $output = "Error: " . $SQL . "" . mysqli_error($conn);
} else {
    $output = 'Updated Schedule Created for BUNO: ' . $BUNO;
}
mysqli_close($conn);
$send_it = json_encode($output);

echo $send_it;
