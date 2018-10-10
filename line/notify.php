<?php
   
	$line_api = 'https://notify-api.line.me/api/notify';
	$line_token = 'jyaKhr5MuY9jBeWbEzk2OjhT9ucAzCY9Q8ei3ieEGac'; // my LINE
//	$line_token = '2ItNh2j4Z1fIFCSWkZXBH4qtDYigXpl19ahsdWIR5pX'; // group LINE นิวโรศัลย์ รามา ปัจจุบัน
/*
	$image = $_POST['image'];
	$user = $_POST['user'];
	$message = "test";

	// use userID and time as filename
	$t = microtime();
	$sec = substr($t, strpos($t, ' ') + 1);
	$filename = $user . '-' . $sec . '.png';

	// remove "data:image/png;base64,"
	$content = substr($image, strpos($image, ",") + 1);
	$file_content = base64_decode($content);

	file_put_contents($filename, $file_content);
*/
	$file = fopen('nurse.jpg', 'rb');
	$imgfile = json_encode(array("imageFile" => $file));

	$data = array(
		'message' => 'tet',
		'files' => $imgfile
	);

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $line_api);
	curl_setopt($ch, CURLOPT_FILE, $file);
	curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
	curl_setopt($ch, CURLOPT_POST, 1);
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
	print_r('<pre>'.$server_output.'</pre>');
?>