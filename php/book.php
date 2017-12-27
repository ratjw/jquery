<?php
//	$mysqli = new mysqli("localhost", "root", "Zaq1@wsx", "neurosurgery");
//	if ($mysqli->connect_errno)
//		exit("Connect failed: %s\n". $mysqli->connect_error);
//	echo json_encode(book($mysqli));

	//waitnum < 0		//consult cases
	//waitnum = 0		//Staff on-call
	//waitnum > 0		//booking cases
	//waitnum = null	//deleted cases 

function book($mysqli, $init)
{
	date_default_timezone_set("Asia/Bangkok");

	$rowi = array();
	$case = array();
	$cons = array();
	$time = array();
	$wait = array();
	$staff = array();

	$sql = "SELECT * FROM book 
			WHERE opdate >= DATE_FORMAT(CURDATE()-INTERVAL 1 MONTH,'%Y-%m-01') AND waitnum > 0
			ORDER BY opdate, oproom='', oproom, optime, waitnum;";
			//The oproom='' will be 0 for cases with an oproom and 1 with no oproom.
			//As the default sort order is ASC, non-blank items are now placed first.

	if (!$result = $mysqli->query ($sql)) {
		return $mysqli->error;
	}
	while ($rowi = $result->fetch_assoc()) {
		$case[] = $rowi;
	}

	if ($init) {
		// Also get staff oncall waitnum=0
		$sql = "SELECT * FROM book 
				WHERE opdate >= DATE_FORMAT(CURDATE()-INTERVAL 1 MONTH,'%Y-%m-01') AND waitnum <= 0
				ORDER BY opdate, oproom='', oproom, optime, waitnum DESC;";
	} else {
		$sql = "SELECT * FROM book 
				WHERE opdate >= DATE_FORMAT(CURDATE()-INTERVAL 1 MONTH,'%Y-%m-01') AND waitnum < 0
				ORDER BY opdate, oproom='', oproom, optime, waitnum DESC;";
				//Consults cases have negative waitnum.
				//Greater waitnum (less negative) are placed first
	}

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
