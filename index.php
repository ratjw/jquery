<!DOCTYPE html>
<HTML>
<HEAD>
<meta charset="utf-8"/>
<title>Neurosurgery Service</title>
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1">

<link href="css/jquery-ui.min.css" rel="stylesheet">
<style>
#login {
	width: 300px; 
	margin-top: 0px;
	margin-left: auto; 
	margin-right: auto; 
	text-align: center;
	color: white;
	background: #306ab5;
	background: radial-gradient(at bottom left, #152f51, #1b3b65, #25528d, #306ab5, #ebf1fa);
	border-radius: 10px;
	box-shadow: -20px 30px 40px slategray;
}

input[type=submit] {
	background: #c4445C;
	background: linear-gradient(#f8d3e4, #AC1B5C, #580e2f);
	border-radius: 5px;
	color: white;
	height: 30px;
}
</style>

<script src="js/jquery-1.12.4.min.js"></script>
<script src="js/jquery.mousewheel.min.js"></script>
<script src="js/jquery-ui.min.js"></script>

<script>
function namesix()
{
	var userid = document.getElementById("userid").value
	if (/^\d{6}$/.test(userid)) {
		document.getElementById("password").focus()
	}
}
</script>
</HEAD>
<BODY>
<p id="logo" style="text-align:center;">
	<img width="170" height="150" src="css/pic/logoRama.png">
</p>

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

		// can't use localStorage, old browsers do not support
		echo "<SCRIPT>Start('$userid')</SCRIPT>";
	}
?>

</BODY>
</HTML>
