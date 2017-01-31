<?php
//	$mysqli = new mysqli("localhost", "root", "zaq12wsx", "neurosurgery");
//	if ($mysqli->connect_errno)
//		exit("Connect failed: %s\n". $mysqli->connect_error);
//	echo json_encode(seou($mysqli));

function seou($mysqli)
{
	date_default_timezone_set("Asia/Bangkok");

	$rowi = array();
	$data = array();

	$result = $mysqli->query ("SELECT code,name,specialty FROM staff ORDER BY code;");
	if (!$result)
		exit ('failed:load staff list ' . $mysqli->error);
	while ($rowi = $result->fetch_row())
		$data["staff"][] = $rowi;

	$result = $mysqli->query ("SELECT room,specialty FROM orlist;");
	if (!$result)
	    exit ('failed:load OR list ' . $mysqli->error);
	while ($rowi = $result->fetch_row())
		$data["or"][] = $rowi;
/*
	$sql = "SELECT consult.opdate AS opdate,
			GROUP_CONCAT(staff.name ORDER BY staff.code SEPARATOR ' /') AS consult
			FROM consult LEFT JOIN staff ON staff.code = consult.staff 
			WHERE consult.opdate >= curdate()-interval 3 month 
			GROUP BY opdate ORDER BY opdate;";
	if (!($result = $mysqli->query ($sql)))
	    exit ('failed:load consult ' . $mysqli->error);
	while ($rowi = $result->fetch_assoc())
		$data["consult"][] = $rowi;

	$sql = "SELECT absent.opdate AS opdate,
			GROUP_CONCAT(staff.name SEPARATOR ' ') AS absent 
			FROM absent LEFT JOIN staff ON staff.code = absent.staff 
			WHERE absent.opdate >= curdate()-interval 3 month 
			GROUP BY opdate ORDER BY opdate;";
	if (!$result = $mysqli->query ($sql))
	    exit ('failed:load absent ' . $mysqli->error);
	while ($rowi = $result->fetch_assoc())
		$data["absent"][] = $rowi;
*/
	$result->free(); ////chok edit
    /* free result set */

	$soca["SOCA"] = $data;
    return $soca;
}
