<?php
include "connect.php";
require_once "book.php";

	$hn = "";
	$initial_name = "นาย";
	$first_name = "สมชาย";
	$last_name = "นามสกล";
	$dob = "1991-01-01";
	$gender = "M";
	$staffname = "";
	$qn = "";
	$username = "";
	$oproom = "";
	$optime = "";
	$staffname = "";
	$diagnosis = "";
	$treatment = "";
	$contact = "";

	extract($_GET);
/*
	$wsdl="http://appcenter/webservice/patientservice.wsdl";
	$client = new SoapClient($wsdl);
	$resultx = $client->Get_demographic_short($hn);
	$resulty = simplexml_load_string($resultx);
	while ($resulty->children())			//find last children
		$resulty = $resulty->children();
	$resultj = json_encode($resulty);		//use json encode-decode to make
	$resultz = json_decode($resultj,true);	//numeric array	into assoc array

	if (empty($resultz["initial_name"]))
		$resultz["initial_name"] = "";
	if (empty($resultz["first_name"]))
		exit ("DBfailed ไม่มีผู้ป่วย hn นี้");		//Error exit 1
	if (empty($resultz["last_name"]))
		$resultz["last_name"] = "";
	if (empty($resultz["dob"]))
		$resultz["dob"] = "";
	if (empty($resultz["gender"]))
		$resultz["gender"] = "";

	extract($resultz);
*/
	$sql = "SELECT MAX(qn) FROM book WHERE hn = $hn AND waitnum IS NOT NULL;";
	$query = $mysqli->query ($sql);
	if ($query) {
		$oldqn = $query->fetch_row();		//Array
		$oldqn = $oldqn[0];
		if ($oldqn) {
			$sql = "SELECT staffname,diagnosis,treatment,contact FROM book WHERE qn = $oldqn;";
			$query = $mysqli->query ($sql);
			if ($query) {
				$oldpatient = $query->fetch_assoc();
				$staffname = $oldpatient["staffname"];
				$diagnosis = $oldpatient["diagnosis"];
				$treatment = $oldpatient["treatment"];
				$contact = $oldpatient["contact"];
			}
		}
	}

	if ($qn)	//existing row, ignore waitnum
	{
		$sql = "UPDATE book 
				SET staffname = CASE WHEN staffname = '' THEN '$staffname' ELSE staffname END,
					hn = '$hn', 
					patient = '$initial_name$first_name $last_name',
					dob = CASE WHEN $dob <> '' THEN '$dob' ELSE dob END,
					gender = '$gender', 
					diagnosis = '$diagnosis',
					treatment = '$treatment',
					contact = '$contact',
					editor = '$username' 
				WHERE qn = $qn;";
	}
	else
	{			//new row, insert waitnum, opdate, oproom, optime
		$sql = "INSERT INTO book (
					waitnum, 
					opdate, 
					oproom, 
					optime, 
					staffname, 
					hn, 
					patient, 
					dob, 
					gender,
					diagnosis,
					treatment,
					contact,
					editor) 
				VALUES (
					$waitnum, 
					'$opdate', 
					'$oproom', 
					'$optime', 
					'$staffname', 
					'$hn', 
					'$initial_name$first_name $last_name', 
					CASE WHEN $dob <> '' THEN '$dob' ELSE dob END, 
					'$gender', 
					'$diagnosis',
					'$treatment',
					'$contact',
					'$username');";
	}

	$query = $mysqli->query ($sql);
	if (!$query)
		echo $mysqli->error . $sql;
	else
		echo json_encode(book($mysqli));
