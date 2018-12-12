<?php
set_include_path(get_include_path() . PATH_SEPARATOR . 'phpseclib1.0.11');

include('Net/SFTP.php');

	// parameter from Javascript
	$image = $_POST['image'];
	$user = $_POST['user'];

	// ID and token from LINE
	$strUrl = "https://api.line.me/v2/bot/message/push";
    $accessToken = "hUNVJKEFaDK+g5KNdPK7kU6DzaiEke19xDI8lPriN0d4E6FibCkzku2Cm1eKjJGrNPvt0METVy5Y09wS6lwrMFmD11tchvXv+u9hP1DTQUX81O75EOaErmUXjV60JMjlCW10JMfZRCJSb9vB14g7/AdB04t89/1O/w1cDnyilFU=";
    $userID = "Uc16be047bd7242f5163bdf7c34331c6a";

	// Webhook server
	$remote_domain = "med.mahidol.ac.th";
	$username = 'qbook';
	$password = 'qbookPWD';
	$remote_path = 'web/line/';
	$remote_realpath = "https://med.mahidol.ac.th/surgery/qbook/line/";

	// Use userID and time in seconds for filename
	$t = microtime();
	$sec = substr($t, strpos($t, ' ') + 1);
	$file = $user . '-' . $sec . '.png';

	// remove "data:image/png;base64,"
	$uri =  substr($image, strpos($image, ",") + 1);
	$content = base64_decode($uri);

	// connect to https server and login with phpseclib1.0.11
	$sftp = new Net_SFTP($remote_domain);
	$sftp->login($username, $password);

	// Save the stream of picture content to the webhook server
	$sftp->put('web/line/' . $file, $content);

	$image_url = $remote_realpath . $file;
   
    $arrayHeader = array();
    $arrayHeader[] = "Content-Type: application/json";
    $arrayHeader[] = "Authorization: Bearer {$accessToken}";
    
	$arrayPostData['to'] = $userID;
	$arrayPostData['messages'][0]['type'] = "image";
	$arrayPostData['messages'][0]['originalContentUrl'] = $image_url;
	$arrayPostData['messages'][0]['previewImageUrl'] = $image_url;

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $strUrl);
	curl_setopt($ch, CURLOPT_HEADER, false);
	curl_setopt($ch, CURLOPT_POST, true);
	curl_setopt($ch, CURLOPT_HTTPHEADER, $arrayHeader);    
	curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($arrayPostData));
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_exec($ch);
	curl_close ($ch);
?>