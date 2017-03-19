<?php
//	$mysqli = new mysqli("localhost", "root", "zaq12wsx", "neurosurgery");
//	if ($mysqli->connect_errno)
//		exit("Connect failed: %s\n". $mysqli->connect_error);
//	echo json_encode(book($mysqli));

 	//waitnum = null :: deleted cases
	//waitnum = 0 :: never in waitnum list
	//waitnum > 0 :: is being or has been in waiting list
	//qsince new case  from Javascript new Date()
	//qsince is never changed

function book($mysqli)
{
	date_default_timezone_set("Asia/Bangkok");

	$rowi = array();
	$case = array();
	$time = array();
	$wait = array();
	$staff = array();

	$sql = "SELECT * FROM book 
		WHERE opdate >= curdate()-interval 1 year AND waitnum IS NOT NULL
		ORDER BY opdate, waitnum, staffname;";

	if (!$result = $mysqli->query ($sql))
		return $mysqli->error;
	while ($rowi = $result->fetch_assoc())
	{
		$case[] = $rowi;
	}

	if ($result = $mysqli->query ("SELECT now();"))
		$time = current($result->fetch_row());	//array.toString()
/*
	$sql = "SELECT * FROM book 
		WHERE waitnum > 0 AND opdate = '0000-00-00'
		ORDER BY staffname, waitnum;";

	if (!$result = $mysqli->query ($sql))
		return $mysqli->error;
	while ($rowi = $result->fetch_assoc())
	{
		$wait[] = $rowi;
	}
*/

	$sql = "SELECT * FROM staff;";

	if (!$result = $mysqli->query ($sql))
		return $mysqli->error;
	while ($rowi = $result->fetch_assoc())
		$staff[] = $rowi;

	$allarray["BOOK"] = $case;
	$allarray["QTIME"] = $time;
//	$allarray["QWAIT"] = $wait;
	$allarray["STAFF"] = $staff;

	return $allarray;
}
