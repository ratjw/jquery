<?php
	if ($_SERVER["REQUEST_METHOD"] == "POST") {
		$userid = !empty($_POST['userid']) ? $_POST['userid'] : '';
		$pwd = !empty($_POST['pwd']) ? $_POST['pwd'] : '';
		$browser = !empty($_POST['browser']) ? $_POST['browser'] : '';

		$location = "location:";
		$browserDoctor = $location . $browser;
		$browserNurse = $location . "nurse";

		$servername = "surgery.rama.mahidol.ac.th";
		$wsdl="http://appcenter/webservice/patientservice.wsdl";
		$resultz = "";
		$error = "";

		if (preg_match('/^\d{6}$/', $userid)) {
			if (strpos($_SERVER["SERVER_NAME"], $servername) !== false) {
				$client = new SoapClient($wsdl);
				$resultx = $client->Get_staff_detail($userid, $pwd);
				$resulty = simplexml_load_string($resultx);
				$resultz = (string)$resulty->children()->children()->role;
			}
			else if (strpos($_SERVER["SERVER_NAME"], "localhost") !== false) {
				$resultz = "S";
			}
			else if (strpos($_SERVER["SERVER_NAME"], "192.168") !== false) {
				$resultz = "S";
			}

			if ($resultz === "S" || $resultz === "R") {
				header($browserDoctor);
			}
			else if ($resultz === "N") {
				header($browserNurse);
			}
			// Pass the login but other than S, R, N
			else if (preg_match('/^\w{1}$/', $resultz)) {
				$error = "Unauthorized";
        header("location:index.php?error=$error");
			}
			// Fail the login
			else {
				$error = "Incorrect password or username";
        header("location:index.php?error=$error");
			}
		} else {
			$error = "Invalid username";
      header("location:index.php?error=$error");
		}
	}
?>
