<?php
set_include_path(get_include_path() . PATH_SEPARATOR . 'phpseclib1.0.11');

include('Net/SFTP.php');

	$user = $_POST['user'];
	$message = $_POST['message'];
	$image = $_POST['image'];

	$message = $user . "\n" . $message;
	$remote_domain = "med.mahidol.ac.th";
	$remote_path = 'web/line/';
	$remote_server = "https://med.mahidol.ac.th/surgery/qbook/line/";
   
	$line_api = 'https://notify-api.line.me/api/notify';
	$line_token = 'jyaKhr5MuY9jBeWbEzk2OjhT9ucAzCY9Q8ei3ieEGac'; // my LINE
//	$line_token = '2ItNh2j4Z1fIFCSWkZXBH4qtDYigXpl19ahsdWIR5pX'; // group LINE นิวโรศัลย์ รามา ปัจจุบัน

	// use userID and time as filename
	$t = microtime();
	$sec = substr($t, strpos($t, ' ') + 1);
	$filename = $user . '-' . $sec . '.png';

	// remove "data:image/png;base64,"
	$content = substr($image, strpos($image, ",") + 1);
	$file_content = base64_decode($content);

	// connect to https server and login
	$sftp = new Net_SFTP($remote_domain);
	$sftp->login('qbook', 'qbookPWD');

	// Save the stream of picture content to remote server for webhook
	$sftp->put($remote_path . $filename, $file_content);

	$image_url = $remote_server . $filename;

	$data = array(
		'message' => $message,
		'imageFullsize' => $image_url,
		'imageThumbnail' => $image_url
	);

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $line_api);
	curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
	curl_setopt($ch, CURLOPT_POST, 1);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $data);

	// follow redirects
	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
	curl_setopt($ch, CURLOPT_HTTPHEADER, [
		'Content-type: multipart/form-data',
		'Authorization: Bearer '.$line_token
	]);
	// receive server response ...
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

	$server_output = curl_exec ($ch);

	curl_close ($ch);
?>