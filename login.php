<?php
	if ($_SERVER["REQUEST_METHOD"] == "POST") {
		$userid = !empty($_POST['userid']) ? $_POST['userid'] : '';
		$pwd = !empty($_POST['pwd']) ? $_POST['pwd'] : '';
		$nurseid = !empty($_POST['nurseid']) ? $_POST['nurseid'] : '';
		$isMobile = !empty($_POST['isMobile']) ? $_POST['isMobile'] : '';
		$isPACS = !empty($_POST['isPACS']) ? $_POST['isPACS'] : '';
		$module = !empty($_POST['module']) ? $_POST['module'] : '';
		$es = !empty($_POST['browser']) ? $_POST['browser'] : '';

		session_start();
		$_SESSION['userid'] = $userid;

		$location = "location:";
		$browserDoctor = $location . "browser-" . $es;
		$browserNurse = $location . "browser-nurse";
		$browserModule = $location . "browser-module";
		$browserMobile = $location . "browser-mobile";

		// Variables via POST are strings only
		if ($module === "true") {
			$browserDoctor = $browserModule;
		}
		if ($isMobile === "true") {
			$browserDoctor = $browserMobile;
		}

		$servername = "surgery.rama.mahidol.ac.th";
		$wsdl="http://appcenter/webservice/patientservice.wsdl";
		$resultz = "";
		$error = "";

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
			else if (preg_match('/w/', $resultz)) {
				$error = "Unauthorized";
			}
			// Fail the login
			else {
				$error = "Incorrect password or username";
			}
		} else {
			$error = "Invalid username";
		}
	}
?>
