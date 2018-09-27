<?php
	$data = $_POST['data'];
	$user = $_POST['user'];

	$t = microtime();
	$sec = substr($t, strpos($t, ' ') + 1);
	$file = $user . '-' . $sec . '.png';

	// remove "data:image/png;base64,"
	$uri =  substr($data, strpos($data, ",") + 1);

	// save to file
	file_put_contents($file, base64_decode($uri));

    $accessToken = "hUNVJKEFaDK+g5KNdPK7kU6DzaiEke19xDI8lPriN0d4E6FibCkzku2Cm1eKjJGrNPvt0METVy5Y09wS6lwrMFmD11tchvXv+u9hP1DTQUX81O75EOaErmUXjV60JMjlCW10JMfZRCJSb9vB14g7/AdB04t89/1O/w1cDnyilFU=";
    $userID = "Uc16be047bd7242f5163bdf7c34331c6a";
	$image_url = "https://novus.serveo.net/line/" . $file;
   
    $arrayHeader = array();
    $arrayHeader[] = "Content-Type: application/json";
    $arrayHeader[] = "Authorization: Bearer {$accessToken}";
    
	$arrayPostData['to'] = $userID;
	$arrayPostData['messages'][0]['type'] = "image";
	$arrayPostData['messages'][0]['originalContentUrl'] = $image_url;
	$arrayPostData['messages'][0]['previewImageUrl'] = $image_url;

	$strUrl = "https://api.line.me/v2/bot/message/push";
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $strUrl);
	curl_setopt($ch, CURLOPT_HEADER, false);
	curl_setopt($ch, CURLOPT_POST, true);
	curl_setopt($ch, CURLOPT_HTTPHEADER, $arrayHeader);    
	curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($arrayPostData));
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	$result = curl_exec($ch);
	curl_close ($ch);
?>