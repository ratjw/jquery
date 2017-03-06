﻿<?php
include "connect.php";
require_once "book.php";

	$waitnum = $qsince = $hn = $staffname = $qn = $username = "";
	$opdate = '0000-00-00';

	extract($_GET);

	$wsdl="http://appcenter/webservice/patientservice.wsdl";
	$client = new SoapClient($wsdl);
	$resultx = $client->Get_demographic_short($hn);
	$resulty = simplexml_load_string($resultx);
	while ($resulty->children())
		$resulty = $resulty->children();	//numeric array
	$resultj = json_encode($resulty);		//use json encode-decode
	$resultz = json_decode($resultj,true);	//to make assoc array

	if (empty($resultz["first_name"]))
		exit ("DBfailed ไม่มีผู้ป่วย hn นี้");

	extract($resultz);

	if ($qn)
	{
		$sql = "UPDATE book SET hn = '$hn', patient = '$initial_name"."$first_name"." "."$last_name',";
		$sql = $sql." dob = '$dob', gender = '$gender', editor = '$username' ";
		$sql = $sql."WHERE qn = $qn;";
	}
	else
	{
		$sql = "INSERT INTO book (waitnum, qsince, opdate, staffname, hn, patient, dob, gender, editor) "; 
		$sql = $sql."VALUES ($waitnum, '$qsince', '$opdate', '$staffname', '$hn', ";
		$sql = $sql."'$initial_name"."$first_name"." "."$last_name', '$dob', '$gender', '$username');";
	}

	$query = $mysqli->query ($sql);
	if (!$query)
		echo $mysqli->error . $sql;
	else
		echo json_encode(book($mysqli));
