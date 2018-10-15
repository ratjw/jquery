<?php
	if ($_SERVER["REQUEST_METHOD"] == "POST") {
		$userid = !empty($_POST['userid']) ? $_POST['userid'] : '';
		$pwd = !empty($_POST['pwd']) ? $_POST['pwd'] : '';
		$nurseid = !empty($_POST['nurseid']) ? $_POST['nurseid'] : '';
		$isPACS = !empty($_POST['isPACS']) ? $_POST['isPACS'] : '';
		$module = !empty($_POST['module']) ? $_POST['module'] : '';
		$mobile = !empty($_POST['mobile']) ? $_POST['mobile'] : '';
		$engine = !empty($_POST['engine']) ? $_POST['engine'] : '';

		$servername = "surgery.rama.mahidol.ac.th";
		$wsdl="http://appcenter/webservice/patientservice.wsdl";

		$htmlpath = "/html/";
		$htmlstaff = $engine . $htmlpath . "staff.html";
		$htmlnurse = $engine . $htmlpath . "nurse.html";
		$location = "location:";
		$index = "index.html";
		$redirect = $location . $index;
		$staff = $location . $engine . "/" . $index;
		$nurse = $location . "nurse/" . $index;
		$resultz = "";

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
				header($redirect . "?error=<h4>Wrong password or username</h4>");
			}
		}
		// 1 or 2 digits for each OR room
		else if (preg_match('/^\d{1,2}$/', $userid)) {
			header($nurse);
		}
		else {
			header($redirect . "?error=<h4>Wrong username</h4>");
		}
	}
?>
