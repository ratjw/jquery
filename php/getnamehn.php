<?php
include "connect.php";
require_once "book.php";

	$hn = $staffname = $qn = $username = "";
	$qsince = $opdate = '0000-00-00';

	extract($_GET);

	$wsdl="http://appcenter/webservice/patientservice.wsdl";
	$client = new SoapClient($wsdl);
	$resultx = $client->Get_demographic_short($hn);
	$resulty = simplexml_load_string($resultx);
	while ($resulty->children())
		$resulty = $resulty->children();	//numeric array
	$resultj = json_encode($resulty);		//use json encode-decode
	$resultz = json_decode($resultj,true);	//to make assoc array

	if (empty($resultz["initial_name"]))
		$resultz["initial_name"] = "";
	if (empty($resultz["first_name"]))
		exit ("DBfailed ไม่มีผู้ป่วย hn นี้");
	if (empty($resultz["last_name"]))
		$resultz["last_name"] = "";
	if (empty($resultz["dob"]))
		$resultz["dob"] = "0000-00-00";
	if (empty($resultz["gender"]))
		$resultz["gender"] = "";

	extract($resultz);

	if ($qn)	//existing row, just update patient's name. waitnum not concern
	{
		$sql = "UPDATE book SET hn = '$hn', patient = '$initial_name"."$first_name"." "."$last_name',";
		$sql = $sql." dob = '$dob', gender = '$gender', editor = '$username' ";
		$sql = $sql."WHERE qn = $qn;";
	}
	else	//new row, if from '#queuetbl' -> has waitnum
	{		//new row, if from '#tbl' -> no waitnum (default = 1 in database)
		if ($waitnum) {
			$sql = "INSERT INTO book (waitnum, qsince, opdate, staffname, hn, patient, dob, gender, editor) "; 
			$sql = $sql."VALUES ($waitnum, '$qsince', '$opdate', '$staffname', '$hn', ";
			$sql = $sql."'$initial_name"."$first_name"." "."$last_name', '$dob', '$gender', '$username');";
		} else {
			$sql = "INSERT INTO book (qsince, opdate, staffname, hn, patient, dob, gender, editor) "; 
			$sql = $sql."VALUES ('$qsince', '$opdate', '$staffname', '$hn', ";
			$sql = $sql."'$initial_name"."$first_name"." "."$last_name', '$dob', '$gender', '$username');";
		}

	$query = $mysqli->query ($sql);
	if (!$query)
		echo $mysqli->error . $sql;
	else
		echo json_encode(book($mysqli));
