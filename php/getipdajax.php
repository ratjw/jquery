<?php
include "connect.php";

	$hn = $_GET["hn"];
	$qn = $_GET["qn"];

	$wsdl="http://appcenter/webservice/patientservice.wsdl";
	$client = new SoapClient($wsdl);
	$resultx = $client->Get_demographic_short($hn);
	$resulty = simplexml_load_string($resultx);
	while ($resulty->children())			//find last children
		$resulty = $resulty->children();
	$resultj = json_encode($resulty);		//use json encode-decode to make
	$ipd = json_decode($resultj,true);		//numeric array	into assoc array

	$admit = $ipd[admission_date];
	$discharge = $ipd[discharge_date];
	$query = $mysqli->query ("UPDATE book SET admit = '$admit', discharge = '$discharge' WHERE qn = $qn;")
	if (!$query)
		echo $mysqli->error . $sql;
	else
		echo ($ipd);
