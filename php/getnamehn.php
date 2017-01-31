<?php
	$opdate = $hn = $username = $waitnum = $staffname = "";

//$waitnum="1";
//$opdate="2014-07-23";
//$staffname="001198";
//$username="001198";
//$hn = "4935743";
//$qn = "";
//$resultz["initial_name"] = "Boy";
//$resultz["first_name"] = "ไทย";
//$resultz["last_name"] = "Surname";
//$resultz["dob"] = "2001-01-01";
//$resultz["gender"] = "M";

	extract($_GET);

	if (!isset($hn))	//name selected by client from name list
	{
		$resultz = json_decode($select,true);
		echo json_encode(newqn($resultz, $opdate, $username, $waitnum, $staffname));
	}
	elseif (ctype_digit($hn))
	{
		$mysqli = new mysqli("localhost", "root", "zaq12wsx", "neurosurgery");
		if ($mysqli->connect_errno)
			exit("Connect failed: %s\n". $mysqli->connect_error);
		$result = $mysqli->query ("SELECT * FROM patient WHERE hn='$hn';");
		if (!$result || !($resultz = $result->fetch_assoc()))
		{
			$wsdl="http://appcenter/webservice/patientservice.wsdl";
		$client = new SoapClient($wsdl);
			$resultx = $client->Get_demographic_short($hn);
			$resulty = simplexml_load_string($resultx);
			while ($resulty->children())
				$resulty = $resulty->children();	//numeric array
			$resultj = json_encode($resulty);		//use json encode-decode
			$resultz = json_decode($resultj,true);	//to make assoc array
			$resultz["hn"] = $hn;
		}
		if (empty($resultz["first_name"]))
			echo "DBfailed ไม่มีผู้ป่วย hn นี้";
		elseif (empty($resultz["initial_name"]))
			echo "DBfailed Record devoided for this hn";
		elseif (empty($resultz["dob"]))
			echo "DBfailed No dob for this hn";
		else
			echo json_encode(newqn($resultz, $opdate, $username, $waitnum, $staffname));
	}
	else
	{
		$wsdl="http://appcenter/webservice/patientservice.wsdl";
		$client = new soapclient($wsdl);
		$resultx = $client->Get_demographic_shortByName($hn);
		$resulty = simplexml_load_string($resultx);
		$resulti = array();
		foreach ($resulty->children() as $resultz)
		{
			$resulth = $resultz->children();
			if ($resulth[1] == "")
				continue;	//no "initial_name", the record was destroyed
			else
				$resulti[] = $resultz;
		}
		$count = count($resulti);
		$result = array();
		for ($i=0; $i<$count; $i++)
		{
			if ($i < 100)
				$result[] = $resulti[$i];
			else
				exit ("DBfailed <พบผู้ป่วยชื่อนี้ $count ราย>");
		}
		echo json_encode($result);	//send to client to select a name
	}

function newqn($resultz, $opdate, $username, $waitnum, $staffname)
{
	$hn = "";

	$mysqli = new mysqli("localhost", "root", "zaq12wsx", "neurosurgery");

	if ($mysqli->connect_errno)
		exit("DBfailed Connect failed: " . $mysqli->connect_error);

	extract($resultz);	//$hn, $initial_name, $first_name, $last_name, $dob, $gender

	$sql = "INSERT INTO qbook SET opdate='$opdate', staffname='$staffname', hn='$hn', editor='$username';";
	if ($waitnum)
	{
		$sql = "UPDATE qbook SET waitnum=waitnum+1 WHERE waitnum>=$waitnum AND staffname='$staffname';";
		$query = $mysqli->query ($sql);
		if (!$query)
			return 'DBfailed to re-sequence ' . $mysqli->error;
		$sql = "INSERT INTO qbook SET waitnum=$waitnum, opdate='$opdate', staffname='$staffname', hn='$hn', editor='$username';";
	}
	$query = $mysqli->query ($sql);
	if (!$query)
		return "DBfailed to $sql " . $mysqli->error;

	//for callbackgetName(response)
	$resultz["qn"] = $mysqli->insert_id;	//LAST_INSERT_ID() of mysql

	//below is to update patient and patientoldname
	$rowi = array();
	if (!($rename = $mysqli->query ("SELECT * FROM patient WHERE hn='$hn';")))
		return "DBfailed to $sql " . $mysqli->error;

	if ($rename->num_rows)
	{
		$rowi[] = $rename->fetch_assoc();
		if ($rowi[0]["initial_name"] != $initial_name || 
			$rowi[0]["first_name"] != $first_name || 
			$rowi[0]["last_name"] != $last_name || 
			$rowi[0]["dob"] != $dob ||
			$rowi[0]["gender"] != $gender)
		{	//same HN diff name
			$s = "INSERT INTO patientoldname SELECT * FROM patient WHERE hn='$hn';";
			if ($rename = $mysqli->query ($s))	//backup old name
			{
				$resultz["oldname"] = 'Success copy to old name\n' . $mysqli->affected_rows;
				$s = "UPDATE patient SET initial_name='$initial_name',first_name='$first_name',
						last_name='$last_name',dob='$dob',gender='$gender' WHERE hn='$hn';";
				if ($newname = $mysqli->query ($s))	//update to new name
					$resultz["rename"] = 'Success update patient profile\n' . $mysqli->affected_rows;
				else
					$resultz["rename"] = 'DBfailed update patient name\n' . $mysqli->error;
			}
			else
			{
				$resultz["oldname"] = 'DBfailed copy to old name\n' . $mysqli->error;
			}
		}
	}
	else
	{
		$s = "INSERT INTO patient VALUES ('$hn','$initial_name','$first_name','$last_name','$dob','$gender');";
		$newname = $mysqli->query ($s);
		if ($newname)
			$resultz["newname"] = 'Success add new name\n' . $mysqli->affected_rows;
		else
			$resultz["newname"] = 'DBfailed add new name\n' . $mysqli->error;
	}
	$mysqli->close();
	return $resultz;
}
