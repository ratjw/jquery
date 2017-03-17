<?php

	$mysqli = new mysqli("localhost", "root", "zaq12wsx", "neurosurgery");
	//$mysqli->query("SET CHARACTER SET utf8");

	if ($mysqli->connect_errno)
		exit("Connect failed: %s\n". $mysqli->connect_error);
		