<?php
//	$mysqli = new mysqli("localhost", "root", "zaq12wsx", "neurosurgery");
//	if ($mysqli->connect_errno)
//		exit("Connect failed: %s\n". $mysqli->connect_error);
//	echo json_encode(book($mysqli));

	//waitnum new case = 1
	//waitnum > 0
	//waitnum = null for deleted cases 
	//since new case = new Date()
	//since is never changed

function book($mysqli)
{
	date_default_timezone_set("Asia/Bangkok");

	$rowi = array();
	$case = array();
	$time = array();
	$wait = array();
	$staff = array();

	$sql = "SELECT * FROM book 
		WHERE opdate >= curdate()-interval 1 year AND waitnum > 0
		ORDER BY opdate, waitnum;";

	if (!$result = $mysqli->query ($sql))
		return $mysqli->error;
	while ($rowi = $result->fetch_assoc())
	{
		$case[] = $rowi;
	}

	if ($result = $mysqli->query ("SELECT now();"))
		$time = current($result->fetch_row());	//array.toString()
/*
	$sql = "SELECT * FROM staff;";

	if (!$result = $mysqli->query ($sql))
		return $mysqli->error;
	while ($rowi = $result->fetch_assoc())
		$staff[] = $rowi;
*/
	$allarray["BOOK"] = $case;
	$allarray["QTIME"] = $time;
//	$allarray["STAFF"] = $staff;

	return $allarray;
}
