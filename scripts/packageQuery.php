<?php
require_once 'login.php';
$str_json = file_get_contents('php://input');
$cleanData = json_decode($str_json);
$numberBunos = count($cleanData);
$conn = new mysqli($hn, $un, $pw, $db);
$outputArray = [];
for($x=0; $x<$numberBunos; $x++){
    $currentBuno = $cleanData[$x];
$sql = "SELECT * FROM BUNOpkgTable WHERE BUNO= '$currentBuno'";
$result = mysqli_query($conn,$sql);
$resultArray=mysqli_fetch_all($result);

//array_push($outputArray,$resultArray);
$outputArray[]=$resultArray;
}










$sendIt = json_encode($outputArray);
echo $sendIt;