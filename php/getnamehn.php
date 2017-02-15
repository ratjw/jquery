<?php
require_once "book.php";

	$hn = $username = $waitnum = $staffname = "";

	$mysqli = new mysqli("localhost", "root", "zaq12wsx", "neurosurgery");
	if ($mysqli->connect_errno)
		exit("Connect failed: %s\n". $mysqli->connect_error);

	extract($_GET);

/*
	$waitnum="1";
	//$opdate="2014-07-23";
	//$staffname="001198";
	//$username="001198";
	//$hn = "4935743";
	//$qn = "";
	$resultz["initial_name"] = "Boy";
	$resultz["first_name"] = "ไทย";
	$resultz["last_name"] = "Surname";
	$resultz["dob"] = "2001-01-01";
	$resultz["gender"] = "M";
	$resultz["hn"] = $hn;
	$resultz["qn"] = $qn;
*/
	$wsdl="http://appcenter/webservice/patientservice.wsdl";
	$client = new SoapClient($wsdl);
	$resultx = $client->Get_demographic_short($hn);
	$resulty = simplexml_load_string($resultx);
	while ($resulty->children())
		$resulty = $resulty->children();	//numeric array
	$resultj = json_encode($resulty);		//use json encode-decode
	$resultz = json_decode($resultj,true);	//to make assoc array

	if (empty($resultz["first_name"]))
		echo "DBfailed ไม่มีผู้ป่วย hn นี้";
	elseif (empty($resultz["initial_name"]))
		echo "DBfailed Record devoided for this hn";
	elseif (empty($resultz["dob"]))
		echo "DBfailed No dob for this hn";
	else
	{
		newqn($resultz, $opdate, $username, $waitnum, $staffname);
		echo json_encode(book($mysqli));
	}

function newqn($resultz, $opdate, $username, $waitnum, $staffname)
{
	$mysqli = new mysqli("localhost", "root", "zaq12wsx", "neurosurgery");

	if ($mysqli->connect_errno)
		exit("DBfailed Connect failed: " . $mysqli->connect_error);

	$qn = 0;

	extract($resultz);	//$hn, $initial_name, $first_name, $last_name, $dob, $gender, $qn

	if ($waitnum)
	{
		$sql = "INSERT INTO book (waitnum, opdate, staffname, hn, patient, dob, gender, editor) ";
		$sql = $sql."VALUES ($waitnum, '$opdate', '$staffname', '$hn', '$initial_name'";
		$sql = $sql."'$first_name'"." "."'$last_name', '$dob', '$gender', '$username');";
	}
	else
	{
		$sql = "INSERT INTO book (opdate, staffname, hn, patient, dob, gender, editor)"; 
		$sql = $sql."VALUES ('$opdate', '$staffname', '$hn', '$initial_name', ";
		$sql = $sql."'$first_name'"." "."'$last_name', '$dob', '$gender', '$username');";
	}

	$query = $mysqli->query ($sql);
	if (!$query)
		return "DBfailed to $sql " . $mysqli->error;
}
