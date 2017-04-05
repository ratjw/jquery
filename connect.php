<?php

	$mysqli = new mysqli("localhost", "surgery_neuro", "3g5sK4Mcek", "surgery_neurodb");
	$mysqli->query("SET CHARACTER SET utf8");

	if ($mysqli->connect_errno)
		exit("Connect failed: %s\n". $mysqli->connect_error);
		