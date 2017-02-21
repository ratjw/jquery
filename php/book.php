<?php
//	$mysqli = new mysqli("localhost", "root", "zaq12wsx", "neurosurgery");
//	if ($mysqli->connect_errno)
//		exit("Connect failed: %s\n". $mysqli->connect_error);
//	echo json_encode(book($mysqli));

function book($mysqli)
{
	date_default_timezone_set("Asia/Bangkok");

	$sql = "SELECT opdate, oproom, optime, staffname, hn,
		patient, dob, gender, diagnosis, treatment, tel, qn
		FROM book 
		WHERE opdate >= curdate()-interval 1 year AND waitnum IS NULL 
		GROUP BY qn ORDER BY opdate, staffname, qn;";
	$rowi = array();
	$data = array();
	$datu = array();
	$dati = array();
	$dats = array();
    if (!$result = $mysqli->query ($sql))
		return $mysqli->error;
	while ($rowi = $result->fetch_assoc())
	{
		$data[] = $rowi;
	}

	if ($result = $mysqli->query ("SELECT now();"))
		$datu = current($result->fetch_row());	//array.toString()

 	//waitnum = 0 are the deleted cases
	$sql = "SELECT IFNULL(waitnum, '') AS waitnum, opdate, oproom, optime,
		 staffname, hn, patient, dob, gender, diagnosis, treatment, tel, qn
		FROM book 
		WHERE waitnum > 0
		GROUP BY qn ORDER BY staffname, waitnum;";

	if (!$result = $mysqli->query ($sql))
		return $mysqli->error;
	while ($rowi = $result->fetch_assoc())
	{
		$dati[] = $rowi;
	}

	$sql = "SELECT code,name,specialty FROM staff ORDER BY code;";

	if (!$result = $mysqli->query ($sql))
		return $mysqli->error;
	while ($rowi = $result->fetch_assoc())
		$dats[] = $rowi;

	$allarray["BOOK"] = $data;
	$allarray["QTIME"] = $datu;
	$allarray["QWAIT"] = $dati;
	$allarray["STAFF"] = $dats;

	return $allarray;
}
