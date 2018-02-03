<!DOCTYPE html>
<HTML>
<HEAD>
<link href="css/jquery-ui.min.css" rel="stylesheet">
<link href="css/CSS.css" rel="stylesheet">

<script src="js/jquery-1.12.4.min.js"></script>
<script src="js/jquery.mousewheel.min.js"></script>
<script src="js/jquery-ui.min.js"></script>

<script>
function namesix() {
	var userid = document.getElementById("userid").value
	if (/^\d{6}$/.test(userid)) {
		$("#password").focus()
	}
}
</script>
</HEAD>
<BODY>
<p id="logo" style="text-align:center;"><img width="170" height="150" src="css/pic/logoRama.png"></p>

<?php $userid = $password = ""; ?>

<div id="login">
	<br>
	<h3>Neurosurgery Service</h3>

	<form method="post" action="">
		Login ID: <input id="userid" type="text" maxlength="6" size="6" name="userid"
					value="<?php echo $userid;?>" oninput="namesix()" 
					onpropertychange="namesix()">
		<br>
		<br>
		Password: <input id="password" type="password" name="password"
					maxlength="16" size="8" value="<?php echo $password;?>">
		<br>
		<br>
		<input type="submit" value="Sign in">
		<br><br>
	</form>
</div>

<?php
	if ($_SERVER["REQUEST_METHOD"] === "POST") {
		$userid = $_POST["userid"];
		$password = $_POST["password"];
		$resultz = "";

		// 6 digits if use username
		if (preg_match('/^\d{6}$/', $userid)) {
			if (strpos($_SERVER["SERVER_NAME"], "surgery.rama") !== false) {
				$wsdl="http://appcenter/webservice/patientservice.wsdl";
				$client = new SoapClient($wsdl);
				$resultx = $client->Get_staff_detail($userid, $password);
				$resulty = simplexml_load_string($resultx);
				$resultz = (string)$resulty->children()->children()->role;
			}
			elseif ($userid === "002717") {
				$resultz = "N";
			} else {
				$resultz = "S";
			}
		}

		if ($resultz === "S" || $resultz === "R") {
			include ("staff.html");
		}
		// 1 or 2 digits for each OR room
		elseif ($resultz === "N" || preg_match('/^\d{1,2}$/', $userid)) {
			include ("nurse.html");
		}
		// can't use localStorage, not supported in old browsers
		echo "<SCRIPT>start('$userid')</SCRIPT>";
	}
?>

</BODY>
</HTML>
