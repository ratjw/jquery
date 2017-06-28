﻿<?php
include "connect.php";
require_once "book.php";

	$hn = $staffname = $qn = $username = $oldqn = "";

	extract($_GET);

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
		exit ("DBfailed ไม่มีผู้ป่วย hn นี้");			//Error exit 1
	if (empty($resultz["last_name"]))
		$resultz["last_name"] = "";
	if (empty($resultz["dob"]))
		$resultz["dob"] = "";
	if (empty($resultz["gender"]))
		$resultz["gender"] = "";

	extract($resultz);

	$query = $mysqli->query ("SELECT MAX(qn) FROM book WHERE hn = $hn");
	if (!$query) {
		exit $mysqli->error . $sql;			//Error exit 2
	}
	$oldqn = $query->fetch_row();

	$query = $mysqli->query ("SELECT staffname,diagnosis,treatment,contact 
								FROM book WHERE qn = $oldqn");
	if (!$query) {
		exit $mysqli->error . $sql;			//Error exit 3
	}
	$oldpatient = $query->fetch_assoc();
	$staffname = $oldpatient["staffname"];
	$diagnosis = $oldpatient["diagnosis"];
	$treatment = $oldpatient["treatment"];
	$contact = $oldpatient["contact"];

	if ($qn)	//existing row
	{
		if ($dob) {	//dob must be date format or null
			$sql = "UPDATE book 
					SET hn = '$hn', 
						staffname = CASE WHEN staffname = '' THEN '$staffname' END,
						patient = '$initial_name$first_name $last_name',
						dob = '$dob', 
						gender = '$gender', 
						diagnosis = '$diagnosis',
						treatment = '$treatment',
						contact = '$contact',
						editor = '$username' 
					WHERE qn = $qn;";
		} else {
			$sql = "UPDATE book 
					SET hn = '$hn', 
						staffname = CASE WHEN staffname = '' THEN '$staffname' END,
						patient = '$initial_name$first_name $last_name',
						gender = '$gender', 
						diagnosis = '$diagnosis',
						treatment = '$treatment',
						contact = '$contact',
						editor = '$username' 
					WHERE qn = $qn;";
		}
	}
	else
	{			//new row has waitnum
		if ($dob) {	//dob must be date format or null
			$sql = "INSERT INTO book (
						waitnum, 
						opdate, 
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
						'$staffname', 
						'$hn', 
						'$initial_name$first_name $last_name', 
						'$dob', 
						'$gender', 
						'$diagnosis',
						'$treatment',
						'$contact',
						'$username');";
		} else {
			$sql = "INSERT INTO book (
						waitnum, 
						opdate, 
						staffname, 
						hn, 
						patient, 
						gender, 
						diagnosis,
						treatment,
						contact,
						editor) 
					VALUES (
						$waitnum, 
						'$opdate', 
						'$staffname', 
						'$hn', 
						'$initial_name$first_name $last_name', 
						'$gender', 
						'$diagnosis',
						'$treatment',
						'$contact',
						'$username');";
		}
	}

	$query = $mysqli->query ($sql);
	if (!$query)
		echo $mysqli->error . $sql;
	else
		echo json_encode(book($mysqli));
