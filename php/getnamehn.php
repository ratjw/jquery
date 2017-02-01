<?php
	$hn = $username = $waitnum = $staffname = "";

	extract($_GET);

	$host = "appcenter/webservice/patientservice.wsdl";
	if($socket =@ fsockopen($host, 80, $errno, $errstr, 30)) {
		fclose($socket);
		$wsdl="http://appcenter/webservice/patientservice.wsdl";
		$client = new SoapClient($wsdl);
		$resultx = $client->Get_demographic_short($hn);
		$resulty = simplexml_load_string($resultx);
		while ($resulty->children())
			$resulty = $resulty->children();	//numeric array
		$resultj = json_encode($resulty);		//use json encode-decode
		$resultz = json_decode($resultj,true);	//to make assoc array
	} else {
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
	}

	$mysqli = new mysqli("localhost", "root", "zaq12wsx", "neurosurgery");
	if ($mysqli->connect_errno)
		exit("Connect failed: %s\n". $mysqli->connect_error);

	$resultz["hn"] = $hn;
	$resultz["qn"] = $qn;

	if (empty($resultz["first_name"]))
		echo "DBfailed ไม่มีผู้ป่วย hn นี้";
	elseif (empty($resultz["initial_name"]))
		echo "DBfailed Record devoided for this hn";
	elseif (empty($resultz["dob"]))
		echo "DBfailed No dob for this hn";
	else
		echo json_encode(newqn($resultz, $opdate, $username, $waitnum, $staffname));

function newqn($resultz, $opdate, $username, $waitnum, $staffname)
{
	$mysqli = new mysqli("localhost", "root", "zaq12wsx", "neurosurgery");

	if ($mysqli->connect_errno)
		exit("DBfailed Connect failed: " . $mysqli->connect_error);

	$qn = 0;
	extract($resultz);	//$hn, $initial_name, $first_name, $last_name, $dob, $gender, $qn
//echo "..".$qn."..";
//exit;
//$qn=3;
	if ($qn)
	{
		$sql = "UPDATE book SET hn='$hn', patient='$initial_name"."$first_name"." "."$last_name',";
		$sql = $sql."dob='$dob', gender='$gender' WHERE qn=$qn;";
		$query = $mysqli->query ($sql);
		if (!$query)
			return "DBfailed to $sql " . $mysqli->error;
	}
	else
	{
		$sql = "INSERT INTO book (opdate, staffname, hn, patient, dob, gender, editor)"; 
		$sql = $sql."VALUES ('$opdate', '$staffname', '$hn', '$initial_name"."$first_name"." "."$last_name',";
		$sql = $sql."'$dob', '$gender', '$username');";
		$query = $mysqli->query ($sql);
		if (!$query)
			return "DBfailed to $sql " . $mysqli->error;
	}
/*
	else if ($waitnum)
	{
		$sql = "UPDATE book SET waitnum=waitnum+1 WHERE waitnum>=$waitnum AND staffname='$staffname';";
		$query = $mysqli->query ($sql);
		if (!$query)
			return 'DBfailed to re-sequence ' . $mysqli->error;
		$sql = "INSERT INTO book (waitnum, opdate, staffname, hn, 
			patient, dob, gender, editor) values ($waitnum, $opdate, $staffname, $hn, 
			$initial_name.$first_name."  ".$last_name, $dob, $gender, $username);";
	}
*/
	//for callbackgetName(response)
	$resultz["qn"] = $mysqli->insert_id;	//LAST_INSERT_ID() of mysql

	$mysqli->close();
	return $resultz;
}
