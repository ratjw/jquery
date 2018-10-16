<?php
	session_start();

	$error = "";

	if ($_SERVER["REQUEST_METHOD"] == "POST") {
		$userid = !empty($_POST['userid']) ? $_POST['userid'] : '';
		$pwd = !empty($_POST['pwd']) ? $_POST['pwd'] : '';
		$nurseid = !empty($_POST['nurseid']) ? $_POST['nurseid'] : '';
		$isMobile = !empty($_POST['isMobile']) ? $_POST['isMobile'] : '';
		$isPACS = !empty($_POST['isPACS']) ? $_POST['isPACS'] : '';
		$module = !empty($_POST['module']) ? $_POST['module'] : '';
		$engine = !empty($_POST['engine']) ? 'browser-' . $_POST['engine'] : '';

		$_SESSION['userid'] = $userid;

		$servername = "surgery.rama.mahidol.ac.th";
		$wsdl="http://appcenter/webservice/patientservice.wsdl";

		$url = "?$userid";
		$location = "location:";
		$nurse = $location . "browser-nurse";
//		if ($module === "true") {
//			$staff = $location . "browser-module";
//		} else {
			$staff = $location . $engine;
//		}
		$resultz = "";

		if ($isMobile === "true") {
			header($location . "browser-mobile");
		}

		if ($nurseid === "nurse" || preg_match('/^\d{1,2}$/', $nurseid)) {
			header($nurse);
		}

		// 6 digits username
		else if (preg_match('/^\d{6}$/', $userid)) {
			if (strpos($_SERVER["SERVER_NAME"], $servername) !== false) {
				$client = new SoapClient($wsdl);
				$resultx = $client->Get_staff_detail($userid, $pwd);
				$resulty = simplexml_load_string($resultx);
				$resultz = (string)$resulty->children()->children()->role;
			} else {
				$resultz = "S";
			}

			if ($resultz === "S" || $resultz === "R") {
				header($staff);
			}
			else if ($resultz === "N") {
			header($nurse);
			} else {
				$error = "Incorrect password or username";
			}
		}
		// 1 or 2 digits for each OR room
		else if (preg_match('/^\d{1,2}$/', $userid)) {
			header($nurse);
		}
		else {
			$error = "Invalid username";
		}
	}
?>
