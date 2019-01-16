<?php
	$line_api = "https://notify-api.line.me/api/notify";
	$line_token = "jyaKhr5MuY9jBeWbEzk2OjhT9ucAzCY9Q8ei3ieEGac"; // my LINE
//	$line_token = "2ItNh2j4Z1fIFCSWkZXBH4qtDYigXpl19ahsdWIR5pX"; // group LINE นิวโรศัลย์ รามา ปัจจุบัน

	$data = [
		"message" => "test",
		"imageFile" => new CURLFile("/inetpub/wwwroot/jquery/line/imagefile/001198-1539441016.png")
	];
 
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $line_api);
	curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
	curl_setopt($ch, CURLOPT_POST, 1);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $data);

	// follow redirects
	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
	curl_setopt($ch, CURLOPT_HTTPHEADER, [
		"Content-type: multipart/form-data",
		"Authorization: Bearer " . $line_token
	]);
	// receive server response ...
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

	$server_output = curl_exec ($ch);

	curl_close ($ch);
?>