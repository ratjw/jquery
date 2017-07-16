<?php
//	$mysqli = new mysqli("localhost", "root", "zaq12wsx", "neurosurgery");
//	if ($mysqli->connect_errno)
//		exit("Connect failed: %s\n". $mysqli->connect_error);
//	echo json_encode(book($mysqli));

	//waitnum = 0		//new case consult
	//waitnum = 1		//new case surgery
	//waitnum > 0		//next cases
	//waitnum = null	//deleted cases 

function book($mysqli)
{
	date_default_timezone_set("Asia/Bangkok");

	$rowi = array();
	$case = array();
	$cons = array();
	$time = array();
	$wait = array();
	$staff = array();

	$sql = "SELECT * FROM book 
		WHERE opdate >= curdate()-interval 1 year AND waitnum > 0
		ORDER BY opdate, oproom, optime, waitnum;";

	if (!$result = $mysqli->query ($sql)) {
		return $mysqli->error;
	}
	while ($rowi = $result->fetch_assoc()) {
		$case[] = $rowi;
	}

	$sql = "SELECT * FROM book 
		WHERE opdate >= curdate()-interval 2 month AND waitnum < 0
		ORDER BY opdate, oproom, optime, waitnum DESC;";

	if (!$result = $mysqli->query ($sql)) {
		return $mysqli->error;
	}
	while ($rowi = $result->fetch_assoc()) {
		$cons[] = $rowi;
	}

	if ($result = $mysqli->query ("SELECT now();")) {
		$time = current($result->fetch_row());	//array.toString()
	}

	$allarray["BOOK"] = $case;
	$allarray["CONSULT"] = $cons;
	$allarray["QTIME"] = $time;

	return $allarray;
}
