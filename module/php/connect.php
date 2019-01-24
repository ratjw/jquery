<?php

	$servername = "localhost";
	$username = "root";
	$password = "Zaq1@wsx";
	$dbname = "neurosurgery";

	$mysqli = new mysqli($servername, $username, $password, $dbname);
	$mysqli->query("SET CHARACTER SET utf8mb4");

	if ($mysqli->connect_errno)
		exit("Connect failed: %s\n". $mysqli->connect_error);
