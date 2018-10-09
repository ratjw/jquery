<?php
/*
set_include_path(get_include_path() . PATH_SEPARATOR . 'phpseclib1.0.11');

include('Net/SFTP.php');

	$data = $_POST['data'];
	$user = $_POST['user'];

	$t = microtime();
	$sec = substr($t, strpos($t, ' ') + 1);
	$file = $user . '-' . $sec . '.png';

	// remove "data:image/png;base64,"
	$uri =  substr($data, strpos($data, ",") + 1);

	// save to file
//	file_put_contents($file, base64_decode($uri));

	// connect to https server and login
	$sftp = new Net_SFTP('med.mahidol.ac.th');
	$sftp->login('qbook', 'qbookPWD');

	// Save the stream of picture content to a file
	// on the server for webhook
//	$sftp->put('web/line/' . $file, $file, NET_SFTP_LOCAL_FILE);
	$sftp->put('web/line/' . $file, base64_decode($uri));

	$accessToken = "jyaKhr5MuY9jBeWbEzk2OjhT9ucAzCY9Q8ei3ieEGac";
//    $accessToken = "2ItNh2j4Z1fIFCSWkZXBH4qtDYigXpl19ahsdWIR5pX";
    $userID = "Uc16be047bd7242f5163bdf7c34331c6a";
//	$image_url = "https://med.mahidol.ac.th/surgery/qbook/line/" . $file;

	// Sending from bot to notify
	$strUrl = "https://notify-api.line.me/api/notify";
   
    $arrayHeader = array();
    $arrayHeader[] = "Content-Type: application/x-www-form-urlencoded";
    $arrayHeader[] = "Authorization: Bearer {$accessToken}";
    
//	$arrayPostData['to'] = $userID;
	$arrayPostData['message'] = "image";
//	$arrayPostData['imageFullsize'] = $image_url;
//	$arrayPostData['imageThumbnail'] = $image_url;

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $strUrl);
	curl_setopt($ch, CURLOPT_HEADER, false);
	curl_setopt($ch, CURLOPT_POST, true);
	curl_setopt($ch, CURLOPT_HTTPHEADER, $arrayHeader);    
	curl_setopt($ch, CURLOPT_POSTFIELDS, $arrayPostData);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	$result = curl_exec($ch);
	curl_close ($ch);
*/

	function sendToLine($data) {
		$line_api = 'https://notify-api.line.me/api/notify';
		$line_token = 'jyaKhr5MuY9jBeWbEzk2OjhT9ucAzCY9Q8ei3ieEGac';
//		$line_token = '2ItNh2j4Z1fIFCSWkZXBH4qtDYigXpl19ahsdWIR5pX';

		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $line_api);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
		curl_setopt($ch, CURLOPT_POST, 1);
	//	curl_setopt($ch, CURLOPT_POSTFIELDS, 'message='.$message);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $data);

		// follow redirects
		curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
		curl_setopt($ch, CURLOPT_HTTPHEADER, [
			'Content-type: multipart/form-data',
			'Authorization: Bearer '.$line_token,
		]);
		// receive server response ...
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

		$server_output = curl_exec ($ch);

		curl_close ($ch);
	}

	$data = $_POST['data'];

	// remove "data:image/png;base64,"
	$file =  substr($data, strpos($data, ",") + 1);

	$message = "image_url";

	$data = array(
		'message' => $message,
		'imageFile' => $file
	);
   
	sendToLine($data);
?>