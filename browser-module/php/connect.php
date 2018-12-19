<?php
//	@session_start($_POST["sid"]);

//	$userid = empty($_SESSION['userid']) ? '' : $_SESSION['userid'];

//	if (!preg_match('/^\d{6}$/', $userid)) {
//		echo "Unauthorized user!!!";
//		exit;
//	}

	$servername = "localhost";
	$username = "root";
	$password = "Zaq1@wsx";
	$dbname = "neurosurgery";

	$mysqli = new mysqli($servername, $username, $password, $dbname);
	$mysqli->query("SET CHARACTER SET utf8mb4");

	if ($mysqli->connect_errno)
		exit("Connect failed: %s\n". $mysqli->connect_error);
