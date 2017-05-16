<?php
include "connect.php";

	$opdate = $_GET["opdate"];
	$hn = $_GET["hn"];
	$qn = $_GET["qn"];

	$wsdl="http://appcenter/webservice/patientservice.wsdl";
	$client = new SoapClient($wsdl);
	$resultx = $client->Get_ipd_detail($hn);
	$resulty = simplexml_load_string($resultx);
	while ($resulty->children())			//find last children
		$resulty = $resulty->children();
	$resultj = json_encode($resulty);		//use json encode-decode to
	$ipd = json_decode($resultj,true);		//convert XML to assoc array

	if (empty($ipd[admission_date])) {
		$ipd[admission_date] = null;
		$admit = null;
	} else {
		$admit = "'" . $ipd[admission_date] . "'";
	}
	if (empty($ipd[discharge_date])) {
		$ipd[discharge_date] = null;
		$discharge = null;
	} else {
		$discharge = "'" . $ipd[discharge_date] . "'";
	}
	$date1 = date_create($admit);
	$date2 = date_create($opdate);
	$diff = date_diff($date1, $date2);
	$datediff = $diff->format("%R%a");
	if (($datediff >=0) && ($datediff < 30)) {
		$query = $mysqli->query ("UPDATE book SET admit = '$admit', discharge = '$discharge' WHERE qn = $qn;");
		if (!$query)
			echo $mysqli->error . $sql;
		else
			echo ($ipd);
	}
?>
