<?php
	if ($_SERVER["REQUEST_METHOD"] == "POST") {
		$userid = !empty($_POST['userid']) ? $_POST['userid'] : '';
		$pwd = !empty($_POST['pwd']) ? $_POST['pwd'] : '';
		$nurseid = !empty($_POST['nurseid']) ? $_POST['nurseid'] : '';
		$isMobile = !empty($_POST['isMobile']) ? $_POST['isMobile'] : '';
		$isPACS = !empty($_POST['isPACS']) ? $_POST['isPACS'] : '';
		$module = !empty($_POST['module']) ? $_POST['module'] : '';
		$browser = !empty($_POST['browser']) ? 'browser-' . $_POST['browser'] : '';

		session_start();
		$_SESSION['userid'] = $userid;

		$servername = "surgery.rama.mahidol.ac.th";
		$wsdl="http://appcenter/webservice/patientservice.wsdl";

		$url = "?$userid";
		$location = "location:";
		$nurse = $location . "browser-nurse";
//		if ($module === "true") {
//			$staff = $location . "browser-module";
//		} else {
			$staff = $location . $browser;
//		}
		$resultz = "";
		$error = "";

		// Variables via POST are strings only
		if ($isMobile === "true") {
			header($location . "browser-mobile");
		}

		// Desktop client
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
			else {
				$error = "Incorrect password or username";
			}

			if ($resultz === "S" || $resultz === "R") {
				header($staff);
			}
			else if ($resultz === "N") {
				header($nurse);
			}
			else {
				$error = "Unauthorized";
			}
		} else {
			$error = "Invalid username";
		}
	}
?>
