<?php
require_once "book.php";

	$waitnum = $qsince = $hn = $staffname = $qn = $username = "";
	$opdate = '0000-00-00';

	$mysqli = new mysqli("localhost", "root", "zaq12wsx", "neurosurgery");
	if ($mysqli->connect_errno)
		exit("Connect failed: %s\n". $mysqli->connect_error);

	extract($_GET);

//$hn = "4935743";
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
	//$hn, $initial_name, $first_name, $last_name, $dob, $gender

	if (empty($resultz["first_name"]))
		echo "DBfailed ไม่มีผู้ป่วย hn นี้";
	else
	{
		$resultz["waitnum"] = $waitnum;
		$resultz["qsince"] = $qsince;
		$resultz["opdate"] = $opdate;
		$resultz["staffname"] = $staffname;
		$resultz["hn"] = $hn;
		$resultz["qn"] = $qn;
		$resultz["username"] = $username;
		echo newqn($resultz);
	}

function newqn($resultz)
{
	$mysqli = new mysqli("localhost", "root", "zaq12wsx", "neurosurgery");

	if ($mysqli->connect_errno)
		exit("DBfailed Connect failed: " . $mysqli->connect_error);

	extract($resultz);

	if ($qn)
	{
		$sql = "UPDATE book SET hn = '$hn', patient = '$initial_name";
		$sql = $sql."$first_name"." "."$last_name', dob = '$dob', ";
		$sql = $sql."gender = '$gender', editor = '$username' WHERE qn = $qn;";
	}
	else
	{
		$sql = "INSERT INTO book (waitnum, qsince, opdate, staffname, hn, patient, dob, gender, editor)"; 
		$sql = $sql."VALUES ($waitnum, '$qsince', $opdate, '$staffname', '$hn', '$initial_name";
		$sql = $sql."$first_name"." "."$last_name', '$dob', '$gender', '$username');";
	}

	$query = $mysqli->query ($sql);
	if (!$query)
		return $mysqli->error . $sql;
	else
		return json_encode(book($mysqli));
}
