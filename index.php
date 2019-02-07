<!DOCTYPE html>
<HTML>
<HEAD>
<meta charset="utf-8"/>
<title>Neurosurgery Service</title>
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1">
<!--meta name="viewport" content="width=1024"-->

<link href="manifest.json" rel="manifest">
<style>
#logo { text-align:center; }

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

h4 {
	text-align: center;
	color: blue;	
}
</style>

<script src="login.js"></script>

</HEAD>
<BODY onload="login()">

<p id="logo"><img src="logoRama.png"></p>

<div id="login">
	<br>
	<h3>Neurosurgery Service</h3>

	<form id="form" method="post" action="login.php">
		Login ID: <input id="userid" type="text" name="userid"
					maxlength="6" size="6" value=""
					oninput="namesix()" 
					onpropertychange="namesix()">
		<br>
		<br>
		Password: <input id="pwd" type="password" name="pwd"
					maxlength="16" size="8" value="">
		<br>
		<br>
		<input type="submit" value="Sign in">
		<br>
		<br>
		<input type="hidden" name="browser" id="browser" />
	</form>
</div>

<h4> <?php echo (!empty($_GET['error']) ? $_GET['error'] : ''); ?> </h4>

</BODY>
</HTML>
