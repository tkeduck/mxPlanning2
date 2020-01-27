<?php
$str_json = file_get_contents('php://input');
$cleanData = json_decode($str_json);
$sendIt = json_encode($cleanData);
echo $sendIt;