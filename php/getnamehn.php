<?php
include "connect.php";
require_once "book.php";

	$hn = $staffname = $qn = $username = "";

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
		exit ("DBfailed ไม่มีผู้ป่วย hn นี้");
	if (empty($resultz["last_name"]))
		$resultz["last_name"] = "";
	if (empty($resultz["dob"]))
		$resultz["dob"] = "";
	if (empty($resultz["gender"]))
		$resultz["gender"] = "";

	extract($resultz);

	if ($qn)	//existing row
	{
		if ($dob) {
			$sql = "UPDATE book SET hn = '$hn', patient = '$initial_name$first_name $last_name',
					dob = '$dob', gender = '$gender', editor = '$username' WHERE qn = $qn;";
		} else {
			$sql = "UPDATE book SET hn = '$hn', patient = '$initial_name$first_name $last_name',
					gender = '$gender', editor = '$username' WHERE qn = $qn;";
		}
	}
	else
	{			//new row has waitnum
		if ($dob) {
			$sql = "INSERT INTO book (waitnum, opdate, staffname, hn, patient, dob, gender, editor) 
					VALUES ($waitnum, '$opdate', '$staffname', '$hn', 
					'$initial_name$first_name $last_name', '$dob', '$gender', '$username');";
		} else {
			$sql = "INSERT INTO book (waitnum, opdate, staffname, hn, patient, gender, editor) 
					VALUES ($waitnum, '$opdate', '$staffname', '$hn', 
					'$initial_name$first_name $last_name', '$gender', '$username');";
		}
	}

	$query = $mysqli->query ($sql);
	if (!$query)
		echo $mysqli->error . $sql;
	else
		echo json_encode(book($mysqli));
