<?php
function sendToLine($data) {
	$line_api = 'https://notify-api.line.me/api/notify';
	$line_token = 'jyaKhr5MuY9jBeWbEzk2OjhT9ucAzCY9Q8ei3ieEGac';

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

	$message = "image_url";

//	$image_url = "https://med.mahidol.ac.th/surgery/qbook/line/001198-1539061851.png";// . $file;
	$image_url = "nurse.jpg";
	$imageFile = fopen($image_url, 'r');
	fread($imageFile, filesize($image_url));
	fclose($imageFile);

	$data = array(
		'message' => $message,
		'imageFile' => $imageFile
	);
//	$imageFullsize = '&imageFullsize=' . $image_url;
//	$imageThumbnail = '&imageThumbnail=' . $image_url;
   
	sendToLine($data);
?>